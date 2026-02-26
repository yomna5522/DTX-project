/**
 * Map backend admin order response to frontend Order shape for management UI.
 */

import type { AdminOrderResponse } from "@/types/orderApi";
import type { BackendOrderStatus, BackendFabricSource } from "@/types/orderApi";
import type { Order, OrderStatus, FabricSource, OrderItem, FabricChoice, DesignChoice } from "@/types/order";

function mapBackendStatus(s: BackendOrderStatus): OrderStatus {
  switch (s) {
    case "pending":
      return "SUBMITTED";
    case "in_progress":
      return "IN_PRODUCTION";
    case "done":
      return "COMPLETED";
    case "paid":
      return "PAID";
    case "cancelled":
      return "CANCELLED";
    default:
      return "SUBMITTED";
  }
}

function mapFabricSource(s: BackendFabricSource): FabricSource {
  switch (s) {
    case "provide":
      return "customer";
    case "factory_provide":
      return "factory";
    case "not_sure":
      return "not_sure";
    default:
      return "not_sure";
  }
}

export function adminOrderToOrder(r: AdminOrderResponse): Order {
  const quantity = r.quantity ?? 0;
  const totalAmount = r.total_amount != null ? parseFloat(String(r.total_amount)) : 0;
  const fabricChoice: FabricChoice = {
    fabricType: "sublimation",
    orderType: r.order_type_name?.toLowerCase() === "sample" ? "sample" : "order",
    fabricSource: mapFabricSource(r.fabric_source),
    ...(r.fabric_inventory_info && { factoryFabricId: String(r.fabric_inventory_info.id) }),
  };
  const designChoice: DesignChoice = { source: "existing", presetId: r.design_info?.id != null ? String(r.design_info.id) : undefined };
  const item: OrderItem = {
    designChoice,
    fabricChoice,
    quantity,
    notes: r.notes ?? "",
    unitPrice: quantity > 0 ? totalAmount / quantity : 0,
    totalPrice: totalAmount,
  };
  return {
    id: r.order_id,
    userId: String(r.user_info.id),
    status: mapBackendStatus(r.status),
    items: [item],
    totalAmount,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    user_info: r.user_info,
    backendId: r.id,
  };
}
