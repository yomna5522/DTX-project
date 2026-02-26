/**
 * Admin Fabric Inventory API — CRUD for fabric inventory.
 * Uses admin JWT. Maps backend fabric_type to frontend type (sublimation | natural).
 */

import { API_BASE_URL } from "@/api/constants";
import { ADMIN_PATHS } from "@/api/constants";
import { adminAuthApi } from "@/api/adminAuth";
import type { FactoryFabric, FabricType } from "@/types/order";

export interface AdminFabricTypeItem {
  id: number;
  name: string;
}

export interface AdminFabricInventoryItem {
  id: number;
  name: string;
  description: string | null;
  min_quantity: number;
  available_meter: string | null;
  image: string | null;
  price: string;
  fabric_type: { id: number; name: string } | null;
  fabric_type_id?: number;
  created_at: string;
  updated_at: string;
}

function imageUrlFromPath(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = API_BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/media/${path}`;
  return `${base}${p}`;
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
    body:
      body !== undefined
        ? isForm
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.detail ?? data.fabric_type_id ?? data.error ?? data.message ?? "Request failed";
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

/** Map backend fabric_type name to frontend FabricType */
function fabricTypeNameToFrontend(name: string): FabricType {
  const n = (name || "").toLowerCase();
  if (n.includes("sublimation")) return "sublimation";
  return "natural";
}

/** Map frontend type to backend fabric_type id (requires fabric types list) */
function frontendTypeToFabricTypeId(
  type: FabricType,
  fabricTypes: AdminFabricTypeItem[]
): number | null {
  const want = type === "sublimation" ? "sublimation" : "natural";
  const ft = fabricTypes.find((f) => f.name.toLowerCase().includes(want));
  return ft?.id ?? null;
}

function toFactoryFabric(row: AdminFabricInventoryItem, fabricType: FabricType): FactoryFabric {
  return {
    id: String(row.id),
    name: row.name,
    type: fabricType,
    pricePerMeter: parseFloat(row.price),
    minimumQuantity: row.min_quantity,
    availableMeters: row.available_meter != null ? parseFloat(row.available_meter) : undefined,
    description: row.description ?? undefined,
    imageUrl: row.image ? imageUrlFromPath(row.image) : undefined,
  };
}

export const adminFabricInventoryApi = {
  async getFabricTypes(): Promise<AdminFabricTypeItem[]> {
    const data = await adminRequest<unknown>(ADMIN_PATHS.fabricTypes);
    return unwrapPaginated<Record<string, unknown>>(data).map((r) => ({
      id: Number(r.id),
      name: String(r.name ?? ""),
    }));
  },

  async getList(): Promise<FactoryFabric[]> {
    const [raw, types] = await Promise.all([
      adminRequest<unknown>(ADMIN_PATHS.fabricInventory),
      this.getFabricTypes(),
    ]);
    const list = unwrapPaginated<AdminFabricInventoryItem>(raw);
    return list.map((r) => {
      const type: FabricType =
        r.fabric_type != null
          ? fabricTypeNameToFrontend(r.fabric_type.name)
          : "natural";
      return toFactoryFabric(r, type);
    });
  },

  async create(payload: Omit<FactoryFabric, "id"> & { image?: File }): Promise<FactoryFabric> {
    const types = await this.getFabricTypes();
    const fabricTypeId = frontendTypeToFabricTypeId(payload.type, types);
    if (payload.image) {
      const form = new FormData();
      form.set("name", payload.name.trim());
      form.set("description", (payload.description ?? "").trim());
      form.set("min_quantity", String(payload.minimumQuantity ?? 1));
      form.set("price", String(payload.pricePerMeter));
      if (payload.availableMeters != null) form.set("available_meter", String(payload.availableMeters));
      if (fabricTypeId != null) form.set("fabric_type_id", String(fabricTypeId));
      form.set("image", payload.image);
      const r = await adminRequest<AdminFabricInventoryItem>(ADMIN_PATHS.fabricInventory, {
        method: "POST",
        body: form,
      });
      const type: FabricType =
        r.fabric_type != null ? fabricTypeNameToFrontend(r.fabric_type.name) : "natural";
      return toFactoryFabric(r, type);
    }
    const body: Record<string, unknown> = {
      name: payload.name.trim(),
      description: payload.description ?? null,
      min_quantity: payload.minimumQuantity ?? 1,
      price: String(payload.pricePerMeter),
    };
    if (payload.availableMeters != null) body.available_meter = String(payload.availableMeters);
    if (fabricTypeId != null) body.fabric_type_id = fabricTypeId;
    const r = await adminRequest<AdminFabricInventoryItem>(ADMIN_PATHS.fabricInventory, {
      method: "POST",
      body,
    });
    const type: FabricType =
      r.fabric_type != null ? fabricTypeNameToFrontend(r.fabric_type.name) : "natural";
    return toFactoryFabric(r, type);
  },

  async update(
    id: string,
    payload: Partial<Omit<FactoryFabric, "id">> & { image?: File }
  ): Promise<FactoryFabric> {
    const types = await this.getFabricTypes();
    if (payload.image) {
      const form = new FormData();
      if (payload.name !== undefined) form.set("name", payload.name.trim());
      if (payload.description !== undefined) form.set("description", payload.description ?? "");
      if (payload.minimumQuantity !== undefined) form.set("min_quantity", String(payload.minimumQuantity));
      if (payload.availableMeters !== undefined)
        form.set("available_meter", payload.availableMeters == null ? "" : String(payload.availableMeters));
      if (payload.pricePerMeter !== undefined) form.set("price", String(payload.pricePerMeter));
      if (payload.type !== undefined) {
        const fid = frontendTypeToFabricTypeId(payload.type, types);
        if (fid != null) form.set("fabric_type_id", String(fid));
      }
      form.set("image", payload.image);
      const r = await adminRequest<AdminFabricInventoryItem>(
        ADMIN_PATHS.fabricInventoryDetail(Number(id)),
        { method: "PATCH", body: form }
      );
      const type: FabricType =
        r.fabric_type != null ? fabricTypeNameToFrontend(r.fabric_type.name) : "natural";
      return toFactoryFabric(r, type);
    }
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name.trim();
    if (payload.description !== undefined) body.description = payload.description ?? null;
    if (payload.minimumQuantity !== undefined) body.min_quantity = payload.minimumQuantity;
    if (payload.availableMeters !== undefined)
      body.available_meter = payload.availableMeters == null ? null : String(payload.availableMeters);
    if (payload.pricePerMeter !== undefined) body.price = String(payload.pricePerMeter);
    if (payload.type !== undefined) {
      const fid = frontendTypeToFabricTypeId(payload.type, types);
      body.fabric_type_id = fid;
    }
    const r = await adminRequest<AdminFabricInventoryItem>(
      ADMIN_PATHS.fabricInventoryDetail(Number(id)),
      { method: "PATCH", body: Object.keys(body).length ? body : undefined }
    );
    const type: FabricType =
      r.fabric_type != null ? fabricTypeNameToFrontend(r.fabric_type.name) : "natural";
    return toFactoryFabric(r, type);
  },

  async delete(id: string): Promise<void> {
    await adminRequest(ADMIN_PATHS.fabricInventoryDetail(Number(id)), { method: "DELETE" });
  },
};
