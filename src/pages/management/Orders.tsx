import React, { useState, useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical, 
  Pencil, 
  Trash, 
  Calendar,
  Users,
  Package,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Truck,
  PlusCircle,
  X,
  FileText,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Printer,
  Cpu,
  Boxes,
  Palette,
  ExternalLink,
  Info,
  Banknote,
  LayoutGrid,
  Image as LucideImage
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

// --- Types ---

type OrderStatus = "Pending Confirmation" | "Order confirmed" | "In Production" | "Ready for Pickup" | "Delivered" | "Cancelled" | "Returned";
type OrderCategory = "New" | "Pending" | "Completed" | "Cancelled" | "Returns";


interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  productionOrderId?: string; // Linked production order
  attachments: string[];
  image?: string;
}

interface Order {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  customerType: "Regular" | "Business" | "Premium";
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  category: OrderCategory;
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  notes?: string;
  returnNote?: string;
}

interface ProductionOrder {
  id: string;
  orderId: string;
  itemId: string;
  productName: string;
  status: "Draft" | "Allocated" | "In Progress" | "Completed";
  materials: {
    materialId: string;
    materialName: string;
    requiredQty: number;
    unit: string;
    isAllocated: boolean;
  }[];
  customerProvidedMaterials?: string[];
  technicianName?: string;
}

// --- Mock Data ---

const mockProductionOrders: ProductionOrder[] = [
  {
    id: "PO-7001",
    orderId: "ORD-9901",
    itemId: "ITEM-1",
    productName: "Golden Mandala Silk",
    status: "Allocated",
    materials: [
      { materialId: "MAT1", materialName: "Cotton Premium XL", requiredQty: 55, unit: "m", isAllocated: true },
      { materialId: "MAT2", materialName: "Cyan Ink", requiredQty: 750, unit: "g", isAllocated: true }
    ],
    technicianName: "Ahmed Ali"
  }
];

