/** Billing status for a production run */
export type ProductionBillingStatus = "DRAFT" | "APPROVED" | "INVOICED";

/** A single production run — one row in the daily machine diary */
export interface ProductionRun {
  id: string;
  /** ISO date string (yyyy-mm-dd) */
  date: string;
  /** Machine used for printing */
  machine: string;
  /** Customer entity this run belongs to */
  customerEntityId: string;
  /** Design reference / code (free-text, e.g. "Design 1", "تصميم ١") */
  designRef: string;
  /** Fabric display name (free-text, e.g. "كتان 50-50", "Waterproof") */
  fabric: string;
  /** Linear meters actually printed */
  metersPrinted: number;
  /** Free-text notes */
  notes: string;
  /** Optional link back to the shop order that triggered this run */
  sourceOrderId?: string;
  /** Billing lifecycle */
  billingStatus: ProductionBillingStatus;
  /** The invoice this run was billed on (set when status becomes INVOICED) */
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

/** A customer entity used for production & billing (distinct from web-portal User) */
export interface CustomerEntity {
  id: string;
  /** Primary display name */
  displayName: string;
  /** Alternative names / aliases for matching (e.g. "Palma", "Palma.7") */
  aliases: string[];
  /** Default price per meter for this customer (can be overridden per rule) */
  defaultPricePerMeter?: number;
  /** Default discount percentage (e.g. 3) */
  defaultDiscountPct?: number;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Per-customer pricing override by fabric and/or design */
export interface PricingRule {
  id: string;
  customerEntityId: string;
  /** If set, applies only when fabric matches (case-insensitive) */
  fabric?: string;
  /** If set, applies only when designRef matches (case-insensitive) */
  designRef?: string;
  /** Price per linear meter in EGP */
  pricePerMeter: number;
  createdAt: string;
}
