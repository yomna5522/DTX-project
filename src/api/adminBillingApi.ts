/**
 * Billing Vault backend API — invoices, approved runs. Uses admin JWT.
 */

import { API_BASE_URL } from "@/api/constants";
import { ADMIN_PATHS } from "@/api/constants";
import { adminAuthApi } from "@/api/adminAuth";
import type { InvoiceDocument, InvoiceLineItem } from "@/types/billing";

async function adminRequest<T>(
  path: string,
  options: RequestInit & { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = await adminAuthApi.getAccessToken();
  if (!token) throw new Error("Admin session required");
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

function mapInvoiceFromBackend(inv: Record<string, unknown>): InvoiceDocument {
  const lines = (inv.lines as Record<string, unknown>[] || []).map((l) => ({
    designRef: String(l.design_ref),
    fabric: String(l.fabric),
    totalMeters: Number(l.total_meters),
    pricePerMeter: Number(l.price_per_meter),
    lineTotal: Number(l.line_total),
    productionRunIds: Array.isArray(l.production_run_ids) ? l.production_run_ids as string[] : [],
  })) as InvoiceLineItem[];
  return {
    id: String(inv.id),
    invoiceNumber: inv.invoice_number ? String(inv.invoice_number) : undefined,
    billNumber: Number(inv.bill_number),
    customerEntityId: String(inv.customer_entity_id),
    customerName: String(inv.customer_name),
    periodStart: String(inv.period_start),
    periodEnd: String(inv.period_end),
    lines,
    subtotal: Number(inv.subtotal),
    discountPct: Number(inv.discount_pct ?? 0),
    discountAmount: Number(inv.discount_amount ?? 0),
    afterDiscount: Number(inv.after_discount ?? 0),
    vatPct: Number(inv.vat_pct ?? 0),
    vatAmount: Number(inv.vat_amount ?? 0),
    total: Number(inv.total),
    status: (inv.status as InvoiceDocument["status"]) ?? "DRAFT",
    notes: inv.notes ? String(inv.notes) : undefined,
    issuedAt: inv.issued_at ? String(inv.issued_at) : undefined,
    createdAt: String(inv.created_at),
    updatedAt: String(inv.updated_at),
  };
}

export interface ApprovedRunRef {
  id: string;
  date: string;
  machine: string;
  design_ref: string;
  fabric: string;
  meters_printed: number;
  source_order_id: string | null;
}

function unwrapPaginated(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "results" in (data as Record<string, unknown>)) {
    const results = (data as Record<string, unknown>).results;
    if (Array.isArray(results)) return results;
  }
  return [];
}

export const adminBillingApi = {
  async getInvoices(): Promise<InvoiceDocument[]> {
    const data = await adminRequest<unknown>(ADMIN_PATHS.billing.invoices);
    return unwrapPaginated(data).map((inv) =>
      mapInvoiceFromBackend(inv as Record<string, unknown>)
    );
  },

  async getInvoice(id: string): Promise<InvoiceDocument | null> {
    try {
      const inv = await adminRequest<Record<string, unknown>>(
        ADMIN_PATHS.billing.invoiceDetail(parseInt(id, 10))
      );
      return mapInvoiceFromBackend(inv);
    } catch {
      return null;
    }
  },

  async getApprovedRuns(params: {
    customerEntityId: string;
    from?: string;
    to?: string;
  }): Promise<ApprovedRunRef[]> {
    const sp = new URLSearchParams();
    sp.set("customer_entity_id", params.customerEntityId);
    if (params.from) sp.set("from", params.from);
    if (params.to) sp.set("to", params.to);
    const data = await adminRequest<unknown>(
      `${ADMIN_PATHS.billing.approvedRuns}?${sp.toString()}`
    );
    return unwrapPaginated(data) as ApprovedRunRef[];
  },

  async createInvoice(params: {
    customerEntityId: string;
    periodStart: string;
    periodEnd: string;
    runIds: string[];
    discountPct?: number;
    vatPct?: number;
    notes?: string;
  }): Promise<InvoiceDocument> {
    const numericIds = params.runIds.map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n));
    if (numericIds.length === 0) throw new Error("No valid run IDs");
    const body = {
      customer_entity_id: parseInt(params.customerEntityId, 10) || params.customerEntityId,
      period_start: params.periodStart,
      period_end: params.periodEnd,
      run_ids: numericIds,
      discount_pct: params.discountPct ?? 0,
      vat_pct: params.vatPct ?? 0,
      notes: params.notes ?? "",
    };
    const inv = await adminRequest<Record<string, unknown>>(ADMIN_PATHS.billing.invoices, {
      method: "POST",
      body,
    });
    return mapInvoiceFromBackend(inv);
  },
};
