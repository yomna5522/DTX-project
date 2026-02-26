/**
 * Admin Suppliers API — CRUD for suppliers. Name required; email and phone optional.
 * Uses admin JWT.
 */

import { API_BASE_URL } from "@/api/constants";
import { ADMIN_PATHS } from "@/api/constants";
import { adminAuthApi } from "@/api/adminAuth";

export interface AdminSupplierItem {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  balance: number;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

async function adminRequest<T>(
  path: string,
  options: RequestInit & { method?: string; body?: unknown } = {}
): Promise<T> {
  const session = adminAuthApi.getSession();
  const token = session?.accessToken;
  if (!token) throw new Error("Admin session required");
  const { body, ...rest } = options;
  const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail ?? data.email ?? data.phone ?? data.error ?? data.message ?? "Request failed";
    const arr = Array.isArray(msg) ? msg : [msg];
    const first = arr[0];
    const str = typeof first === "string" ? first : first?.toString?.() ?? JSON.stringify(data);
    throw new Error(str);
  }
  return data as T;
}

function mapRow(row: Record<string, unknown>): AdminSupplierItem {
  return {
    id: Number(row.id),
    name: String(row.name ?? ""),
    email: row.email != null && row.email !== "" ? String(row.email) : null,
    phone: row.phone != null && row.phone !== "" ? String(row.phone) : null,
    balance: Number(row.balance ?? 0),
    avatar: row.avatar != null && row.avatar !== "" ? String(row.avatar) : null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function unwrapPaginated(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "results" in (data as Record<string, unknown>)) {
    const results = (data as Record<string, unknown>).results;
    if (Array.isArray(results)) return results;
  }
  return [];
}

export const adminSuppliersApi = {
  async getSuppliers(): Promise<AdminSupplierItem[]> {
    const data = await adminRequest<unknown>(ADMIN_PATHS.suppliers);
    return unwrapPaginated(data).map((r) => mapRow(r as Record<string, unknown>));
  },

  async createSupplier(payload: { name: string; email?: string; phone?: string }): Promise<AdminSupplierItem> {
    const body: Record<string, unknown> = { name: payload.name.trim() };
    if (payload.email?.trim()) body.email = payload.email.trim();
    if (payload.phone?.trim()) body.phone = payload.phone.trim();
    const r = await adminRequest<Record<string, unknown>>(ADMIN_PATHS.suppliers, { method: "POST", body });
    return mapRow(r);
  },

  async updateSupplier(
    id: number,
    payload: { name?: string; email?: string; phone?: string; balance?: number }
  ): Promise<AdminSupplierItem> {
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name.trim();
    if (payload.email !== undefined) body.email = payload.email?.trim() || null;
    if (payload.phone !== undefined) body.phone = payload.phone?.trim() || null;
    if (payload.balance !== undefined) body.balance = payload.balance;
    const r = await adminRequest<Record<string, unknown>>(ADMIN_PATHS.supplierDetail(id), {
      method: "PATCH",
      body,
    });
    return mapRow(r);
  },

  async deleteSupplier(id: number): Promise<void> {
    await adminRequest(ADMIN_PATHS.supplierDetail(id), { method: "DELETE" });
  },
};
