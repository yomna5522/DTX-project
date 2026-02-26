/**
 * Admin auth — login and session storage for management dashboard.
 * Separate from customer auth; uses POST /api/admin/login/ and dtx_admin_session.
 */

import { API_BASE_URL } from "@/api/constants";
import { AUTH_PATHS } from "@/api/constants";
import { ADMIN_PATHS } from "@/api/constants";
import type { ApiUser } from "@/types/authApi";

const STORAGE_KEY = "dtx_admin_session";

export interface AdminSession {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

function getStored(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

function setStored(session: AdminSession | null): void {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const adminAuthApi = {
  getSession(): AdminSession | null {
    return getStored();
  },

  async login(identifier: string, password: string): Promise<{ success: true; session: AdminSession } | { success: false; error: string }> {
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");
    const body = {
      password,
      ...(isEmail ? { email: trimmed } : { phone: trimmed }),
    };
    if (!body.email && !body.phone) {
      return { success: false, error: "Please provide email or phone." };
    }
    try {
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${ADMIN_PATHS.login}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.detail ?? data.error ?? data.message ?? "Login failed.";
        return { success: false, error: typeof msg === "string" ? msg : JSON.stringify(msg) };
      }
      const session: AdminSession = {
        user: data.user,
        accessToken: data.access,
        refreshToken: data.refresh,
      };
      setStored(session);
      return { success: true, session };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Request failed." };
    }
  },

  logout(): void {
    setStored(null);
  },

  /** Get valid access token, refreshing if needed (for admin API calls). */
  async getAccessToken(): Promise<string | null> {
    const session = getStored();
    if (!session) return null;
    const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${AUTH_PATHS.tokenRefresh}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: session.refreshToken }),
    });
    if (!res.ok) return session.accessToken;
    const data = await res.json();
    if (data.access) {
      const newSession: AdminSession = { ...session, accessToken: data.access };
      setStored(newSession);
      return data.access;
    }
    return session.accessToken;
  },
};
