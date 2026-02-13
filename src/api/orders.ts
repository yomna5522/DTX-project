import type {
  Order,
  OrderItem,
  OrderStatus,
  PresetDesign,
  DesignChoice,
  FabricChoice,
  PaymentMethod,
  Invoice,
  FactoryFabric,
} from "@/types/order";

import aestheticWallpaper from "@/assets/𝘈𝘦𝘴𝘵𝘩𝘦𝘵𝘪𝘤 𝘞𝘢𝘭𝘭𝘱𝘢𝘱𝘦𝘳.jpg";
import cherryRedWallpaper from "@/assets/Cherry red wallpaper.jpg";
import ginghamPattern from "@/assets/Free digital gingham scrapbooking paper - ausdruckbares Geschenkpapier - freebie.jpg";

const PRESETS: PresetDesign[] = [
  { id: "p1", name: "Aesthetic Floral", description: "Beautiful floral wallpaper pattern", imageUrl: aestheticWallpaper, basePricePerUnit: 35 },
  { id: "p2", name: "Cherry Red", description: "Vibrant cherry red pattern", imageUrl: cherryRedWallpaper, basePricePerUnit: 40 },
  { id: "p3", name: "Gingham Classic", description: "Classic gingham check pattern", imageUrl: ginghamPattern, basePricePerUnit: 30 },
];

const FACTORY_FABRICS: FactoryFabric[] = [
  { id: "f1", name: "Premium Sublimation Polyester", type: "sublimation", pricePerMeter: 45, minimumQuantity: 1, description: "High-quality polyester for vibrant sublimation prints" },
  { id: "f2", name: "Standard Sublimation Fabric", type: "sublimation", pricePerMeter: 35, minimumQuantity: 1, description: "Standard polyester fabric for sublimation" },
  { id: "f3", name: "Organic Cotton Natural", type: "natural", pricePerMeter: 55, minimumQuantity: 5, description: "100% organic cotton for direct printing" },
  { id: "f4", name: "Cotton Blend Natural", type: "natural", pricePerMeter: 40, minimumQuantity: 5, description: "Cotton blend fabric for natural printing" },
  { id: "f5", name: "Linen Natural", type: "natural", pricePerMeter: 65, minimumQuantity: 5, description: "Premium linen fabric for direct printing" },
];

