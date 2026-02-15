/** Status of an invoice document */
export type InvoiceDocumentStatus = "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";

/** A single line item on an invoice (aggregated from production runs) */
export interface InvoiceLineItem {
  /** Design reference (aggregation key) */
  designRef: string;
  /** Fabric name (aggregation key) */
  fabric: string;
  /** Total linear meters for this line */
  totalMeters: number;
  /** Price per meter applied */
  pricePerMeter: number;
  /** Line total = totalMeters * pricePerMeter */
  lineTotal: number;
  /** IDs of ProductionRuns that contributed to this line */
  productionRunIds: string[];
}

/** A full invoice document — the billing artefact */
export interface InvoiceDocument {
  id: string;
  /** Sequential bill number for the customer (e.g. "Palma.7" → 7) */
  billNumber: number;
  customerEntityId: string;
  /** Customer display name snapshot at time of invoice creation */
  customerName: string;
  /** Period covered by this invoice */
  periodStart: string;
  periodEnd: string;
  /** Aggregated line items */
  lines: InvoiceLineItem[];
  /** Sum of all line totals before discount & VAT */
  subtotal: number;
  /** Discount percentage (e.g. 3 for 3%) */
  discountPct: number;
  /** Discount amount */
  discountAmount: number;
  /** Subtotal after discount */
  afterDiscount: number;
  /** VAT percentage (e.g. 14 for 14%) */
  vatPct: number;
  /** VAT amount */
  vatAmount: number;
  /** Grand total = afterDiscount + vatAmount */
  total: number;
  /** Invoice lifecycle */
  status: InvoiceDocumentStatus;
  /** Optional notes on the invoice */
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
