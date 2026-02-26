/**
 * Production Forge backend API — runs, customers, pricing. Uses admin JWT.
 */

import { API_BASE_URL } from "@/api/constants";
import { ADMIN_PATHS } from "@/api/constants";
import { adminAuthApi } from "@/api/adminAuth";
import type { ProductionRun, CustomerEntity, ProductionBillingStatus } from "@/types/production";

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

function mapRunFromBackend(r: Record<string, unknown>): ProductionRun {
  return {
    id: String(r.id),
    date: String(r.date),
    machine: String(r.machine),
    customerEntityId: String(r.customer_entity_id),
    designRef: String(r.design_ref),
    fabric: String(r.fabric),
    metersPrinted: Number(r.meters_printed),
    quantity: r.quantity != null ? Number(r.quantity) : undefined,
    notes: String(r.notes ?? ""),
    sourceOrderId: r.source_order_id ? String(r.source_order_id) : undefined,
    billingStatus: (r.billing_status as ProductionBillingStatus) ?? "DRAFT",
    invoiceId: r.invoice_id ? String(r.invoice_id) : undefined,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

function mapCustomerFromBackend(c: Record<string, unknown>): CustomerEntity {
  return {
    id: String(c.id),
    displayName: String(c.display_name),
    aliases: Array.isArray(c.aliases) ? c.aliases as string[] : [],
    defaultPricePerMeter: c.default_price_per_meter != null ? Number(c.default_price_per_meter) : undefined,
    defaultDiscountPct: c.default_discount_pct != null ? Number(c.default_discount_pct) : undefined,
    phone: String(c.phone ?? ""),
    email: String(c.email ?? ""),
    notes: String(c.notes ?? ""),
    createdAt: String(c.created_at),
    updatedAt: String(c.updated_at),
  };
}

function unwrapPaginated(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "results" in (data as Record<string, unknown>)) {
    const results = (data as Record<string, unknown>).results;
    if (Array.isArray(results)) return results;
  }
  return [];
}

export const adminProductionApi = {
  async getRuns(billingStatus?: string): Promise<ProductionRun[]> {
    const path = billingStatus
      ? `${ADMIN_PATHS.production.runs}?billing_status=${encodeURIComponent(billingStatus)}`
      : ADMIN_PATHS.production.runs;
    const data = await adminRequest<unknown>(path);
    return unwrapPaginated(data).map((r) => mapRunFromBackend(r as Record<string, unknown>));
  },

  async addRun(data: Omit<ProductionRun, "id" | "createdAt" | "updatedAt" | "billingStatus">): Promise<ProductionRun> {
    const body = {
      date: data.date,
      machine: data.machine,
      customer_entity_id: parseInt(data.customerEntityId, 10) || data.customerEntityId,
      design_ref: data.designRef,
      fabric: data.fabric,
      meters_printed: data.metersPrinted,
      quantity: data.quantity ?? null,
      notes: data.notes ?? "",
      source_order_id: data.sourceOrderId ?? null,
    };
    const r = await adminRequest<Record<string, unknown>>(ADMIN_PATHS.production.runs, {
      method: "POST",
      body,
    });
    return mapRunFromBackend(r);
  },

  async updateRun(
    id: string,
    updates: Partial<Pick<ProductionRun, "date" | "machine" | "designRef" | "fabric" | "metersPrinted" | "quantity" | "notes" | "sourceOrderId">>
  ): Promise<ProductionRun> {
    const body: Record<string, unknown> = {};
    if (updates.date != null) body.date = updates.date;
    if (updates.machine != null) body.machine = updates.machine;
    if (updates.designRef != null) body.design_ref = updates.designRef;
    if (updates.fabric != null) body.fabric = updates.fabric;
    if (updates.metersPrinted != null) body.meters_printed = updates.metersPrinted;
    if (updates.quantity != null) body.quantity = updates.quantity;
    if (updates.notes != null) body.notes = updates.notes;
    if (updates.sourceOrderId != null) body.source_order_id = updates.sourceOrderId;
    const r = await adminRequest<Record<string, unknown>>(
      ADMIN_PATHS.production.runDetail(parseInt(id, 10)),
      { method: "PATCH", body }
    );
    return mapRunFromBackend(r);
  },

  async deleteRun(id: string): Promise<void> {
    await adminRequest(ADMIN_PATHS.production.runDetail(parseInt(id, 10)), { method: "DELETE" });
  },

  async approveRuns(ids: string[]): Promise<number> {
    const numericIds = ids.map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n));
    const r = await adminRequest<{ approved: number }>(ADMIN_PATHS.production.runsApprove, {
      method: "POST",
      body: { ids: numericIds },
    });
    return r.approved ?? 0;
  },

  async getCustomers(): Promise<CustomerEntity[]> {
    const data = await adminRequest<unknown>(ADMIN_PATHS.production.customers);
    return unwrapPaginated(data).map((c) => mapCustomerFromBackend(c as Record<string, unknown>));
  },

  /** Bulk import production runs (Import Wizard). Returns { imported, runs, errors }. */
  async importRuns(
    runs: Array<{
      date: string;
      machine: string;
      customerEntityId: string;
      designRef: string;
      fabric: string;
      metersPrinted: number;
      quantity?: number;
      notes?: string;
      sourceOrderId?: string;
    }>
  ): Promise<{ imported: number; runs: ProductionRun[]; errors: Array<{ index: number; error: string }> }> {
    const body = {
      runs: runs.map((r) => ({
        date: r.date,
        machine: r.machine,
        customer_entity_id: parseInt(r.customerEntityId, 10) || r.customerEntityId,
        design_ref: r.designRef,
        fabric: r.fabric,
        meters_printed: r.metersPrinted,
        quantity: r.quantity ?? null,
        notes: r.notes ?? "",
        source_order_id: r.sourceOrderId ?? null,
      })),
    };
    const data = await adminRequest<{
      imported: number;
      runs: Record<string, unknown>[];
      errors: Array<{ index: number; error: string }>;
    }>(ADMIN_PATHS.production.runsImport, { method: "POST", body });
    return {
      imported: data.imported ?? 0,
      runs: (data.runs ?? []).map((r) => mapRunFromBackend(r)),
      errors: data.errors ?? [],
    };
  },

  /** Create a production customer (e.g. when logging a web order so the run shows the customer name). */
  async createCustomer(payload: {
    display_name: string;
    email?: string;
    phone?: string;
    notes?: string;
  }): Promise<CustomerEntity> {
    const r = await adminRequest<Record<string, unknown>>(ADMIN_PATHS.production.customers, {
      method: "POST",
      body: payload,
    });
    return mapCustomerFromBackend(r);
  },
};
