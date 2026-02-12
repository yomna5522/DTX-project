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

export type DesignSource = "preset" | "upload" | "repeat";
export type FabricType = "artificial" | "natural";
export type FabricSource = "customer" | "factory";
export type PaymentMethod = "COD" | "BANK_TRANSFER";

export interface PresetDesign {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePricePerUnit: number;
}

export interface DesignChoice {
  source: DesignSource;
  presetId?: string;
  uploadFileName?: string;
  repeatOrderId?: string;
}

export interface FabricChoice {
  fabricType: FabricType;
  fabricSource: FabricSource;
}

export interface OrderItem {
  designChoice: DesignChoice;
  fabricChoice: FabricChoice;
  quantity: number;
  notes: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  orderId: string;
  amount: number;
  issuedAt: string;
  status: "PENDING" | "ISSUED";
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
}
