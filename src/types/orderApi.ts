/**
 * Order API request/response DTOs — aligned with backend (order app, API_ENDPOINTS_FRONTEND.md).
 * Backend statuses: pending | in_progress | done | paid | cancelled.
 * Backend fabric_source: provide | factory_provide | not_sure.
 */

export type BackendOrderStatus =
  | "pending"
  | "in_progress"
  | "done"
  | "paid"
  | "cancelled";

export type BackendFabricSource =
  | "provide"
  | "factory_provide"
  | "not_sure";

/** Nested refs in order responses */
export interface OrderTypeRef {
  id: number;
  name: string;
}

export interface FabricTypeRef {
  id: number;
  name: string;
}

export interface FabricInventoryRef {
  id: number;
  name: string;
  price: string;
  min_quantity: number;
}

export interface DesignRef {
  id: number;
  name: string;
  file: string | null;
}

export interface DesignStudioRef {
  id: number;
  user_id: number | null;
  file: string | null;
  width?: string;
  height?: string;
}

export interface PaymentRef {
  id: number;
  type: "instant_pay" | "cash";
  file: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationRef {
  id: number;
  title: string;
  description: string;
  min_quantity: number;
  price: string;
  admin_name: string;
  created_at: string;
  updated_at: string;
}

/** GET /api/order/add/ — list item (compact) */
export interface OrderListItem {
  id: number;
  order_id: string;
  status: BackendOrderStatus;
  quantity: number | null;
  total_amount: string | null;
  created_at: string;
}

/** POST /api/order/add/ and GET/PATCH /api/order/details/<order_id>/ — full order */
export interface BackendOrder {
  id: number;
  order_id: string;
  status: BackendOrderStatus;
  order_type: OrderTypeRef | null;
  order_type_id: number;
  fabric_type: FabricTypeRef | null;
  fabric_type_id: number;
  fabric_inventory: FabricInventoryRef | null;
  fabric_inventory_id: number | null;
  fabric_source: BackendFabricSource;
  design: DesignRef | null;
  design_id: number | null;
  design_studio: DesignStudioRef | null;
  design_studio_id: number | null;
  custom_design: string | null;
  quantity: number | null;
  total_amount: string | null;
  notes: string | null;
  payment: PaymentRef | null;
  quotation: QuotationRef | null;
  created_at: string;
  updated_at: string;
}

/** POST /api/order/add/ — request (JSON or form-data if custom_design file) */
export interface CreateOrderRequest {
  order_type_id: number;
  fabric_type_id: number;
  fabric_source: BackendFabricSource;
  fabric_inventory_id?: number | null;
  design_id?: number | null;
  design_studio_id?: number | null;
  custom_design?: File | null;
  quantity?: number | null;
  notes?: string | null;
}

/** GET /api/order/fabric-inventory/?fabric_type=<id> — item */
export interface FabricInventoryItem {
  id: number;
  name: string;
  description: string | null;
  min_quantity: number;
  available_meter: string | null;
  image: string | null;
  price: string;
  fabric_type?: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
}

/** GET /api/order/designs/ — public design for order step */
export interface DesignItem {
  id: number;
  name: string;
  description: string | null;
  file: string | null;
  price: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/** GET /api/order/fabric-types/ — for mapping sublimation/natural */
export interface FabricTypeItem {
  id: number;
  name: string;
}

/** GET /api/order/order-types/ — for mapping order/sample */
export interface OrderTypeItem {
  id: number;
  name: string;
}

/** POST /api/order/payment/<order_id>/ — form-data */
export interface CreatePaymentRequest {
  type: "instant_pay" | "cash";
  file?: File | null;
}

/** POST /api/order/payment/<order_id>/ — 201 */
export interface CreatePaymentResponse {
  id: number;
  type: "instant_pay" | "cash";
  file: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/** Admin: GET /api/admin/orders/ and GET /api/admin/orders/<id>/ — user_info and nested refs */
export interface AdminOrderUserInfo {
  id: number;
  email: string;
  phone: string;
  fullname: string;
}

export interface AdminOrderResponse {
  id: number;
  order_id: string;
  user_info: AdminOrderUserInfo;
  status: BackendOrderStatus;
  order_type_name: string;
  fabric_type_name: string;
  fabric_inventory_info: FabricInventoryRef | null;
  fabric_source: BackendFabricSource;
  design_info: DesignRef | null;
  custom_design: string | null;
  quantity: number | null;
  total_amount: string | null;
  notes: string | null;
  quotation: QuotationRef | null;
  created_at: string;
  updated_at: string;
}

/** Admin: GET list — paginated */
export interface AdminOrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminOrderResponse[];
}

/** Admin: POST /api/admin/orders/<pk>/quotations/ — request */
export interface AdminAddQuotationRequest {
  title: string;
  description: string;
  min_quantity: number;
  price: string | number;
}
