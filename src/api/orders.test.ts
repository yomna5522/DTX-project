import { describe, it, expect, beforeEach } from "vitest";
import { ordersApi } from "./orders";
import type { DesignChoice, FabricChoice } from "@/types/order";

describe("ordersApi", () => {
  beforeEach(() => {
    localStorage.removeItem("dtx_orders");
  });

  it("returns preset designs", () => {
    const presets = ordersApi.getPresetDesigns();
    expect(presets.length).toBeGreaterThan(0);
    expect(presets[0]).toHaveProperty("id");
    expect(presets[0]).toHaveProperty("basePricePerUnit");
  });

  it("computes unit price for existing preset design and factory fabric", () => {
    const design: DesignChoice = { source: "existing", presetId: "p1" };
    const fabric: FabricChoice = { fabricType: "sublimation", orderType: "order", fabricSource: "factory", factoryFabricId: "f1" };
    const price = ordersApi.computeUnitPrice(design, fabric);
    expect(price).toBeGreaterThan(0);
  });

  it("computes unit price for upload and customer fabric", () => {
    const design: DesignChoice = { source: "upload", uploadFileName: "file.png" };
    const fabric: FabricChoice = { fabricType: "natural", orderType: "order", fabricSource: "customer" };
    const price = ordersApi.computeUnitPrice(design, fabric);
    expect(price).toBeGreaterThan(0);
  });

  it("creates order for NEW customer with COD and sets PAID status", () => {
    const order = ordersApi.createOrder({
      userId: "user-new",
      customerType: "NEW",
      designChoice: { source: "existing", presetId: "p1" },
      fabricChoice: { fabricType: "sublimation", orderType: "order", fabricSource: "factory", factoryFabricId: "f1" },
      quantity: 5,
      notes: "",
      paymentMethod: "COD",
    });
    expect(order.id).toBeDefined();
    expect(order.userId).toBe("user-new");
    expect(order.status).toBe("PAID");
    expect(order.invoice?.status).toBe("ISSUED");
    expect(order.totalAmount).toBeGreaterThan(0);
  });

  it("creates order for EXISTING customer with INVOICE_PENDING status", () => {
    const order = ordersApi.createOrder({
      userId: "user-existing",
      customerType: "EXISTING",
      designChoice: { source: "existing", presetId: "p1" },
      fabricChoice: { fabricType: "natural", orderType: "order", fabricSource: "customer" },
      quantity: 2,
      notes: "Rush",
      paymentMethod: "instapay",
    });
    expect(order.status).toBe("INVOICE_PENDING");
    expect(order.invoice?.status).toBe("PENDING");
  });
});
