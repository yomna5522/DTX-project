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

const PRESETS_DEFAULT: PresetDesign[] = [
  { id: "p1", name: "Aesthetic Floral", description: "Beautiful floral wallpaper pattern", imageUrl: aestheticWallpaper, basePricePerUnit: 35 },
  { id: "p2", name: "Cherry Red", description: "Vibrant cherry red pattern", imageUrl: cherryRedWallpaper, basePricePerUnit: 40 },
  { id: "p3", name: "Gingham Classic", description: "Classic gingham check pattern", imageUrl: ginghamPattern, basePricePerUnit: 30 },
];

const FACTORY_FABRICS_DEFAULT: FactoryFabric[] = [
  { id: "f1", name: "Premium Sublimation Polyester", type: "sublimation", pricePerMeter: 45, minimumQuantity: 1, availableMeters: 1000, description: "High-quality polyester for vibrant sublimation prints" },
  { id: "f2", name: "Standard Sublimation Fabric", type: "sublimation", pricePerMeter: 35, minimumQuantity: 1, availableMeters: 500, description: "Standard polyester fabric for sublimation" },
  { id: "f3", name: "Organic Cotton Natural", type: "natural", pricePerMeter: 55, minimumQuantity: 5, availableMeters: 300, description: "100% organic cotton for direct printing" },
  { id: "f4", name: "Cotton Blend Natural", type: "natural", pricePerMeter: 40, minimumQuantity: 5, availableMeters: 400, description: "Cotton blend fabric for natural printing" },
  { id: "f5", name: "Linen Natural", type: "natural", pricePerMeter: 65, minimumQuantity: 5, availableMeters: 200, description: "Premium linen fabric for direct printing" },
];

const ORDERS_STORAGE_KEY = "dtx_orders";
const PRESETS_STORAGE_KEY = "dtx_preset_designs";
const FABRICS_STORAGE_KEY = "dtx_factory_fabrics";

let orders: Order[] = [];

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

function loadPresets(): PresetDesign[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function savePresets(data: PresetDesign[]) {
  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(data));
}

