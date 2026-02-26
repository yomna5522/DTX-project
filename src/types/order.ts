export type OrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "INVOICE_PENDING"
  | "INVOICED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "IN_PRODUCTION"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type DesignSource = "existing" | "upload" | "repeat" | "my_library";
export type FabricType = "sublimation" | "natural";
export type OrderType = "sample" | "order";
export type FabricSource = "customer" | "factory" | "not_sure";
export type PaymentMethod = "instapay" | "COD";

export interface PresetDesign {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePricePerUnit: number;
  /** Admin-only: when set, this design is sold to the named client as their sole property */
  solePropertyClientId?: string;
  solePropertyClientName?: string;
}

export interface FactoryFabric {
  id: string;
  name: string;
  type: FabricType;
  pricePerMeter: number;
  minimumQuantity: number;
  availableMeters?: number;
  description?: string;
  /** Image URL (from admin upload), shown in shop when set */
  imageUrl?: string;
}

export interface DesignChoice {
  source: DesignSource;
  presetId?: string;
  uploadFileName?: string;
  repeatOrderId?: string;
  myLibraryDesignId?: string;
}

export interface FabricChoice {
  fabricType: FabricType;
  orderType: OrderType;
  fabricSource: FabricSource;
  // For "customer" source
  customerNotes?: string;
  // For "factory" source
  factoryFabricId?: string;
  // For "not_sure" source
  inquiry?: string;
}

export interface OrderItem {
  designChoice: DesignChoice;
  fabricChoice: FabricChoice;
  quantity: number;
  notes: string;
  unitPrice: number;
  totalPrice: number;
  /** When design is from customer’s Pattern Studio library, store a snapshot so management can show the design */
  myLibraryDesignSnapshot?: {
    name: string;
    imageDataUrl: string;
    repeatType?: "full_drop" | "half_drop" | "centre" | "mirror";
    fabricChoice?: string;
    fabricCutChoice?: string;
    tileSize?: number;
  };
  /** When design is upload(s), store snapshots so management can show and download all files */
  uploadSnapshots?: { fileName: string; dataUrl: string }[];
}

export interface Invoice {
  id: string;
  orderId: string;
  amount: number;
  issuedAt: string;
  status: "PENDING" | "ISSUED";
}

/** Customer info from backend (e.g. admin order user_info) — avoids extra user lookup in management */
export interface OrderCustomerInfo {
  id: number;
  email: string;
  phone: string;
  fullname: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  paymentProofFileName?: string;
  invoice?: Invoice;
  createdAt: string;
  updatedAt: string;
  estimatedCompletion?: string;
  /** Optional link to the production-side customer entity */
  customerEntityId?: string;
  /** When set (e.g. from admin API), use for customer display instead of looking up by userId */
  user_info?: OrderCustomerInfo;
  /** Backend order pk for admin API (e.g. add quotation) */
  backendId?: number;
}
