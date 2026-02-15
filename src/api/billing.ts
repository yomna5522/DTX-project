import type { InvoiceDocument, InvoiceLineItem } from "@/types/billing";
import { productionApi } from "./production";

const INVOICES_KEY = "dtx_invoice_documents";

function load(): InvoiceDocument[] {
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    return raw ? (JSON.parse(raw) as InvoiceDocument[]) : [];
  } catch {
    return [];
  }
}

function save(data: InvoiceDocument[]) {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(data));
}

export const billingApi = {
  // ── Read ─────────────────────────────────────────────────
  getAllInvoices(): InvoiceDocument[] {
    return load().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getInvoiceById(id: string): InvoiceDocument | undefined {
    return load().find((inv) => inv.id === id);
  },

  getInvoicesByCustomer(customerEntityId: string): InvoiceDocument[] {
    return this.getAllInvoices().filter(
      (inv) => inv.customerEntityId === customerEntityId
    );
  },

  /** Next bill number for a customer (max existing + 1) */
  nextBillNumber(customerEntityId: string): number {
    const existing = this.getInvoicesByCustomer(customerEntityId);
    if (existing.length === 0) return 1;
    return Math.max(...existing.map((inv) => inv.billNumber)) + 1;
  },

  // ── Draft / Preview ──────────────────────────────────────
  /**
   * Build a draft invoice from APPROVED production runs.
   * Groups runs by (designRef, fabric) and resolves pricing.
   * Does NOT persist — call `createInvoice` to finalize.
   */
  buildDraft(params: {
    customerEntityId: string;
    from: string;
    to: string;
    discountPct?: number;
    vatPct?: number;
  }): {
    lines: InvoiceLineItem[];
    subtotal: number;
    discountPct: number;
    discountAmount: number;
    afterDiscount: number;
    vatPct: number;
    vatAmount: number;
    total: number;
  } {
    const runs = productionApi.getApprovableRuns({
      customerEntityId: params.customerEntityId,
      from: params.from,
      to: params.to,
    });

    // Group by (designRef, fabric)
    const groups = new Map<
      string,
      { designRef: string; fabric: string; meters: number; runIds: string[] }
    >();

    for (const run of runs) {
      const key = `${run.designRef.trim().toLowerCase()}|||${run.fabric.trim().toLowerCase()}`;
      const existing = groups.get(key);
      if (existing) {
        existing.meters += run.metersPrinted;
        existing.runIds.push(run.id);
      } else {
        groups.set(key, {
          designRef: run.designRef,
          fabric: run.fabric,
          meters: run.metersPrinted,
          runIds: [run.id],
        });
      }
    }

    const lines: InvoiceLineItem[] = [];
    for (const g of groups.values()) {
      const pricePerMeter = productionApi.resolvePricePerMeter(
        params.customerEntityId,
        g.fabric,
        g.designRef
      );
      lines.push({
        designRef: g.designRef,
        fabric: g.fabric,
        totalMeters: g.meters,
        pricePerMeter,
        lineTotal: g.meters * pricePerMeter,
        productionRunIds: g.runIds,
      });
    }

    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

    // Resolve discount
    const customer = productionApi.getCustomerEntityById(params.customerEntityId);
    const discountPct = params.discountPct ?? customer?.defaultDiscountPct ?? 3;
    const discountAmount = Math.round(subtotal * (discountPct / 100) * 100) / 100;
    const afterDiscount = subtotal - discountAmount;

    // VAT
    const vatPct = params.vatPct ?? 14;
    const vatAmount = Math.round(afterDiscount * (vatPct / 100) * 100) / 100;
    const total = Math.round((afterDiscount + vatAmount) * 100) / 100;

    return {
      lines,
      subtotal,
      discountPct,
      discountAmount,
      afterDiscount,
      vatPct,
      vatAmount,
      total,
    };
  },

  // ── Create (finalize) ────────────────────────────────────
  createInvoice(params: {
    customerEntityId: string;
    from: string;
    to: string;
    discountPct?: number;
    vatPct?: number;
    notes?: string;
  }): InvoiceDocument {
    const draft = this.buildDraft(params);
    const customer = productionApi.getCustomerEntityById(params.customerEntityId);
    const billNumber = this.nextBillNumber(params.customerEntityId);
    const now = new Date().toISOString();
    const id = `inv-${Date.now()}`;

    const invoice: InvoiceDocument = {
      id,
      billNumber,
      customerEntityId: params.customerEntityId,
      customerName: customer?.displayName ?? "Unknown",
      periodStart: params.from,
      periodEnd: params.to,
      lines: draft.lines,
      subtotal: draft.subtotal,
      discountPct: draft.discountPct,
      discountAmount: draft.discountAmount,
      afterDiscount: draft.afterDiscount,
      vatPct: draft.vatPct,
      vatAmount: draft.vatAmount,
      total: draft.total,
      status: "ISSUED",
      notes: params.notes,
      createdAt: now,
      updatedAt: now,
    };

    // Persist invoice
    const list = load();
    list.push(invoice);
    save(list);

    // Mark production runs as invoiced
    const allRunIds = draft.lines.flatMap((l) => l.productionRunIds);
    productionApi.markRunsInvoiced(allRunIds, id);

    return invoice;
  },

  // ── Update ───────────────────────────────────────────────
  updateInvoiceStatus(
    id: string,
    status: InvoiceDocument["status"]
  ): InvoiceDocument | undefined {
    const list = load();
    const idx = list.findIndex((inv) => inv.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], status, updatedAt: new Date().toISOString() };
    save(list);
    return list[idx];
  },

  deleteInvoice(id: string): boolean {
    const list = load();
    const filtered = list.filter((inv) => inv.id !== id);
    if (filtered.length === list.length) return false;
    save(filtered);
    return true;
  },

  // ── Aggregation ──────────────────────────────────────────
  totalReceivables(): number {
    return load()
      .filter((inv) => inv.status === "ISSUED")
      .reduce((s, inv) => s + inv.total, 0);
  },

  totalCollected(): number {
    return load()
      .filter((inv) => inv.status === "PAID")
      .reduce((s, inv) => s + inv.total, 0);
  },
};
