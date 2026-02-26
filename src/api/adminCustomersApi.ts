/**
 * Admin Customer Database API — list registered customers (User role=customer).
 * Uses admin JWT. Customers are created when users register via /api/register/.
 */

import { API_BASE_URL } from "@/api/constants";
import { ADMIN_PATHS } from "@/api/constants";
import { adminAuthApi } from "@/api/adminAuth";

export interface AdminCustomerItem {
  id: number;
  email: string;
  phone: string;
  fullname: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  order_count: number;
}

async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = adminAuthApi.getSession();
  const token = session?.accessToken;
  if (!token) throw new Error("Admin session required");
  const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail ?? data.error ?? data.message ?? (res.status === 401 ? "Session expired. Please log in again." : "Request failed");
    const arr = Array.isArray(msg) ? msg : [msg];
    const first = arr[0];
    const str = typeof first === "string" ? first : JSON.stringify(data);
    throw new Error(str);
  }
  return data as T;
}

export const adminCustomersApi = {
  async getCustomers(): Promise<AdminCustomerItem[]> {
    const raw = await adminRequest<unknown>(ADMIN_PATHS.customers);
    const data = Array.isArray(raw) ? raw : (raw && typeof raw === "object" && "results" in (raw as object) ? (raw as { results: unknown[] }).results : []);
    return (Array.isArray(data) ? data : []).map((row) => ({
      id: Number((row as Record<string, unknown>).id),
      email: String((row as Record<string, unknown>).email ?? ""),
      phone: String((row as Record<string, unknown>).phone ?? ""),
      fullname: (row as Record<string, unknown>).fullname != null
        ? String((row as Record<string, unknown>).fullname)
        : null,
      is_verified: Boolean((row as Record<string, unknown>).is_verified),
      is_active: Boolean((row as Record<string, unknown>).is_active),
      created_at: String((row as Record<string, unknown>).created_at ?? ""),
      order_count: Number((row as Record<string, unknown>).order_count ?? 0),
    }));
  },
};
