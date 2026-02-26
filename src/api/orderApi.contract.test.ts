import { describe, it, expect, beforeEach, vi } from "vitest";
import { orderApi } from "./orderApi";

const mockOrderList = [
  {
    id: 1,
    order_id: "ABC123XYZ456",
    status: "pending",
    quantity: 10,
    total_amount: "500.00",
    created_at: "2025-01-15T10:00:00Z",
  },
];

const mockOrderDetail = {
  id: 1,
  order_id: "ABC123XYZ456",
  status: "pending",
  order_type: { id: 1, name: "Order" },
  order_type_id: 1,
  fabric_type: { id: 1, name: "Cotton" },
  fabric_type_id: 1,
  fabric_inventory: { id: 1, name: "Cotton White", price: "50.00", min_quantity: 5 },
  fabric_inventory_id: 1,
  fabric_source: "factory_provide",
  design: { id: 1, name: "Design A", file: null },
  design_id: 1,
  design_studio: null,
  design_studio_id: null,
  custom_design: null,
  quantity: 10,
  total_amount: "500.00",
  notes: null,
  payment: null,
  quotation: null,
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-01-15T10:00:00Z",
};

describe("orderApi (contract with backend)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init?: RequestInit) => {
        const path = url.replace(/^https?:\/\/[^/]+/, "");
        if (path === "/api/order/add/" && init?.method === "GET") {
          return Promise.resolve(
            new Response(JSON.stringify(mockOrderList), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          );
        }
        if (path.startsWith("/api/order/details/") && init?.method === "GET") {
          return Promise.resolve(
            new Response(JSON.stringify(mockOrderDetail), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          );
        }
        if (path === "/api/order/add/" && init?.method === "POST") {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                ...mockOrderDetail,
                order_id: "NEWORDER123",
                id: 2,
              }),
              { status: 201, headers: { "Content-Type": "application/json" } }
            )
          );
        }
        if (path.startsWith("/api/order/fabric-inventory") && init?.method === "GET") {
          return Promise.resolve(
            new Response(
              JSON.stringify([
                { id: 1, name: "Cotton White", description: null, min_quantity: 5, available_meter: "100", image: null, price: "50.00", created_at: "", updated_at: "" },
              ]),
              { status: 200, headers: { "Content-Type": "application/json" } }
            )
          );
        }
        return Promise.resolve(new Response(JSON.stringify({ detail: "Not found" }), { status: 404 }));
      })
    );
    localStorage.clear();
    localStorage.setItem(
      "dtx_session",
      JSON.stringify({
        user: { id: "1", email: "u@example.com", name: "User", username: "u", customerType: "EXISTING" },
        accessToken: "mock-token",
        refreshToken: "mock-refresh",
      })
    );
  });

  it("listOrders calls GET /api/order/add/ and maps to Order[]", async () => {
    const orders = await orderApi.listOrders();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0].id).toBe("ABC123XYZ456");
    expect(orders[0].status).toBe("SUBMITTED");
    expect(orders[0].totalAmount).toBe(500);
  });

  it("getOrder calls GET /api/order/details/:orderId/ and maps to Order", async () => {
    const order = await orderApi.getOrder("ABC123XYZ456");
    expect(order).not.toBeNull();
    if (order) {
      expect(order.id).toBe("ABC123XYZ456");
      expect(order.items.length).toBe(1);
      expect(order.items[0].quantity).toBe(10);
    }
  });

  it("getFabricInventory calls GET /api/order/fabric-inventory/", async () => {
    const list = await orderApi.getFabricInventory(1);
    expect(Array.isArray(list)).toBe(true);
    expect(list[0].id).toBe(1);
    expect(list[0].name).toBe("Cotton White");
    expect(parseFloat(list[0].price)).toBe(50);
  });
});