let orders: Order[] = [];
const ORDERS_STORAGE_KEY = "dtx_orders";

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveOrders() {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

// Initialize from storage
orders = loadOrders();

export const ordersApi = {
  getPresetDesigns(): PresetDesign[] {
    return PRESETS;
  },

  getPresetById(id: string): PresetDesign | undefined {
    return PRESETS.find((p) => p.id === id);
  },

  getFactoryFabrics(): FactoryFabric[] {
    return FACTORY_FABRICS;
  },

  getFactoryFabricById(id: string): FactoryFabric | undefined {
    return FACTORY_FABRICS.find((f) => f.id === id);
  },

  getOrdersByUserId(userId: string): Order[] {
    const all = loadOrders();
    return all.filter((o) => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrderById(orderId: string): Order | undefined {
    return loadOrders().find((o) => o.id === orderId);
  },

  computeUnitPrice(designChoice: DesignChoice, fabricChoice: FabricChoice): number {
    // If factory provides fabric, use factory fabric pricing
    if (fabricChoice.fabricSource === "factory" && fabricChoice.factoryFabricId) {
      const fabric = this.getFactoryFabricById(fabricChoice.factoryFabricId);
      if (fabric) {
        return fabric.pricePerMeter;
      }
    }

    // Default pricing for other scenarios
    let base = 20;
    if (designChoice.source === "existing" && designChoice.presetId) {
      const preset = this.getPresetById(designChoice.presetId);
      if (preset) base = preset.basePricePerUnit;
    } else if (designChoice.source === "upload") {
      base = 28;
    } else if (designChoice.source === "repeat") {
      base = 22;
    }

    // Add fabric type premium if customer provides fabric
    if (fabricChoice.fabricSource === "customer") {
      base += fabricChoice.fabricType === "natural" ? 15 : 10;
    }

    return base;
  },

  getMinimumQuantity(fabricChoice: FabricChoice): number {
    // Sample orders
    if (fabricChoice.orderType === "sample") {
      return fabricChoice.fabricType === "sublimation" ? 1 : 5;
    }

    // Regular orders with factory fabric
    if (fabricChoice.fabricSource === "factory" && fabricChoice.factoryFabricId) {
      const fabric = this.getFactoryFabricById(fabricChoice.factoryFabricId);
      return fabric?.minimumQuantity || 1;
    }

    // Default minimum
    return 1;
  },

  createOrder(params: {
    userId: string;
    customerType: "NEW" | "EXISTING";
    designChoice: DesignChoice;
    fabricChoice: FabricChoice;
    quantity: number;
    notes: string;
    paymentMethod: PaymentMethod;
    paymentProofFileName?: string;
  }): Order {
    const unitPrice = this.computeUnitPrice(params.designChoice, params.fabricChoice);
    const totalPrice = unitPrice * params.quantity;
    const now = new Date().toISOString();
    const orderId = `ord-${Date.now()}`;
    const item: OrderItem = {
      designChoice: params.designChoice,
      fabricChoice: params.fabricChoice,
      quantity: params.quantity,
      notes: params.notes,
      unitPrice,
      totalPrice,
    };
    let status: OrderStatus = "SUBMITTED";
    let invoice: Invoice | undefined;
    if (params.customerType === "NEW") {
      status = "INVOICED";
      invoice = {
        id: `inv-${orderId}`,
        orderId,
        amount: totalPrice,
        issuedAt: now,
        status: "ISSUED",
      };
      if (params.paymentMethod === "COD") {
        status = "PAID";
      } else if (params.paymentMethod === "instapay" && params.paymentProofFileName) {
        status = "PAYMENT_PENDING";
      }
    } else {
      status = "INVOICE_PENDING";
      invoice = {
        id: `inv-${orderId}`,
        orderId,
        amount: totalPrice,
        issuedAt: now,
        status: "PENDING",
      };
    }
    const order: Order = {
      id: orderId,
      userId: params.userId,
      status,
      items: [item],
      totalAmount: totalPrice,
      paymentMethod: params.paymentMethod,
      paymentProofFileName: params.paymentProofFileName,
      invoice,
      createdAt: now,
      updatedAt: now,
      estimatedCompletion: undefined,
    };
    orders = loadOrders();
    orders.push(order);
    saveOrders();
    return order;
  },

  repeatOrder(orderId: string, userId: string, customerType: "NEW" | "EXISTING"): Order | null {
    const existing = this.getOrderById(orderId);
    if (!existing || existing.userId !== userId) return null;
    const item = existing.items[0];
    if (!item) return null;
    return this.createOrder({
      userId,
      customerType,
      designChoice: { ...item.designChoice, source: "repeat" as const, repeatOrderId: orderId },
      fabricChoice: item.fabricChoice,
      quantity: item.quantity,
      notes: item.notes,
      paymentMethod: "COD",
    });
  },

  createQuotationRequest(params: {
    userId: string;
    designChoice: DesignChoice;
    fabricChoice: FabricChoice;
    quantity: number;
    notes: string;
  }): Order {
    // For quotation requests, we don't calculate price yet - it will be provided by admin
    const now = new Date().toISOString();
    const orderId = `quot-${Date.now()}`;
    const item: OrderItem = {
      designChoice: params.designChoice,
      fabricChoice: params.fabricChoice,
      quantity: params.quantity,
      notes: params.notes,
      unitPrice: 0, // Will be set when quotation is provided
      totalPrice: 0, // Will be set when quotation is provided
    };
    const order: Order = {
      id: orderId,
      userId: params.userId,
      status: "SUBMITTED", // Waiting for quotation
      items: [item],
      totalAmount: 0, // Will be set when quotation is provided
      // No payment method or invoice for quotation requests
      createdAt: now,
      updatedAt: now,
      estimatedCompletion: undefined,
    };
    orders = loadOrders();
    orders.push(order);
    saveOrders();
    return order;
  },
};
