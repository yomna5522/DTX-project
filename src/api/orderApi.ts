/**
 * Order API — real backend integration. Uses shared client and orderApi types.
 * Maps backend order model to frontend Order type for customer pages.
 */

import { request, type ApiError } from "@/api/client";
import { ORDER_PATHS } from "@/api/constants";
import type {
  OrderListItem,
  BackendOrder,
  BackendOrderStatus,
  CreateOrderRequest,
  CreatePaymentRequest,
  CreatePaymentResponse,
  FabricInventoryItem,
  DesignItem,
  FabricTypeItem,
  OrderTypeItem,
} from "@/types/orderApi";
import type { Order, OrderItem, OrderStatus } from "@/types/order";

/** Map backend status to frontend OrderStatus for display */
function mapStatus(s: BackendOrderStatus): OrderStatus {
  const map: Record<BackendOrderStatus, OrderStatus> = {
    pending: "SUBMITTED",
    in_progress: "IN_PRODUCTION",
    done: "READY",
    paid: "PAID",
    cancelled: "CANCELLED",
  };
  return map[s] ?? "SUBMITTED";
}

function backendOrderToOrder(bo: BackendOrder, userId: string): Order {
  const totalAmount = bo.total_amount != null ? parseFloat(bo.total_amount) : 0;
  const item: OrderItem = {
    designChoice: {
      source: "existing",
      presetId: bo.design?.id != null ? String(bo.design.id) : undefined,
    },
    fabricChoice: {
      fabricType: "natural",
      orderType: "order",
      fabricSource: bo.fabric_source === "factory_provide" ? "factory" : bo.fabric_source === "provide" ? "customer" : "not_sure",
      factoryFabricId: bo.fabric_inventory?.id != null ? String(bo.fabric_inventory.id) : undefined,
    },
    quantity: bo.quantity ?? 0,
    notes: bo.notes ?? "",
    unitPrice: bo.quantity && totalAmount ? totalAmount / bo.quantity : 0,
    totalPrice: totalAmount,
  };
  return {
    id: bo.order_id,
    userId,
    status: mapStatus(bo.status),
    items: [item],
    totalAmount,
    createdAt: bo.created_at,
    updatedAt: bo.updated_at,
    ...(bo.payment && {
      paymentMethod: bo.payment.type === "instant_pay" ? "instapay" : "COD",
      paymentProofFileName: bo.payment.file ?? undefined,
    }),
    ...(bo.quotation && {
      invoice: {
        id: `inv-${bo.order_id}`,
        orderId: bo.order_id,
        amount: parseFloat(bo.quotation.price),
        issuedAt: bo.quotation.created_at,
        status: "ISSUED",
      },
    }),
  };
}

function listItemToOrder(li: OrderListItem, userId: string): Order {
  const totalAmount = li.total_amount != null ? parseFloat(li.total_amount) : 0;
  const quantity = li.quantity ?? 0;
  const item: OrderItem = {
    designChoice: { source: "existing" },
    fabricChoice: { fabricType: "natural", orderType: "order", fabricSource: "factory" },
    quantity,
    notes: "",
    unitPrice: quantity ? totalAmount / quantity : 0,
    totalPrice: totalAmount,
  };
  return {
    id: li.order_id,
    userId,
    status: mapStatus(li.status),
    items: [item],
    totalAmount,
    createdAt: li.created_at,
    updatedAt: li.created_at,
  };
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

function toErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as ApiError).message);
  }
  return "Request failed.";
}

