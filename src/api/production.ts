import type {
  ProductionRun,
  ProductionBillingStatus,
  CustomerEntity,
  PricingRule,
} from "@/types/production";
import type { Order } from "@/types/order";
import { ordersApi } from "@/api/orders";

// ─── Storage keys ────────────────────────────────────────────
const RUNS_KEY = "dtx_production_runs";
const CUSTOMERS_KEY = "dtx_customer_entities";
const PRICING_KEY = "dtx_pricing_rules";

// ─── Generic helpers ─────────────────────────────────────────
function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Seed data ───────────────────────────────────────────────
const SEED_CUSTOMERS: CustomerEntity[] = [
  {
    id: "cust-palma",
    displayName: "Palma",
    aliases: ["Palma.7", "بالما"],
    defaultPricePerMeter: 80,
    defaultDiscountPct: 3,
    phone: "",
    email: "",
    notes: "Regular sublimation client",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_MACHINES = ["New Kundo", "Old Kundo"];
const SEED_FABRICS = ["كتان 50-50", "Waterproof", "Tulle", "Polyester", "Linen"];

// ─── Customer Entity API ─────────────────────────────────────
function getCustomers(): CustomerEntity[] {
  let list = load<CustomerEntity>(CUSTOMERS_KEY);
  if (list.length === 0) {
    list = [...SEED_CUSTOMERS];
    save(CUSTOMERS_KEY, list);
  }
  return list;
}

// ─── Pricing Rule API ────────────────────────────────────────
function getPricingRules(): PricingRule[] {
  return load<PricingRule>(PRICING_KEY);
}

// ─── Production Run API ──────────────────────────────────────
function getRuns(): ProductionRun[] {
  return load<ProductionRun>(RUNS_KEY);
}

function saveRuns(runs: ProductionRun[]) {
  save(RUNS_KEY, runs);
}

// ─── Public API ──────────────────────────────────────────────
export const productionApi = {
  // ── Machines & fabrics (static lists for dropdowns) ──────
  getMachines(): string[] {
    return SEED_MACHINES;
  },

  getCommonFabrics(): string[] {
    return SEED_FABRICS;
  },

  // ── Customer Entities ────────────────────────────────────
  getAllCustomerEntities(): CustomerEntity[] {
    return getCustomers();
  },

  getCustomerEntityById(id: string): CustomerEntity | undefined {
    return getCustomers().find((c) => c.id === id);
  },

  addCustomerEntity(
    data: Omit<CustomerEntity, "id" | "createdAt" | "updatedAt">
  ): CustomerEntity {
    const list = getCustomers();
    const now = new Date().toISOString();
    const entity: CustomerEntity = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    list.push(entity);
    save(CUSTOMERS_KEY, list);
    return entity;
  },

  updateCustomerEntity(
    id: string,
    updates: Partial<Omit<CustomerEntity, "id" | "createdAt">>
  ): CustomerEntity | undefined {
    const list = getCustomers();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    save(CUSTOMERS_KEY, list);
    return list[idx];
  },

  deleteCustomerEntity(id: string): boolean {
    const list = getCustomers();
    const filtered = list.filter((c) => c.id !== id);
    if (filtered.length === list.length) return false;
    save(CUSTOMERS_KEY, filtered);
    return true;
  },

  /** Get or create a customer entity for web orders (used when adding approved orders to production sheet). */
  getOrCreateWebOrderCustomerEntity(): string {
    const list = getCustomers();
    const existing = list.find((c) => c.displayName === "Web orders" || c.id === "cust-web-orders");
    if (existing) return existing.id;
    const now = new Date().toISOString();
    const entity: CustomerEntity = {
      id: "cust-web-orders",
      displayName: "Web orders",
      aliases: [],
      notes: "Orders from the customer-facing shop",
      createdAt: now,
      updatedAt: now,
    };
    list.push(entity);
    save(CUSTOMERS_KEY, list);
    return entity.id;
  },

  /** If a run with this sourceOrderId already exists, return its id; otherwise return undefined. */
  getRunBySourceOrderId(sourceOrderId: string): ProductionRun | undefined {
    return getRuns().find((r) => r.sourceOrderId === sourceOrderId);
  },

  /** Create a production run from a shop order (customer or quotation). Called when any order is created so it appears in the sheet. */
  addRunFromOrder(order: Order): void {
    if (this.getRunBySourceOrderId(order.id)) return;
    const item = order.items?.[0];
    if (!item) return;
    const designSource = item.designChoice?.source;
    let designRef = "Unknown";
    if (designSource === "existing" && item.designChoice?.presetId) {
      designRef = ordersApi.getPresetById(item.designChoice.presetId)?.name ?? item.designChoice.presetId;
    } else if (designSource === "upload") designRef = "Upload";
    else if (designSource === "my_library") designRef = item.myLibraryDesignSnapshot?.name ?? "My Library";
    else if (designSource === "repeat") designRef = "Repeat";
    const fabricName = item.fabricChoice?.factoryFabricId
      ? ordersApi.getFactoryFabricById(item.fabricChoice.factoryFabricId)?.name ?? "Factory"
      : "Customer provides";
    const today = new Date().toISOString().slice(0, 10);
    const machine = this.getMachines()[0] ?? "Default";
    this.addRun({
      date: today,
      machine,
      customerEntityId: this.getOrCreateWebOrderCustomerEntity(),
      designRef,
      fabric: fabricName,
      metersPrinted: item.quantity ?? 0,
      notes: item.notes ?? "",
      sourceOrderId: order.id,
    });
  },

  // ── Pricing Rules ────────────────────────────────────────
  getAllPricingRules(): PricingRule[] {
    return getPricingRules();
  },

  getPricingRulesForCustomer(customerEntityId: string): PricingRule[] {
    return getPricingRules().filter((r) => r.customerEntityId === customerEntityId);
  },

  addPricingRule(
    data: Omit<PricingRule, "id" | "createdAt">
  ): PricingRule {
    const list = getPricingRules();
    const rule: PricingRule = {
      ...data,
      id: `pr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.push(rule);
    save(PRICING_KEY, list);
    return rule;
  },

  deletePricingRule(id: string): boolean {
    const list = getPricingRules();
    const filtered = list.filter((r) => r.id !== id);
    if (filtered.length === list.length) return false;
    save(PRICING_KEY, filtered);
    return true;
  },

  /** Resolve the price-per-meter for a given run context.
   *  Priority: specific rule (fabric+design) > fabric-only rule > customer default > 80 EGP fallback
   */
  resolvePricePerMeter(
    customerEntityId: string,
    fabric: string,
    designRef: string
  ): number {
    const rules = this.getPricingRulesForCustomer(customerEntityId);
    const normalize = (s: string) => s.trim().toLowerCase();
    // Most specific first: fabric + design
    const exact = rules.find(
      (r) =>
        r.fabric &&
        r.designRef &&
        normalize(r.fabric) === normalize(fabric) &&
        normalize(r.designRef) === normalize(designRef)
    );
    if (exact) return exact.pricePerMeter;
    // Fabric-only
    const fabricOnly = rules.find(
      (r) => r.fabric && !r.designRef && normalize(r.fabric) === normalize(fabric)
    );
    if (fabricOnly) return fabricOnly.pricePerMeter;
    // Design-only
    const designOnly = rules.find(
      (r) => !r.fabric && r.designRef && normalize(r.designRef) === normalize(designRef)
    );
    if (designOnly) return designOnly.pricePerMeter;
    // Customer default
    const customer = this.getCustomerEntityById(customerEntityId);
    if (customer?.defaultPricePerMeter) return customer.defaultPricePerMeter;
    // Global fallback
    return 80;
  },

  // ── Production Runs ──────────────────────────────────────
  getAllRuns(): ProductionRun[] {
    return getRuns().sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  getRunById(id: string): ProductionRun | undefined {
    return getRuns().find((r) => r.id === id);
  },

  getRunsByCustomer(customerEntityId: string): ProductionRun[] {
    return this.getAllRuns().filter((r) => r.customerEntityId === customerEntityId);
  },

  getRunsByStatus(status: ProductionBillingStatus): ProductionRun[] {
    return this.getAllRuns().filter((r) => r.billingStatus === status);
  },

  /** Get runs that are APPROVED and ready for billing, optionally filtered by customer & date range */
  getApprovableRuns(params?: {
    customerEntityId?: string;
    from?: string;
    to?: string;
  }): ProductionRun[] {
    return this.getAllRuns().filter((r) => {
      if (r.billingStatus !== "APPROVED") return false;
      if (params?.customerEntityId && r.customerEntityId !== params.customerEntityId) return false;
      if (params?.from && r.date < params.from) return false;
      if (params?.to && r.date > params.to) return false;
      return true;
    });
  },

  addRun(
    data: Omit<ProductionRun, "id" | "createdAt" | "updatedAt" | "billingStatus"> & {
      billingStatus?: ProductionBillingStatus;
    }
  ): ProductionRun {
    const runs = getRuns();
    const now = new Date().toISOString();
    const run: ProductionRun = {
      ...data,
      id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      billingStatus: data.billingStatus ?? "DRAFT",
      createdAt: now,
      updatedAt: now,
    };
    runs.push(run);
    saveRuns(runs);
    return run;
  },

  updateRun(
    id: string,
    updates: Partial<Omit<ProductionRun, "id" | "createdAt">>
  ): ProductionRun | undefined {
    const runs = getRuns();
    const idx = runs.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    runs[idx] = { ...runs[idx], ...updates, updatedAt: new Date().toISOString() };
    saveRuns(runs);
    return runs[idx];
  },

  deleteRun(id: string): boolean {
    const runs = getRuns();
    const filtered = runs.filter((r) => r.id !== id);
    if (filtered.length === runs.length) return false;
    saveRuns(filtered);
    return true;
  },

  /** Remove all production runs (clears Production Forge data) */
  clearAllRuns(): void {
    saveRuns([]);
  },

  /** Bulk-approve selected runs for billing */
  approveRuns(ids: string[]): number {
    const runs = getRuns();
    let count = 0;
    const now = new Date().toISOString();
    for (const run of runs) {
      if (ids.includes(run.id) && run.billingStatus === "DRAFT") {
        run.billingStatus = "APPROVED";
        run.updatedAt = now;
        count++;
      }
    }
    saveRuns(runs);
    return count;
  },

  /** Mark runs as invoiced (called by billingApi after invoice creation) */
  markRunsInvoiced(ids: string[], invoiceId: string): void {
    const runs = getRuns();
    const now = new Date().toISOString();
    for (const run of runs) {
      if (ids.includes(run.id)) {
        run.billingStatus = "INVOICED";
        run.invoiceId = invoiceId;
        run.updatedAt = now;
      }
    }
    saveRuns(runs);
  },

  /** Import multiple runs at once (used by the Excel import wizard) */
  importRuns(
    data: Omit<ProductionRun, "id" | "createdAt" | "updatedAt">[]
  ): ProductionRun[] {
    const runs = getRuns();
    const now = new Date().toISOString();
    const imported: ProductionRun[] = data.map((d, i) => ({
      ...d,
      id: `run-imp-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    }));
    runs.push(...imported);
    saveRuns(runs);
    return imported;
  },

  // ── Aggregation helpers ──────────────────────────────────
  /** Total meters printed by customer, optionally in a date range */
  totalMetersByCustomer(
    customerEntityId: string,
    from?: string,
    to?: string
  ): number {
    return this.getRunsByCustomer(customerEntityId)
      .filter((r) => {
        if (from && r.date < from) return false;
        if (to && r.date > to) return false;
        return true;
      })
      .reduce((sum, r) => sum + r.metersPrinted, 0);
  },

  /** Total meters that have been invoiced for a customer */
  totalInvoicedMetersByCustomer(customerEntityId: string): number {
    return this.getRunsByCustomer(customerEntityId)
      .filter((r) => r.billingStatus === "INVOICED")
      .reduce((sum, r) => sum + r.metersPrinted, 0);
  },
};
