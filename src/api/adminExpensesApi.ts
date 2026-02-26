/**
 * Admin Expenses API — categories and expenses CRUD.
 * Required: category name; expense description, amount, category, date. Rest optional.
 */

import { API_BASE_URL } from "@/api/constants";
import { ADMIN_PATHS } from "@/api/constants";
import { adminAuthApi } from "@/api/adminAuth";

export interface AdminExpenseCategoryItem {
  id: number;
  name: string;
  created_at: string;
}

export interface AdminExpenseItem {
  id: number;
  category: number;
  category_name: string;
  description: string;
  amount: number;
  date: string;
  paid_to: string | null;
  status: "Paid" | "Pending" | "Recurring";
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

async function adminRequest<T>(
  path: string,
  options: RequestInit & { method?: string; body?: unknown } = {}
): Promise<T> {
  const session = adminAuthApi.getSession();
  const token = session?.accessToken;
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
    const msg = data.detail ?? data.description ?? data.amount ?? data.category ?? data.error ?? data.message ?? "Request failed";
    const arr = Array.isArray(msg) ? msg : [msg];
    const first = arr[0];
    const str = typeof first === "string" ? first : first?.toString?.() ?? JSON.stringify(data);
    throw new Error(str);
  }
  return data as T;
}

function unwrapPaginated(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "results" in (data as Record<string, unknown>)) {
    const results = (data as Record<string, unknown>).results;
    if (Array.isArray(results)) return results;
  }
  return [];
}

export const adminExpensesApi = {
  async getCategories(): Promise<AdminExpenseCategoryItem[]> {
    const data = await adminRequest<unknown>(ADMIN_PATHS.expenseCategories);
    return unwrapPaginated(data).map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      name: String(r.name ?? ""),
      created_at: String(r.created_at ?? ""),
    }));
  },

  async createCategory(payload: { name: string }): Promise<AdminExpenseCategoryItem> {
    const r = await adminRequest<Record<string, unknown>>(ADMIN_PATHS.expenseCategories, {
      method: "POST",
      body: { name: payload.name.trim() },
    });
    return { id: Number(r.id), name: String(r.name), created_at: String(r.created_at) };
  },

  async updateCategory(id: number, payload: { name: string }): Promise<AdminExpenseCategoryItem> {
    const r = await adminRequest<Record<string, unknown>>(ADMIN_PATHS.expenseCategoryDetail(id), {
      method: "PATCH",
      body: { name: payload.name.trim() },
    });
    return { id: Number(r.id), name: String(r.name), created_at: String(r.created_at) };
  },

  async deleteCategory(id: number): Promise<void> {
    await adminRequest(ADMIN_PATHS.expenseCategoryDetail(id), { method: "DELETE" });
  },

  async getExpenses(): Promise<AdminExpenseItem[]> {
    const data = await adminRequest<unknown>(ADMIN_PATHS.expenses);
    return unwrapPaginated(data).map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      category: Number(r.category),
      category_name: String(r.category_name ?? ""),
      description: String(r.description ?? ""),
      amount: Number(r.amount ?? 0),
      date: String(r.date ?? ""),
      paid_to: r.paid_to != null && r.paid_to !== "" ? String(r.paid_to) : null,
      status: (r.status as AdminExpenseItem["status"]) ?? "Paid",
      payment_method: r.payment_method != null && r.payment_method !== "" ? String(r.payment_method) : null,
      created_at: String(r.created_at ?? ""),
      updated_at: String(r.updated_at ?? ""),
    }));
  },

  async createExpense(payload: {
    category: number;
    description: string;
    amount: number;
    date: string;
    paid_to?: string;
    status?: "Paid" | "Pending" | "Recurring";
    payment_method?: string;
  }): Promise<AdminExpenseItem> {
    const body: Record<string, unknown> = {
      category: payload.category,
      description: payload.description.trim(),
      amount: payload.amount,
      date: payload.date,
    };
    if (payload.paid_to?.trim()) body.paid_to = payload.paid_to.trim();
    if (payload.status) body.status = payload.status;
    if (payload.payment_method?.trim()) body.payment_method = payload.payment_method.trim();
    const r = await adminRequest<Record<string, unknown>>(ADMIN_PATHS.expenses, { method: "POST", body });
    return {
      id: Number(r.id),
      category: Number(r.category),
      category_name: String(r.category_name ?? ""),
      description: String(r.description ?? ""),
      amount: Number(r.amount ?? 0),
      date: String(r.date ?? ""),
      paid_to: r.paid_to != null && r.paid_to !== "" ? String(r.paid_to) : null,
      status: (r.status as AdminExpenseItem["status"]) ?? "Paid",
      payment_method: r.payment_method != null && r.payment_method !== "" ? String(r.payment_method) : null,
      created_at: String(r.created_at ?? ""),
      updated_at: String(r.updated_at ?? ""),
    };
  },

  async updateExpense(
    id: number,
    payload: Partial<{
      category: number;
      description: string;
      amount: number;
      date: string;
      paid_to: string;
      status: "Paid" | "Pending" | "Recurring";
      payment_method: string;
    }>
  ): Promise<AdminExpenseItem> {
    const body: Record<string, unknown> = {};
    if (payload.category !== undefined) body.category = payload.category;
    if (payload.description !== undefined) body.description = payload.description.trim();
    if (payload.amount !== undefined) body.amount = payload.amount;
    if (payload.date !== undefined) body.date = payload.date;
    if (payload.paid_to !== undefined) body.paid_to = payload.paid_to?.trim() || null;
    if (payload.status !== undefined) body.status = payload.status;
    if (payload.payment_method !== undefined) body.payment_method = payload.payment_method?.trim() || null;
    const r = await adminRequest<Record<string, unknown>>(ADMIN_PATHS.expenseDetail(id), { method: "PATCH", body });
    return {
      id: Number(r.id),
      category: Number(r.category),
      category_name: String(r.category_name ?? ""),
      description: String(r.description ?? ""),
      amount: Number(r.amount ?? 0),
      date: String(r.date ?? ""),
      paid_to: r.paid_to != null && r.paid_to !== "" ? String(r.paid_to) : null,
      status: (r.status as AdminExpenseItem["status"]) ?? "Paid",
      payment_method: r.payment_method != null && r.payment_method !== "" ? String(r.payment_method) : null,
      created_at: String(r.created_at ?? ""),
      updated_at: String(r.updated_at ?? ""),
    };
  },

  async deleteExpense(id: number): Promise<void> {
    await adminRequest(ADMIN_PATHS.expenseDetail(id), { method: "DELETE" });
  },
};