export const orderApi = {
  /** List orders for current user. Optional status filter. */
  async listOrders(status?: BackendOrderStatus): Promise<Order[]> {
    const path = status ? `${ORDER_PATHS.listCreate}?status=${encodeURIComponent(status)}` : ORDER_PATHS.listCreate;
    const raw = await request<OrderListItem[] | { results: OrderListItem[] }>({ method: "GET", path });
    const list = Array.isArray(raw) ? raw : (raw?.results ?? []);
    const session = typeof window !== "undefined" ? (await import("@/api/auth")).getSession() : null;
    const userId = session?.user?.id ?? "";
    return list.map((li) => listItemToOrder(li, userId));
  },

  /** Get single order by order_id (string). */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const data = await request<BackendOrder>({
        method: "GET",
        path: ORDER_PATHS.detail(orderId),
      });
      const session = typeof window !== "undefined" ? (await import("@/api/auth")).getSession() : null;
      const userId = session?.user?.id ?? "";
      return backendOrderToOrder(data, userId);
    } catch {
      return null;
    }
  },

  /** Create order. Returns created order or throws. Use formData when custom_design is a File. */
  async createOrder(payload: CreateOrderRequest): Promise<Order> {
    let formData: FormData | undefined;
    if (payload.custom_design instanceof File) {
      formData = new FormData();
      formData.set("order_type_id", String(payload.order_type_id));
      formData.set("fabric_type_id", String(payload.fabric_type_id));
      formData.set("fabric_source", payload.fabric_source);
      if (payload.fabric_inventory_id != null) formData.set("fabric_inventory_id", String(payload.fabric_inventory_id));
      if (payload.design_id != null) formData.set("design_id", String(payload.design_id));
      if (payload.design_studio_id != null) formData.set("design_studio_id", String(payload.design_studio_id));
      formData.set("custom_design", payload.custom_design);
      if (payload.quantity != null) formData.set("quantity", String(payload.quantity));
      if (payload.notes != null) formData.set("notes", payload.notes);
    }
    const data = await request<BackendOrder>({
      method: "POST",
      path: ORDER_PATHS.listCreate,
      body: formData ? undefined : payload,
      formData,
    });
    const session = typeof window !== "undefined" ? (await import("@/api/auth")).getSession() : null;
    const userId = session?.user?.id ?? "";
    return backendOrderToOrder(data, userId);
  },

  /** Create payment for order (factory_provide only). */
  async createPayment(
    orderId: string,
    type: "instant_pay" | "cash",
    file?: File | null
  ): Promise<CreatePaymentResponse> {
    const form = new FormData();
    form.set("type", type);
    if (file) form.set("file", file);
    return request<CreatePaymentResponse>({
      method: "POST",
      path: ORDER_PATHS.payment(orderId),
      formData: form,
    });
  },

  /** Get fabric inventory (admin-added fabrics), optionally filtered by fabric_type id. Public endpoint. */
  async getFabricInventory(fabricTypeId?: number): Promise<FabricInventoryItem[]> {
    const path = fabricTypeId != null
      ? `${ORDER_PATHS.fabricInventory}?fabric_type=${fabricTypeId}`
      : ORDER_PATHS.fabricInventory;
    const data = await request<unknown>({ method: "GET", path, skipAuth: true });
    return unwrapPaginated<FabricInventoryItem>(data);
  },

  /** Get public designs for order step. Public endpoint. */
  async getDesigns(): Promise<DesignItem[]> {
    const data = await request<unknown>({ method: "GET", path: ORDER_PATHS.designs, skipAuth: true });
    return unwrapPaginated<DesignItem>(data);
  },

  /** Get fabric types for order step (map sublimation/natural to backend ids). Public endpoint. */
  async getFabricTypes(): Promise<FabricTypeItem[]> {
    const data = await request<unknown>({ method: "GET", path: ORDER_PATHS.fabricTypes, skipAuth: true });
    return unwrapPaginated<FabricTypeItem>(data);
  },

  /** Get order types for order step (map order/sample to backend ids). Public endpoint. */
  async getOrderTypes(): Promise<OrderTypeItem[]> {
    const data = await request<unknown>({ method: "GET", path: ORDER_PATHS.orderTypes, skipAuth: true });
    return unwrapPaginated<OrderTypeItem>(data);
  },
};

export type { CreateOrderRequest, FabricInventoryItem, DesignItem, FabricTypeItem, OrderTypeItem };