const initialOrders: Order[] = [
  // --- NEW ORDERS (Newly Arrived) ---
  {
    id: "ORD-9902",
    date: "2024-02-12",
    customerId: "C2",
    customerName: "E-Textile Solutions",
    customerType: "Business",
    items: [
      { 
        id: "ITEM-2", 
        productId: "PROD2", 
        productName: "Minimal Linen Pattern", 
        quantity: 100, 
        unit: "m", 
        pricePerUnit: 320, 
        total: 32000,
        attachments: [],
        image: "https://images.unsplash.com/photo-1612453676150-b8ec1e89ce32?q=80&w=2070&auto=format&fit=crop"
      }
    ],
    totalAmount: 32000,
    status: "Pending Confirmation",
    category: "New",
    paymentStatus: "Unpaid"
  },
  {
    id: "ORD-9905",
    date: "2024-02-12",
    customerId: "C5",
    customerName: "Cairo Design Studio",
    customerType: "Premium",
    items: [
      { 
        id: "ITEM-5", 
        productId: "PROD5", 
        productName: "Custom Velvet Prints", 
        quantity: 25, 
        unit: "m", 
        pricePerUnit: 550, 
        total: 13750, 
        attachments: ["design_v1.pdf"],
        image: "https://images.unsplash.com/photo-1612012002164-96ba37039a83?q=80&w=2070&auto=format&fit=crop"
      }
    ],
    totalAmount: 13750,
    status: "Pending Confirmation",
    category: "New",
    paymentStatus: "Paid"
  },

  // --- PENDING / ACTIVE (In Progress) ---
  {
    id: "ORD-9901",
    date: "2024-02-12",
    customerId: "C1",
    customerName: "Mohamed Ali",
    customerType: "Regular",
    items: [
      { 
        id: "ITEM-1", 
        productId: "PROD1", 
        productName: "Golden Mandala Silk", 
        quantity: 50, 
        unit: "m", 
        pricePerUnit: 450, 
        total: 22500,
        productionOrderId: "PO-7001",
        attachments: ["mandala_ref.jpg"],
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1972&auto=format&fit=crop"
      }
    ],
    totalAmount: 22500,
    status: "Order confirmed",
    category: "Pending",
    paymentStatus: "Unpaid"
  },
  {
    id: "ORD-9903",
    date: "2024-02-11",
    customerId: "C3",
    customerName: "Hassan El-Banna",
    customerType: "Regular",
    items: [
      { 
        id: "ITEM-3", 
        productId: "PROD3", 
        productName: "Cotton Canvas Roll", 
        quantity: 200, 
        unit: "m", 
        pricePerUnit: 180, 
        total: 36000, 
        productionOrderId: "PO-7003", 
        attachments: [],
        image: "https://images.unsplash.com/photo-1596230526768-30588647acae?q=80&w=2070&auto=format&fit=crop"
      }
    ],
    totalAmount: 36000,
    status: "In Production",
    category: "Pending",
    paymentStatus: "Paid"
  },
  {
    id: "ORD-9906",
    date: "2024-02-11",
    customerId: "C6",
    customerName: "Alex Fashion Week",
    customerType: "Business",
    items: [
      { 
        id: "ITEM-6", 
        productId: "PROD6", 
        productName: "Neon Polyester", 
        quantity: 500, 
        unit: "m", 
        pricePerUnit: 120, 
        total: 60000, 
        productionOrderId: "PO-7004", 
        attachments: [],
        image: "https://images.unsplash.com/photo-1616428902891-6228795da223?q=80&w=1974&auto=format&fit=crop"
      }
    ],
    totalAmount: 60000,
    status: "Ready for Pickup",
    category: "Pending",
    paymentStatus: "Partial"
  },

  // --- COMPLETED (Delivered) ---
  {
    id: "ORD-9899",
    date: "2024-02-10",
    customerId: "C4",
    customerName: "Nile Textiles",
    customerType: "Business",
    items: [
      { 
        id: "ITEM-4", 
        productId: "PROD4", 
        productName: "Heavy Duty Canvas", 
        quantity: 150, 
        unit: "m", 
        pricePerUnit: 200, 
        total: 30000, 
        attachments: [],
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=2070&auto=format&fit=crop"
      }
    ],
    totalAmount: 30000,
    status: "Delivered",
    category: "Completed",
    paymentStatus: "Paid"
  },
  {
    id: "ORD-9890",
    date: "2024-02-09",
    customerId: "C8",
    customerName: "Zamalek Boutique",
    customerType: "Premium",
    items: [
      { 
        id: "ITEM-8", 
        productId: "PROD8", 
        productName: "Silk Chiffon", 
        quantity: 60, 
        unit: "m", 
        pricePerUnit: 600, 
        total: 36000, 
        attachments: [],
        image: "https://images.unsplash.com/photo-1509319117193-42d42741859c?q=80&w=2070&auto=format&fit=crop"
      }
    ],
    totalAmount: 36000,
    status: "Delivered",
    category: "Completed",
    paymentStatus: "Paid"
  },

  // --- CANCELLED ---
  {
    id: "ORD-9888",
    date: "2024-02-08",
    customerId: "C9",
    customerName: "Ahmed Tarek",
    customerType: "Regular",
    items: [
      { 
        id: "ITEM-9", 
        productId: "PROD9", 
        productName: "Basic Cotton", 
        quantity: 10, 
        unit: "m", 
        pricePerUnit: 100, 
        total: 1000, 
        attachments: [],
        image: "https://images.unsplash.com/photo-1598532163257-52b1b48b4953?q=80&w=1932&auto=format&fit=crop"
      }
    ],
    totalAmount: 1000,
    status: "Cancelled",
    category: "Cancelled",
    paymentStatus: "Unpaid"
  },

  // --- RETURNS ---
  {
    id: "ORD-9885",
    date: "2024-02-05",
    customerId: "C10",
    customerName: "Global Fabrics Ltd",
    customerType: "Business",
    items: [
      { 
        id: "ITEM-10", 
        productId: "PROD10", 
        productName: "Velvet Red", 
        quantity: 100, 
        unit: "m", 
        pricePerUnit: 400, 
        total: 40000, 
        attachments: [],
        image: "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?q=80&w=2098&auto=format&fit=crop"
      }
    ],
    totalAmount: 40000,
    status: "Returned",
    category: "Returns",
    paymentStatus: "Paid",
    returnNote: "Color mismatch with sample provided."
  }
];

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeCategory, setActiveCategory] = useState<OrderCategory>("New");
  const [searchTerm, setSearchTerm] = useState("");
  
  // UI State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProductionSheetOpen, setIsProductionSheetOpen] = useState(false);
  const [activeProductionItem, setActiveProductionItem] = useState<OrderItem | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = o.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Pending Confirmation": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Order confirmed": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "In Production": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Ready for Pickup": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Delivered": return "bg-emerald-600 text-white border-transparent";
      case "Cancelled": return "bg-red-50 text-red-600 border-red-100";
      case "Returned": return "bg-slate-900 text-white border-transparent";
      default: return "bg-slate-50 text-slate-400";
    }
  };

  const handleConfirmOrder = (orderId: string) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: "Order confirmed", category: "Pending" } : o
    ));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: "Order confirmed", category: "Pending" } : null);
    }
  };

  const handleReturnOrder = (orderId: string, note: string) => {
     setOrders(orders.map(o => 
       o.id === orderId ? { ...o, status: "Returned", category: "Returns", returnNote: note } : o
     ));
     setIsDetailOpen(false);
  };

  // --- Add Order Logic ---
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<{
    customer: string;
    product: string;
    amount: string;
    status: OrderStatus;
  }>({
    customer: "",
    product: "",
    amount: "",
    status: "Pending Confirmation"
  });

  const handleCreateOrder = () => {
    if (!newOrder.customer || !newOrder.product || !newOrder.amount) return;

    const order: Order = {
      id: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toLocaleDateString('en-CA'),
      customerId: `C${Math.floor(Math.random() * 100)}`,
      customerName: newOrder.customer,
      customerType: "Regular", // Default
      items: [{
        id: `ITEM-${Math.floor(Math.random() * 1000)}`,
        productId: "GENERIC",
        productName: newOrder.product,
        quantity: 1,
        unit: "qty",
        pricePerUnit: parseFloat(newOrder.amount),
        total: parseFloat(newOrder.amount),
        attachments: []
      }],
      totalAmount: parseFloat(newOrder.amount),
      status: newOrder.status,
      category: "New",
      paymentStatus: "Unpaid"
    };

    setOrders([order, ...orders]);
    setIsAddOrderOpen(false);
    setNewOrder({ customer: "", product: "", amount: "", status: "Pending Confirmation" });
  };

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Omni-Channel <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Orders</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">Synchronizing factory production with customer-facing web demand.</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Order ID / Customer..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => setIsAddOrderOpen(true)}
                className="bg-primary text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
             >
                <PlusCircle size={20} />
                <span className="hidden lg:inline uppercase">Direct Order</span>
             </button>
          </div>
        </div>

        {/* Status Pipeline Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           {[
             { label: "New", category: "New", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
             { label: "Pending", category: "Pending", icon: Cpu, color: "text-amber-500", bg: "bg-amber-50" },
             { label: "Completed", category: "Completed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
             { label: "Cancelled", category: "Cancelled", icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
             { label: "Returns", category: "Returns", icon: RotateCcw, color: "text-slate-900", bg: "bg-slate-100" }
           ].map((tab) => (
             <button 
               key={tab.category}
               onClick={() => setActiveCategory(tab.category as OrderCategory)}
               className={cn(
                 "p-6 rounded-[35px] border transition-all flex flex-col items-center gap-2 group",
                 activeCategory === tab.category 
                  ? "bg-slate-900 border-slate-900 shadow-2xl" 
                  : "bg-white border-slate-100 hover:border-primary/20"
               )}
             >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform",
                   activeCategory === tab.category ? "bg-white/10 text-white" : `${tab.bg} ${tab.color}`
                )}>
                  <tab.icon size={20} />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  activeCategory === tab.category ? "text-slate-400" : "text-slate-400"
                )}>{tab.label}</span>
                <span className={cn(
                  "text-xl font-black",
                  activeCategory === tab.category ? "text-white" : "text-slate-900"
                )}>{orders.filter(o => o.category === tab.category).length}</span>
             </button>
           ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Master / Sequence</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Entity</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cart Summary</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financials</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredOrders.map(order => (
                   <tr 
                     key={order.id} 
                     onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailOpen(true);
                     }}
                     className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                   >
                      <td className="px-8 py-8">
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 tracking-tight uppercase">{order.id}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{order.date}</span>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 shadow-sm">
                               {order.customerName[0]}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-slate-700 uppercase leading-none">{order.customerName}</span>
                               <span className="text-[9px] font-black text-primary uppercase mt-1 tracking-widest">{order.customerType} SCALE</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex flex-col gap-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                 {item.image && <img src={item.image} alt="" className="w-6 h-6 rounded-md object-cover shadow-sm bg-slate-50 border border-slate-100" />}
                                 <span className="text-xs font-black text-slate-500 uppercase">{item.productName}</span>
                                 <span className="text-[10px] font-bold text-slate-400">x{item.quantity} {item.unit}</span>
                              </div>
                            ))}
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-900 tracking-tighter">{order.totalAmount.toLocaleString()} <span className="text-[10px] text-slate-400">EGP</span></span>
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-[0.15em]",
                              order.paymentStatus === "Paid" ? "text-emerald-500" : "text-red-400"
                            )}>{order.paymentStatus}</span>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex justify-center">
                            <span className={cn(
                              "px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                              getStatusColor(order.status)
                            )}>
                               {order.status}
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <button className="p-3 bg-white rounded-2xl text-slate-300 hover:text-primary transition-all shadow-sm border border-slate-100 group-hover:border-primary/20">
                            <ChevronRight size={18} />
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           {filteredOrders.length === 0 && (
             <div className="p-32 flex flex-col items-center justify-center text-slate-200 opacity-30">
                <ShoppingBag size={80} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">No matching orders in the pipeline</p>
             </div>
           )}
        </div>
      </div>

      {/* --- SIDE SHEETS --- */}

      {/* 1. Order Detail Insight Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-5xl p-0 border-none flex flex-col bg-slate-50">
          {selectedOrder && (
            <>
              <div className="bg-white p-12 relative border-b border-slate-100 shadow-sm overflow-hidden">
                 {/* Background Accent */}
                 <div className="absolute top-0 right-0 p-20 opacity-5 grayscale pointer-events-none">
                    <ShoppingBag size={240} />
                 </div>

                 <button onClick={() => setIsDetailOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-300 z-10">
                    <X size={24} />
                 </button>

                 <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-12">
                    <div className={cn(
                      "w-48 h-48 rounded-[60px] flex flex-col items-center justify-center text-center p-6 shadow-2xl transition-all",
                      getStatusColor(selectedOrder.status)
                    )}>
                       <ShoppingBag size={48} className="mb-3" />
                       <span className="text-[10px] font-black uppercase tracking-tighter opacity-60 leading-tight">Master Order</span>
                       <span className="text-2xl font-black tracking-tighter">{selectedOrder.id.split('-')[1]}</span>
                    </div>

                    <div className="flex-1 space-y-6 pt-4 text-center md:text-left">
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{selectedOrder.customerName}</h2>
                          <span className="px-5 py-2 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                             {selectedOrder.customerType} Profile
                          </span>
                       </div>
                       
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-10 font-black text-sm text-slate-400 uppercase tracking-tight">
                          <div className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {selectedOrder.date}</div>
                          <div className="flex items-center gap-2"><LayoutGrid size={16} className="text-accent" /> {selectedOrder.items.length} Products</div>
                          <div className="flex items-center gap-2"><Banknote size={16} className="text-emerald-500" /> {selectedOrder.paymentStatus}</div>
                       </div>

                       <div className="flex flex-wrap justify-center md:justify-start gap-3">
                          {selectedOrder.status === "Pending Confirmation" && (
                            <button 
                              onClick={() => handleConfirmOrder(selectedOrder.id)}
                              className="px-8 py-4 bg-primary text-white rounded-[20px] font-black text-[11px] tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 uppercase"
                            >
                               Confirm Order Lifecycle
                            </button>
                          )}
                          {selectedOrder.category === "Completed" && (
                             <button className="px-8 py-4 bg-slate-900 text-white rounded-[20px] font-black text-[11px] tracking-widest hover:scale-105 transition-all shadow-xl uppercase">
                                Process Return Log
                             </button>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto px-12 py-10 space-y-12">
                 {/* Production Items Grid */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-2">Itemized Pipeline</h5>
                       <span className="text-[10px] font-bold text-slate-400">Sync with Production Orders</span>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                       {selectedOrder.items.map((item, idx) => (
                         <div key={idx} className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10 group overflow-hidden relative">
                            {/* Material Progress Bar */}
                            <div className="absolute bottom-0 left-0 h-1.5 bg-primary/10 w-full overflow-hidden">
                               <div className={cn("h-full transition-all duration-1000", item.productionOrderId ? "w-full bg-emerald-500" : "w-1/3 bg-amber-500")}></div>
                            </div>

                            {item.image ? (
                                <img src={item.image} alt={item.productName} className="w-24 h-24 object-cover rounded-[30px] shadow-md group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-24 h-24 bg-slate-50 rounded-[30px] flex items-center justify-center text-slate-200 group-hover:scale-105 transition-transform duration-500">
                                   <Palette size={40} />
                                </div>
                            )}

                            <div className="flex-1 text-center md:text-left space-y-2">
                               <div className="flex items-center justify-center md:justify-start gap-3">
                                  <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{item.productName}</h4>
                                  <span className="text-[10px] font-black text-slate-300">SKU-{item.productId}</span>
                               </div>
                               <div className="flex items-center justify-center md:justify-start gap-6">
                                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 lowercase italic">
                                     <Boxes size={14} className="text-primary not-italic" /> {item.quantity} {item.unit} Requested
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 tracking-tighter">
                                     {item.pricePerUnit} EGP / Unit
                                  </div>
                               </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                               {item.productionOrderId ? (
                                 <div className="flex flex-col items-center text-center space-y-1">
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                       <CheckCircle2 size={16} /> Production Synced
                                    </div>
                                    <button className="text-[9px] font-black text-slate-400 flex items-center gap-1 hover:text-primary">
                                       PO-{item.productionOrderId.split('-')[1]} <ExternalLink size={10} />
                                    </button>
                                 </div>
                               ) : (
                                 <button 
                                   onClick={() => {
                                      setActiveProductionItem(item);
                                      setIsProductionSheetOpen(true);
                                   }}
                                   className="px-6 py-4 bg-amber-50 text-amber-600 rounded-[22px] font-black text-[10px] tracking-widest uppercase hover:bg-amber-600 hover:text-white transition-all shadow-lg shadow-amber-200/50 flex items-center gap-2"
                                 >
                                    <Cpu size={14} /> Forge Prod Order
                                 </button>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Cart Financial Summary */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-slate-900 p-10 rounded-[45px] text-white space-y-6 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-10">
                          <Banknote size={100} />
                       </div>
                       <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Settlement Logic</h5>
                       <div className="space-y-4">
                          <div className="flex justify-between items-end border-b border-white/5 pb-4">
                             <span className="text-[10px] font-black text-white/60 uppercase">Cart Subtotal</span>
                             <span className="text-2xl font-black tracking-tighter">{selectedOrder.totalAmount.toLocaleString()} <span className="text-xs">EGP</span></span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-400 font-black pt-2">
                             <span className="text-[10px] uppercase tracking-widest">Status Code</span>
                             <span className="text-sm uppercase tracking-[0.2em]">{selectedOrder.paymentStatus}</span>
                          </div>
                       </div>
                       <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                          <Printer size={18} /> GENERATE FISCAL BILL
                       </button>
                    </div>

                    <div className="bg-white p-10 rounded-[45px] border border-slate-100 space-y-6">
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Web Attachments & Designs</h5>
                       <div className="grid grid-cols-3 gap-4">
                          {selectedOrder.items[0].attachments.length > 0 ? (
                             selectedOrder.items[0].attachments.map((file, i) => (
                               <div key={i} className="aspect-square bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden group relative">
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                     <ExternalLink className="text-white" size={20} />
                                  </div>
                                  <LucideImage size={32} className="text-slate-200" />
                               </div>
                             ))
                          ) : (
                             <div className="col-span-3 py-10 flex flex-col items-center justify-center text-slate-200 grayscale opacity-40 italic">
                                <Info size={32} className="mb-2" />
                                <span className="text-[10px] font-black uppercase">No source files provided</span>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* 2. Production Forge Sheet */}
      <Sheet open={isProductionSheetOpen} onOpenChange={setIsProductionSheetOpen}>
         <SheetContent className="w-full sm:max-w-3xl p-0 border-none flex flex-col bg-white">
            <div className="bg-amber-500 p-12 text-white relative">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Cpu size={140} />
               </div>
               <SheetHeader>
                  <SheetTitle className="text-4xl font-black uppercase tracking-tighter text-white">Technician Forge</SheetTitle>
                  <SheetDescription className="text-white/80 font-bold text-sm">Calculate material allocation and generate technicians sheet.</SheetDescription>
               </SheetHeader>
            </div>

            {activeProductionItem && (
               <div className="flex-1 overflow-y-auto p-12 space-y-12">
                  <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                     <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-amber-500 shadow-sm">
                        <Palette size={40} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Product</p>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{activeProductionItem.productName}</h4>
                        <div className="flex items-center gap-3 mt-1 underline decoration-amber-200 underline-offset-4">
                           <span className="text-[10px] font-black text-amber-600 uppercase italic">Run Quantity: {activeProductionItem.quantity} {activeProductionItem.unit}</span>
                        </div>
                     </div>
                  </div>

                  {/* Production BOM List */}
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-2">Smart Recipe Breakdown</h5>
                        <button className="text-[10px] font-black text-primary uppercase border-b border-primary/20">Apply Template</button>
                     </div>

                     <div className="space-y-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-amber-400 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black">CP</div>
                              <div>
                                 <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Cotton Premium XL</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest tracking-tight">Required: 55m | On-Hand: 450m</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100">Allocated</span>
                           </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-amber-400 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black">CI</div>
                              <div>
                                 <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Cyan Pigment Ink</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Required: 750g | On-Hand: 1200g</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100">Allocated</span>
                           </div>
                        </div>

                        {/* Customer Provided Materials */}
                        <div className="p-8 bg-slate-900 rounded-[35px] text-white relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-6 opacity-10">
                              <Truck size={60} />
                           </div>
                           <h6 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Plus size={14} /> Unlisted Input
                           </h6>
                           <p className="text-xs font-bold text-white/40 leading-relaxed max-w-[220px]">Append materials provided by client not tracked in SKU database.</p>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            <div className="p-10 border-t border-slate-50 flex gap-4 bg-slate-50/10">
               <button onClick={() => setIsProductionSheetOpen(false)} className="flex-1 py-5 border-2 border-slate-100 rounded-[25px] font-black text-xs text-slate-400 uppercase tracking-widest">Discard Forge</button>
               <button className="flex-[2] py-5 bg-amber-500 text-white rounded-[25px] font-black text-xs tracking-widest shadow-xl shadow-amber-200 uppercase hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                  <Printer size={18} /> GENERATE TECH SHEET & ALLOCATE
               </button>
            </div>
         </SheetContent>
      </Sheet>

      {/* 3. New Order Sheet */}
      <Sheet open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
        <SheetContent className="sm:max-w-md bg-white border-l border-slate-100 p-0 flex flex-col">
          <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
            <SheetTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Order</SheetTitle>
            <SheetDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manual entry for offline requests</SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 p-8 space-y-8 overflow-y-auto">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Identity</label>
                <div className="relative">
                   <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                     type="text" 
                     className="w-full bg-slate-50 border-none pl-12 pr-4 py-5 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                     placeholder="Customer Name..."
                     value={newOrder.customer}
                     onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                   />
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Item</label>
                <div className="relative">
                   <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                     type="text" 
                     className="w-full bg-slate-50 border-none pl-12 pr-4 py-5 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                     placeholder="Product description... (e.g. 500 Business Cards)"
                     value={newOrder.product}
                     onChange={(e) => setNewOrder({...newOrder, product: e.target.value})}
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</label>
                   <div className="relative">
                      <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 border-none pl-12 pr-4 py-5 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="0.00"
                        value={newOrder.amount}
                        onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})}
                      />
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Status</label>
                   <div className="relative">
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                      <select 
                         className="w-full bg-slate-50 border-none px-4 py-5 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                         value={newOrder.status}
                         onChange={(e) => setNewOrder({...newOrder, status: e.target.value as OrderStatus})}
                      >
                         <option value="Pending Confirmation">Pending</option>
                         <option value="Order confirmed">Confirmed</option>
                         <option value="In Production">In Production</option>
                      </select>
                   </div>
                </div>
             </div>
          </div>

          <SheetFooter className="p-8 border-t border-slate-50 bg-white">
             <div className="flex gap-4 w-full">
                <SheetClose asChild>
                   <button className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
                      Cancel
                   </button>
                </SheetClose>
                <button 
                   onClick={handleCreateOrder}
                   className="flex-[2] py-5 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-900 text-white shadow-xl hover:bg-primary transition-all hover:scale-[1.02]"
                >
                   Create Order
                </button>
             </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ManagementLayout>
  );
};

export default Orders;
