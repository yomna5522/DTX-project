/**
 * Admin Design Library API — CRUD for preset designs.
 * Uses admin JWT. Create/update with optional file upload (FormData when file present).
 */

import { API_BASE_URL } from "@/api/constants";
import { ADMIN_PATHS } from "@/api/constants";
import { adminAuthApi } from "@/api/adminAuth";
import type { PresetDesign } from "@/types/order";

export interface AdminDesignItem {
  id: number;
  name: string;
  description: string | null;
  file: string | null;
  price: string;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_users?: { id: number; email: string | null; fullname: string | null }[];
}

async function adminRequest<T>(
  path: string,
  options: RequestInit & { method?: string; body?: unknown } = {}
): Promise<T> {
  const session = adminAuthApi.getSession();
  const token = session?.accessToken;
  if (!token) throw new Error("Admin session required");
  const { body, ...rest } = options;
  const isForm = body instanceof FormData;
  const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
    ...rest,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    body: body !== undefined ? (isForm ? (body as FormData) : JSON.stringify(body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail ?? data.error ?? data.message ?? "Request failed";
    const arr = Array.isArray(msg) ? msg : [msg];
    const first = arr[0];
    const str = typeof first === "string" ? first : first?.toString?.() ?? JSON.stringify(data);
    throw new Error(str);
  }
  return data as T;
}

/** Extract results array from DRF paginated response or plain array */
function unwrapPaginated<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "results" in (data as Record<string, unknown>)) {
    const results = (data as Record<string, unknown>).results;
    if (Array.isArray(results)) return results;
  }
  return [];
}

function fileUrl(base: string, filePath: string | null): string {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  const baseUrl = base.replace(/\/$/, "");
  const path = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${baseUrl}${path}`;
}

function toPresetDesign(r: AdminDesignItem, baseUrl: string): PresetDesign {
  const firstUser = r.assigned_users?.[0];
  return {
    id: String(r.id),
    name: r.name,
    description: r.description ?? "",
    imageUrl: fileUrl(baseUrl, r.file),
    basePricePerUnit: parseFloat(r.price),
    ...(firstUser && {
      solePropertyClientId: String(firstUser.id),
      solePropertyClientName: firstUser.fullname ?? firstUser.email ?? "",
    }),
  };
}

export const adminDesignLibraryApi = {
  async getList(): Promise<PresetDesign[]> {
    const raw = await adminRequest<unknown>(ADMIN_PATHS.designs);
    const rows = unwrapPaginated<AdminDesignItem>(raw);
    return rows.map((r) => toPresetDesign(r, API_BASE_URL));
  },

  async create(payload: {
    name: string;
    description?: string;
    basePricePerUnit: number;
    visibility: "public" | "private";
    solePropertyClientId?: string;
    file?: File;
  }): Promise<PresetDesign> {
    const form = new FormData();
    form.set("name", payload.name.trim());
    form.set("description", (payload.description ?? "").trim());
    form.set("price", String(payload.basePricePerUnit));
    form.set("status", payload.visibility === "private" ? "private" : "public");
    if (payload.file) form.set("file", payload.file);
    const r = await adminRequest<AdminDesignItem>(ADMIN_PATHS.designs, {
      method: "POST",
      body: form,
    });
    return toPresetDesign(r, API_BASE_URL);
  },

  async update(
    id: string,
    payload: Partial<{
      name: string;
      description: string;
      basePricePerUnit: number;
      visibility: "public" | "private";
      solePropertyClientId: string;
      file: File;
    }>
  ): Promise<PresetDesign> {
    if (payload.file != null) {
      const form = new FormData();
      if (payload.name !== undefined) form.set("name", payload.name.trim());
      if (payload.description !== undefined) form.set("description", payload.description);
      if (payload.basePricePerUnit !== undefined)
        form.set("price", String(payload.basePricePerUnit));
      if (payload.visibility !== undefined)
        form.set("status", payload.visibility === "private" ? "private" : "public");
      form.set("file", payload.file);
      const r = await adminRequest<AdminDesignItem>(ADMIN_PATHS.designDetail(Number(id)), {
        method: "PATCH",
        body: form,
      });
      return toPresetDesign(r, API_BASE_URL);
    }
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name.trim();
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.basePricePerUnit !== undefined) body.price = String(payload.basePricePerUnit);
    if (payload.visibility !== undefined)
      body.status = payload.visibility === "private" ? "private" : "public";
    const r = await adminRequest<AdminDesignItem>(ADMIN_PATHS.designDetail(Number(id)), {
      method: "PATCH",
      body: Object.keys(body).length ? body : undefined,
    });
    return toPresetDesign(r, API_BASE_URL);
  },

  async delete(id: string): Promise<void> {
    await adminRequest(ADMIN_PATHS.designDetail(Number(id)), { method: "DELETE" });
  },
};
