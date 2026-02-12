import type {
  Order,
  OrderItem,
  OrderStatus,
  PresetDesign,
  DesignChoice,
  FabricChoice,
  PaymentMethod,
  Invoice,
} from "@/types/order";

const PRESETS: PresetDesign[] = [
  { id: "p1", name: "Classic Stripes", description: "Horizontal stripes", imageUrl: "/placeholder.svg", basePricePerUnit: 25 },
  { id: "p2", name: "Floral Print", description: "Floral pattern", imageUrl: "/placeholder.svg", basePricePerUnit: 35 },
  { id: "p3", name: "Geometric", description: "Geometric design", imageUrl: "/placeholder.svg", basePricePerUnit: 30 },
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

  getOrdersByUserId(userId: string): Order[] {
    const all = loadOrders();
    return all.filter((o) => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrderById(orderId: string): Order | undefined {
    return loadOrders().find((o) => o.id === orderId);
  },

  computeUnitPrice(designChoice: DesignChoice, fabricChoice: FabricChoice): number {
    let base = 20;
    if (designChoice.source === "preset" && designChoice.presetId) {
      const preset = this.getPresetById(designChoice.presetId);
      if (preset) base = preset.basePricePerUnit;
    } else if (designChoice.source === "upload") {
      base = 28;
    } else if (designChoice.source === "repeat") {
      base = 22;
    }
    if (fabricChoice.fabricSource === "factory") {
      base += fabricChoice.fabricType === "natural" ? 15 : 10;
    }
    return base;
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
      } else if (params.paymentMethod === "BANK_TRANSFER" && params.paymentProofFileName) {
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
};
