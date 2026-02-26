/**
 * API contract constants — source of truth from backend urls and API_ENDPOINTS_FRONTEND.md.
 * Base URL: config.urls mounts accounts at api/, order at api/order/, etc.
 */

/** Django runserver default is 8000. Override with VITE_API_BASE_URL if you use another port (e.g. 9000). */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "http://localhost:8000";

/** Auth (accounts app) — prefix /api/ */
export const AUTH_PATHS = {
  register: "/api/register/",
  login: "/api/login/",
  verifyOtp: "/api/verify-otp/",
  resendOtp: "/api/resend_otp/",
  setPassword: "/api/set-password/",
  changePassword: "/api/change-password/",
  profile: "/api/profile/",
  tokenRefresh: "/api/token/refresh/",
} as const;

/** Orders (order app) — prefix /api/order/ */
export const ORDER_PATHS = {
  listCreate: "/api/order/add/",
  detail: (orderId: string) => `/api/order/details/${encodeURIComponent(orderId)}/`,
  payment: (orderId: string) => `/api/order/payment/${encodeURIComponent(orderId)}/`,
  fabricInventory: "/api/order/fabric-inventory/",
  designs: "/api/order/designs/",
  fabricTypes: "/api/order/fabric-types/",
  orderTypes: "/api/order/order-types/",
} as const;

/** Admin dashboard — prefix /api/admin/ */
export const ADMIN_PATHS = {
  login: "/api/admin/login/",
  /** Registered customers (User role=customer) for Customer Database page */
  customers: "/api/admin/customers/",
  /** Suppliers CRUD */
  suppliers: "/api/admin/suppliers/",
  supplierDetail: (id: number) => `/api/admin/suppliers/${id}/`,
  /** Expenses */
  expenseCategories: "/api/admin/expense-categories/",
  expenseCategoryDetail: (id: number) => `/api/admin/expense-categories/${id}/`,
  expenses: "/api/admin/expenses/",
  expenseDetail: (id: number) => `/api/admin/expenses/${id}/`,
  orders: "/api/admin/orders/",
  orderDetail: (pk: number) => `/api/admin/orders/${pk}/`,
  orderQuotations: (pk: number) => `/api/admin/orders/${pk}/quotations/`,
  production: {
    runs: "/api/admin/production/runs/",
    runDetail: (id: number) => `/api/admin/production/runs/${id}/`,
    runsApprove: "/api/admin/production/runs/approve/",
    runsImport: "/api/admin/production/runs/import/",
    customers: "/api/admin/production/customers/",
    customerDetail: (id: number) => `/api/admin/production/customers/${id}/`,
    pricingRules: "/api/admin/production/pricing-rules/",
  },
  billing: {
    invoices: "/api/admin/billing/invoices/",
    invoiceDetail: (id: number) => `/api/admin/billing/invoices/${id}/`,
    approvedRuns: "/api/admin/billing/approved-runs/",
  },
  /** Fabric inventory CRUD (admin) */
  fabricInventory: "/api/admin/fabric-inventory/",
  fabricInventoryDetail: (id: number) => `/api/admin/fabric-inventory/${id}/`,
  /** Design library CRUD (admin) */
  designs: "/api/admin/designs/",
  designDetail: (id: number) => `/api/admin/designs/${id}/`,
  /** Fabric types (for fabric inventory form) */
  fabricTypes: "/api/admin/fabric-types/",
} as const;
