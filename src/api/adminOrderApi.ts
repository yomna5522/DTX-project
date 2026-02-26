/**
 * Admin orders API — list, detail, add quotation.
 * Uses admin JWT from adminAuth; all requests require admin session.
 */

import { API_BASE_URL } from "@/api/constants";
import { ADMIN_PATHS } from "@/api/constants";
import { adminAuthApi } from "@/api/adminAuth";
import type {
  AdminOrderResponse,
  AdminOrderListResponse,
  AdminAddQuotationRequest,
  BackendOrderStatus,
  BackendFabricSource,
} from "@/types/orderApi";

async function adminRequest<T>(
  path: string,
  options: RequestInit & { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = await adminAuthApi.getAccessToken();
  if (!token) {
    throw new Error("Admin session required");
  }
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
    const msg = data.detail ?? data.error ?? data.message ?? "Request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data as T;
}

export interface AdminOrderListParams {
  status?: BackendOrderStatus;
  fabric_source?: BackendFabricSource;
  search?: string;
  page?: number;
}

export const adminOrderApi = {
  async list(params: AdminOrderListParams = {}): Promise<AdminOrderListResponse> {
    const sp = new URLSearchParams();
    if (params.status) sp.set("status", params.status);
    if (params.fabric_source) sp.set("fabric_source", params.fabric_source);
    if (params.search) sp.set("search", params.search);
    if (params.page != null) sp.set("page", String(params.page));
    const qs = sp.toString();
    return adminRequest<AdminOrderListResponse>(
      `${ADMIN_PATHS.orders}${qs ? `?${qs}` : ""}`
    );
  },

  async getDetail(pk: number): Promise<AdminOrderResponse> {
    return adminRequest<AdminOrderResponse>(ADMIN_PATHS.orderDetail(pk));
  },

  async addQuotation(
    orderPk: number,
    body: AdminAddQuotationRequest
  ): Promise<{ id: number; title: string; description: string; min_quantity: number; price: string; admin_name: string; created_at: string; updated_at: string }> {
    return adminRequest(ADMIN_PATHS.orderQuotations(orderPk), {
      method: "POST",
      body: {
        ...body,
        price: typeof body.price === "number" ? String(body.price) : body.price,
      },
    });
  },
};