function loadFactoryFabrics(): FactoryFabric[] {
  try {
    const raw = localStorage.getItem(FABRICS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveFactoryFabrics(data: FactoryFabric[]) {
  localStorage.setItem(FABRICS_STORAGE_KEY, JSON.stringify(data));
}

// Seed defaults if storage empty
function getPresets(): PresetDesign[] {
  let list = loadPresets();
  if (list.length === 0) {
    list = PRESETS_DEFAULT.map((p) => ({ ...p, imageUrl: p.imageUrl as string }));
    savePresets(list);
  }
  return list;
}

function getFabrics(): FactoryFabric[] {
  let list = loadFactoryFabrics();
  if (list.length === 0) {
    list = [...FACTORY_FABRICS_DEFAULT];
    saveFactoryFabrics(list);
  }
  return list;
}

orders = loadOrders();

/** Called on every new order or quotation request; implement to send email to factory. */
export type OnOrderCreatedCallback = (payload: {
  order: Order;
  customerName: string;
  customerEmail: string;
  isQuotationRequest: boolean;
}) => void;

let onOrderCreated: OnOrderCreatedCallback | null = null;

export function setOnOrderCreated(callback: OnOrderCreatedCallback | null) {
  onOrderCreated = callback;
}

export const ordersApi = {
  getPresetDesigns(): PresetDesign[] {
    return getPresets();
  },

  /** Presets visible in the shop: public (no sole owner) + private designs assigned to this customer. */
  getPresetDesignsForCustomer(customerUserId: string | undefined): PresetDesign[] {
    return getPresets().filter(
      (p) => !p.solePropertyClientId || p.solePropertyClientId === customerUserId
    );
  },

  getPresetById(id: string): PresetDesign | undefined {
    return getPresets().find((p) => p.id === id);
  },

  addPresetDesign(preset: Omit<PresetDesign, "id">): PresetDesign {
    const list = getPresets();
    const id = `p-${Date.now()}`;
    const newPreset: PresetDesign = { ...preset, id };
    list.push(newPreset);
    savePresets(list);
    return newPreset;
  },

  updatePresetDesign(id: string, updates: Partial<Omit<PresetDesign, "id">>): PresetDesign | undefined {
    const list = getPresets();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...updates };
    savePresets(list);
    return list[idx];
  },

  deletePresetDesign(id: string): boolean {
    const list = getPresets().filter((p) => p.id !== id);
    if (list.length === getPresets().length) return false;
    savePresets(list);
    return true;
  },

  getFactoryFabrics(): FactoryFabric[] {
    return getFabrics();
  },

  getFactoryFabricById(id: string): FactoryFabric | undefined {
    return getFabrics().find((f) => f.id === id);
  },

  addFactoryFabric(fabric: Omit<FactoryFabric, "id">): FactoryFabric {
    const list = getFabrics();
    const id = `f-${Date.now()}`;
    const newFabric: FactoryFabric = { ...fabric, id };
    list.push(newFabric);
    saveFactoryFabrics(list);
    return newFabric;
  },

  updateFactoryFabric(id: string, updates: Partial<Omit<FactoryFabric, "id">>): FactoryFabric | undefined {
    const list = getFabrics();
    const idx = list.findIndex((f) => f.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...updates };
    saveFactoryFabrics(list);
    return list[idx];
  },

  deleteFactoryFabric(id: string): boolean {
    const list = getFabrics().filter((f) => f.id !== id);
    if (list.length === getFabrics().length) return false;
    saveFactoryFabrics(list);
    return true;
  },

  getAllOrders(): Order[] {
    const all = loadOrders();
    return [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrdersByUserId(userId: string): Order[] {
    const all = loadOrders();
    return all.filter((o) => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrderById(orderId: string): Order | undefined {
    return loadOrders().find((o) => o.id === orderId);
  },

  updateOrderStatus(orderId: string, status: OrderStatus): Order | undefined {
    orders = loadOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    saveOrders();
    return order;
  },

  updateOrder(orderId: string, updates: { status?: OrderStatus; quantity?: number; notes?: string }): Order | undefined {
    orders = loadOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;
    if (updates.status != null) order.status = updates.status;
    const item = order.items[0];
    if (item) {
      if (updates.quantity != null) {
        item.quantity = updates.quantity;
        item.totalPrice = item.unitPrice * updates.quantity;
      }
      if (updates.notes != null) item.notes = updates.notes;
    }
    order.totalAmount = order.items.reduce((sum, i) => sum + i.totalPrice, 0);
    order.updatedAt = new Date().toISOString();
    saveOrders();
    return order;
  },

  deleteOrder(orderId: string): boolean {
    orders = loadOrders();
    const prev = orders.length;
    orders = orders.filter((o) => o.id !== orderId);
    if (orders.length === prev) return false;
    saveOrders();
    return true;
  },

  /** Admin: create an order manually (e.g. phone/offline order) */
  createOrderAdmin(params: {
    userId: string;
    designChoice: DesignChoice;
    fabricChoice: FabricChoice;
    quantity: number;
    notes: string;
    status?: OrderStatus;
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
    const order: Order = {
      id: orderId,
      userId: params.userId,
      status: params.status ?? "SUBMITTED",
      items: [item],
      totalAmount: totalPrice,
      createdAt: now,
      updatedAt: now,
      estimatedCompletion: undefined,
    };
    orders = loadOrders();
    orders.push(order);
    saveOrders();
    return order;
  },

  computeUnitPrice(designChoice: DesignChoice, fabricChoice: FabricChoice): number {
    if (fabricChoice.fabricSource === "factory" && fabricChoice.factoryFabricId) {
      const fabric = this.getFactoryFabricById(fabricChoice.factoryFabricId);
      if (fabric) return fabric.pricePerMeter;
    }
    let base = 20;
    if (designChoice.source === "existing" && designChoice.presetId) {
      const preset = this.getPresetById(designChoice.presetId);
      if (preset) base = preset.basePricePerUnit;
    } else if (designChoice.source === "upload") {
      base = 28;
    } else if (designChoice.source === "repeat") {
      base = 22;
    } else if (designChoice.source === "my_library") {
      base = 28;
    }
    if (fabricChoice.fabricSource === "customer") {
      base += fabricChoice.fabricType === "natural" ? 15 : 10;
    }
    return base;
  },

  getMinimumQuantity(fabricChoice: FabricChoice): number {
    if (fabricChoice.orderType === "sample") {
      return fabricChoice.fabricType === "sublimation" ? 1 : 5;
    }
    if (fabricChoice.fabricSource === "factory" && fabricChoice.factoryFabricId) {
      const fabric = this.getFactoryFabricById(fabricChoice.factoryFabricId);
      return fabric?.minimumQuantity ?? 1;
    }
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
    customerName?: string;
    customerEmail?: string;
    myLibraryDesignSnapshot?: { name: string; imageDataUrl: string };
    uploadSnapshots?: { fileName: string; dataUrl: string }[];
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
      ...(params.myLibraryDesignSnapshot && { myLibraryDesignSnapshot: params.myLibraryDesignSnapshot }),
      ...(params.uploadSnapshots?.length && { uploadSnapshots: params.uploadSnapshots }),
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
    if (onOrderCreated) {
      onOrderCreated({
        order,
        customerName: params.customerName ?? "",
        customerEmail: params.customerEmail ?? "",
        isQuotationRequest: false,
      });
    }
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
    customerName?: string;
    customerEmail?: string;
    myLibraryDesignSnapshot?: { name: string; imageDataUrl: string };
    uploadSnapshots?: { fileName: string; dataUrl: string }[];
  }): Order {
    const now = new Date().toISOString();
    const orderId = `quot-${Date.now()}`;
    const item: OrderItem = {
      designChoice: params.designChoice,
      fabricChoice: params.fabricChoice,
      quantity: params.quantity,
      notes: params.notes,
      unitPrice: 0,
      totalPrice: 0,
      ...(params.myLibraryDesignSnapshot && { myLibraryDesignSnapshot: params.myLibraryDesignSnapshot }),
      ...(params.uploadSnapshots?.length && { uploadSnapshots: params.uploadSnapshots }),
    };
    const order: Order = {
      id: orderId,
      userId: params.userId,
      status: "SUBMITTED",
      items: [item],
      totalAmount: 0,
      createdAt: now,
      updatedAt: now,
      estimatedCompletion: undefined,
    };
    orders = loadOrders();
    orders.push(order);
    saveOrders();
    if (onOrderCreated) {
      onOrderCreated({
        order,
        customerName: params.customerName ?? "",
        customerEmail: params.customerEmail ?? "",
        isQuotationRequest: true,
      });
    }
    return order;
  },
};
