/**
 * Shared API client: baseURL, Bearer injection, 401 + refresh retry, normalized errors.
 * Uses tokenProvider (set by auth) for authenticated requests. No token for public endpoints.
 */

import { API_BASE_URL } from "@/api/constants";
import { AUTH_PATHS } from "@/api/constants";
import { getTokenProvider } from "@/api/tokenProvider";

export interface ApiError {
  status: number;
  message: string;
  /** Validation errors: field -> list of messages */
  details?: Record<string, string[]>;
}

export interface RequestConfig {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  /** Use FormData as-is (e.g. file uploads); do not JSON.stringify body */
  formData?: FormData;
  /** Do not attach Authorization or attempt refresh (for login, register, etc.) */
  skipAuth?: boolean;
  headers?: Record<string, string>;
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  const status = res.status;
  let message = res.statusText || "Request failed";
  let details: Record<string, string[]> | undefined;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const data = await res.json();
      if (typeof data === "object") {
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (typeof data.error === "string") {
          message = data.error;
        } else if (typeof data.message === "string") {
          message = data.message;
        } else if (Array.isArray(data.non_field_errors)) {
          message = data.non_field_errors[0] ?? message;
        } else {
          const fieldErrors: Record<string, string[]> = {};
          for (const [k, v] of Object.entries(data)) {
            if (Array.isArray(v)) {
              fieldErrors[k] = v.map((x) => String(x));
            } else if (typeof v === "string") {
              fieldErrors[k] = [v];
            }
          }
          if (Object.keys(fieldErrors).length > 0) {
            details = fieldErrors;
            message = Object.values(fieldErrors).flat().join(" ") || message;
          }
        }
      }
    } catch {
      // keep default message
    }
  }

  return { status, message, details };
}

async function doRequest<T>(
  url: string,
  config: RequestConfig,
  accessToken: string | null
): Promise<{ data: T; res: Response }> {
  const headers: Record<string, string> = {
    ...config.headers,
  };
  if (!config.formData) {
    headers["Content-Type"] = "application/json";
  }
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const init: RequestInit = {
    method: config.method,
    headers,
    credentials: "include",
  };
  if (config.formData) {
    init.body = config.formData;
  } else if (config.body !== undefined && config.body !== null) {
    init.body = JSON.stringify(config.body);
  }

  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw err;
  }

  if (res.status === 204) {
    return { data: undefined as T, res };
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    return { data, res };
  }
  return { data: undefined as T, res };
}

export async function request<T>(config: RequestConfig): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${config.path}`;
  const provider = getTokenProvider();
  const skipAuth = config.skipAuth === true;
  const accessToken: string | null = skipAuth ? null : (provider?.getAccessToken() ?? null);

  try {
    const { data } = await doRequest<T>(url, config, accessToken);
    return data;
  } catch (err) {
    const apiErr = err as ApiError;
    if (apiErr.status === 401 && !skipAuth && provider) {
      const refresh = provider.getRefreshToken();
      if (refresh) {
        try {
          const refreshRes = await fetch(
            `${API_BASE_URL.replace(/\/$/, "")}${AUTH_PATHS.tokenRefresh}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ refresh }),
            }
          );
          if (refreshRes.ok) {
            const json = await refreshRes.json();
            const newAccess = json.access;
            if (newAccess) {
              provider.setAccessToken(newAccess);
              const retry = await doRequest<T>(url, config, newAccess);
              return retry.data;
            }
          }
        } catch {
          // fall through to onUnauthorized
        }
      }
      provider.onUnauthorized();
    }
    throw err;
  }
}
