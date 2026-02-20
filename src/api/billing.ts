import type {
  InvoiceDocument,
  InvoiceLineItem,
  InvoiceNumberChangeLogEntry,
} from "@/types/billing";
import { productionApi } from "./production";

const INVOICES_KEY = "dtx_invoice_documents";
const INVOICE_NUMBER_LOG_KEY = "dtx_invoice_number_change_log";

const INVOICE_NUMBER_PREFIX = "INV-";
const INVOICE_NUMBER_PAD = 4;

function load(): InvoiceDocument[] {
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    let list = raw ? (JSON.parse(raw) as InvoiceDocument[]) : [];
    list = migrateInvoiceNumbers(list);
    return list;
  } catch {
    return [];
  }
}

/** Ensure every invoice has a unique invoiceNumber (backfill for old data). */
function migrateInvoiceNumbers(list: InvoiceDocument[]): InvoiceDocument[] {
  let maxNum = 0;
  for (const inv of list) {
    if (inv.invoiceNumber != null && inv.invoiceNumber.startsWith(INVOICE_NUMBER_PREFIX)) {
      const n = parseInt(inv.invoiceNumber.slice(INVOICE_NUMBER_PREFIX.length), 10);
      if (!Number.isNaN(n)) maxNum = Math.max(maxNum, n);
    }
  }
  let changed = false;
  const next = list.map((inv) => {
    if (inv.invoiceNumber != null && inv.invoiceNumber.trim() !== "") return inv;
    maxNum += 1;
    changed = true;
    return { ...inv, invoiceNumber: `${INVOICE_NUMBER_PREFIX}${String(maxNum).padStart(INVOICE_NUMBER_PAD, "0")}` };
  });
  if (changed) save(next);
  return next;
}

function save(data: InvoiceDocument[]) {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(data));
}

function loadChangeLog(): InvoiceNumberChangeLogEntry[] {
  try {
    const raw = localStorage.getItem(INVOICE_NUMBER_LOG_KEY);
    return raw ? (JSON.parse(raw) as InvoiceNumberChangeLogEntry[]) : [];
  } catch {
    return [];
  }
}

function saveChangeLog(log: InvoiceNumberChangeLogEntry[]) {
  localStorage.setItem(INVOICE_NUMBER_LOG_KEY, JSON.stringify(log));
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

  getInvoiceByInvoiceNumber(invoiceNumber: string): InvoiceDocument | undefined {
    const normalized = (invoiceNumber ?? "").trim().toUpperCase();
    if (!normalized) return undefined;
    return load().find(
      (inv) => (inv.invoiceNumber ?? "").trim().toUpperCase() === normalized
    );
  },

  /** Next sequential invoice number (INV-0001, INV-0002, ...). Prevents duplicates. */
  nextInvoiceNumber(): string {
    const list = load();
    let maxNum = 0;
    for (const inv of list) {
      const n = inv.invoiceNumber ?? "";
      if (n.startsWith(INVOICE_NUMBER_PREFIX)) {
        const num = parseInt(n.slice(INVOICE_NUMBER_PREFIX.length), 10);
        if (!Number.isNaN(num)) maxNum = Math.max(maxNum, num);
      }
    }
    return `${INVOICE_NUMBER_PREFIX}${String(maxNum + 1).padStart(INVOICE_NUMBER_PAD, "0")}`;
  },

  /** Log when an admin changes an invoice number (for tracking). */
  logInvoiceNumberChange(entry: InvoiceNumberChangeLogEntry): void {
    const log = loadChangeLog();
    log.push(entry);
    saveChangeLog(log);
  },

  getInvoiceNumberChangeLog(): InvoiceNumberChangeLogEntry[] {
    return loadChangeLog();
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
    const invoiceNumber = this.nextInvoiceNumber();

    const invoice: InvoiceDocument = {
      id,
      invoiceNumber,
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

  /**
   * Full update of an invoice (admin edit). Recomputes totals from lines, discountPct, vatPct.
   * Validates: at least one line, non-negative numbers, valid status/dates.
   */
  updateInvoice(
    id: string,
    updates: Partial<
      Omit<
        InvoiceDocument,
        "id" | "subtotal" | "discountAmount" | "afterDiscount" | "vatAmount" | "total" | "updatedAt"
      >
    >
  ): { success: true; invoice: InvoiceDocument } | { success: false; error: string } {
    const list = load();
    const idx = list.findIndex((inv) => inv.id === id);
    if (idx === -1) return { success: false, error: "Invoice not found." };

    const current = list[idx];
    const lines = updates.lines ?? current.lines;
    if (lines.length === 0) return { success: false, error: "Invoice must have at least one line." };

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (
        typeof l.totalMeters !== "number" ||
        l.totalMeters < 0 ||
        typeof l.pricePerMeter !== "number" ||
        l.pricePerMeter < 0
      ) {
        return { success: false, error: `Line ${i + 1}: meters and rate must be non-negative numbers.` };
      }
    }

    const discountPct = updates.discountPct ?? current.discountPct;
    const vatPct = updates.vatPct ?? current.vatPct;
    if (discountPct < 0 || discountPct > 100 || vatPct < 0 || vatPct > 100) {
      return { success: false, error: "Discount and VAT must be between 0 and 100." };
    }

    const statuses: InvoiceDocument["status"][] = ["DRAFT", "ISSUED", "PAID", "CANCELLED"];
    if (updates.status !== undefined && !statuses.includes(updates.status)) {
      return { success: false, error: "Invalid status." };
    }

    if (updates.invoiceNumber !== undefined) {
      const newNum = (updates.invoiceNumber ?? "").trim();
      if (!newNum) return { success: false, error: "Invoice number cannot be empty." };
      const existing = this.getInvoiceByInvoiceNumber(newNum);
      if (existing && existing.id !== id) {
        return { success: false, error: `Invoice number "${newNum}" is already used by another invoice.` };
      }
      const oldNum = (current.invoiceNumber ?? "").trim();
      if (oldNum !== newNum) {
        this.logInvoiceNumberChange({
          invoiceId: id,
          oldInvoiceNumber: oldNum || "(none)",
          newInvoiceNumber: newNum,
          changedAt: new Date().toISOString(),
        });
      }
    }

    const recomputedLines = lines.map((l) => ({
      ...l,
      lineTotal: Math.round(l.totalMeters * l.pricePerMeter * 100) / 100,
    }));
    const subtotal = Math.round(recomputedLines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
    const discountAmount = Math.round(subtotal * (discountPct / 100) * 100) / 100;
    const afterDiscount = Math.round((subtotal - discountAmount) * 100) / 100;
    const vatAmount = Math.round(afterDiscount * (vatPct / 100) * 100) / 100;
    const total = Math.round((afterDiscount + vatAmount) * 100) / 100;

    const now = new Date().toISOString();
    const updated: InvoiceDocument = {
      ...current,
      ...updates,
      lines: recomputedLines,
      subtotal,
      discountPct,
      discountAmount,
      afterDiscount,
      vatPct,
      vatAmount,
      total,
      updatedAt: now,
    };
    list[idx] = updated;
    save(list);
    return { success: true, invoice: updated };
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
