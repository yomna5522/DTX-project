import React, { useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  Cpu, 
  Plus, 
  Search, 
  ChevronRight, 
  Printer, 
  Layers, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Zap, 
  Boxes, 
  Beaker, 
  Image as LucideImage, 
  ExternalLink,
  Save,
  Trash,
  ArrowRight,
  ClipboardList,
  Palette,
  Calculator,
  User,
  Settings,
  MoreVertical,
  ChevronDown,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Types ---

interface BOMItem {
  materialId: string;
  name: string;
  qty: number;
  unit: string;
  isCustomerProvided?: boolean;
}

interface ProductionOrder {
  id: string;
  orderId: string;
  productName: string;
  productImage: string;
  targetQty: number;
  technician: string;
  deadline: string;
  status: "Draft" | "In Production" | "Review" | "Completed";
  materials: BOMItem[];
  productionCost: number;
  capacityAlert?: string; // e.g. "Low Fabric Stock"
}

// --- Mock Data ---

const initialProductionOrders: ProductionOrder[] = [
  {
    id: "PO-7701",
    orderId: "ORD-9901",
    productName: "Golden Mandala Silk Roll",
    productImage: "https://images.unsplash.com/photo-1524333891108-628cc324a5dd?w=800&q=80",
    targetQty: 50,
    technician: "Ahmed Hassan",
    deadline: "2024-02-15",
    status: "In Production",
    productionCost: 12500,
    materials: [
      { materialId: "MAT_SILK", name: "Premium Silk Fabric", qty: 55, unit: "m" },
      { materialId: "MAT_INK_GOLD", name: "Metallic Gold Ink", qty: 2.5, unit: "L" },
      { materialId: "MAT_PAPER_P", name: "Thermal Sublimation Paper", qty: 60, unit: "m" }
    ]
  },
  {
    id: "PO-7702",
    orderId: "ORD-8822",
    productName: "Industrial Linen Banner",
    productImage: "https://images.unsplash.com/photo-1558584673-c834fb1bb370?w=800&q=80",
    targetQty: 10,
    technician: "Mona Said",
    deadline: "2024-02-14",
    status: "Draft",
    productionCost: 4200,
    capacityAlert: "Low Ink Reservoir",
    materials: [
      { materialId: "MAT_LINEN", name: "Heavy Weight Linen", qty: 22, unit: "m" },
      { materialId: "MAT_CUST_1", name: "Custom Eyelets (Client Provided)", qty: 40, unit: "pcs", isCustomerProvided: true }
    ]
  }
];

const ProductionForge = () => {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(initialProductionOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | ProductionOrder["status"]>("All");
  
  // UI State
  const [isForgeOpen, setIsForgeOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<ProductionOrder | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form State
  const [newOrder, setNewOrder] = useState<Partial<ProductionOrder>>({
    productName: "",
    orderId: "",
    targetQty: 0,
    technician: "",
    deadline: "",
    materials: []
  });

  const [newMaterial, setNewMaterial] = useState<Partial<BOMItem>>({
    name: "",
    qty: 0,
    unit: "m"
  });

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.qty) {
      setNewOrder({
        ...newOrder,
        materials: [
          ...(newOrder.materials || []),
          { 
            ...newMaterial as BOMItem, 
            materialId: `MAT_${Math.floor(Math.random() * 8999)}`,
            isCustomerProvided: false 
          }
        ]
      });
      setNewMaterial({ name: "", qty: 0, unit: "m" });
    }
  };

  const handleRemoveMaterial = (name: string) => {
    setNewOrder({
      ...newOrder,
      materials: newOrder.materials?.filter(m => m.name !== name)
    });
  };

  const handleDeployOrder = () => {
    if (newOrder.productName && newOrder.targetQty && newOrder.technician) {
      const orderToAdd: ProductionOrder = {
        id: `PO-${Math.floor(Math.random() * 8999) + 1000}`,
        orderId: newOrder.orderId || "N/A",
        productName: newOrder.productName,
        productImage: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80", // Placeholder for new
        targetQty: newOrder.targetQty,
        technician: newOrder.technician,
        deadline: newOrder.deadline || new Date().toISOString().split('T')[0],
        status: "Draft",
        productionCost: Math.floor(Math.random() * 10000) + 1000, // Mock calculation
        materials: newOrder.materials || []
      };
      
      setProductionOrders([orderToAdd, ...productionOrders]);
      setIsForgeOpen(false);
      setNewOrder({ productName: "", orderId: "", targetQty: 0, technician: "", deadline: "", materials: [] });
    }
  };

  const filteredOrders = productionOrders.filter(po => {
    const matchesSearch = po.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          po.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          po.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || po.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Production <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Forge</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">Execute industrial production orders and synchronize Bills of Materials (BOM).</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="PO # / Product / Tech..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => setIsForgeOpen(true)}
                className="bg-slate-900 text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 uppercase"
              >
                <PlusCircle size={20} />
                <span className="hidden lg:inline">Initiate Forge</span>
             </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-6 bg-white p-2 rounded-full border border-slate-100 w-fit">
           {["All", "Draft", "In Production", "Review", "Completed"].map((status) => (
             <button 
               key={status}
               onClick={() => setFilterStatus(status as any)}
               className={cn(
                 "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                 filterStatus === status ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
               )}
             >
               {status}
             </button>
           ))}
        </div>

        {/* PO Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredOrders.map(po => (
             <div 
               key={po.id}
               onClick={() => {
                  setSelectedPO(po);
                  setIsPreviewOpen(true);
               }}
               className="bg-white rounded-[45px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all flex flex-col group overflow-hidden cursor-pointer"
             >
                <div className="relative h-64 overflow-hidden">
                   <img src={po.productImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={po.productName} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                      <div className="flex justify-between items-end">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{po.id}</p>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{po.productName}</h3>
                         </div>
                         <span className={cn(
                           "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest",
                           po.status === "In Production" ? "bg-amber-500 text-white" : po.status === "Completed" ? "bg-emerald-500 text-white" : "bg-white text-slate-900"
                         )}>
                            {po.status}
                         </span>
                      </div>
                   </div>
                   {po.capacityAlert && (
                     <div className="absolute top-6 left-6 px-4 py-2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 shadow-xl animate-pulse">
                        <AlertTriangle size={12} /> {po.capacityAlert}
                     </div>
                   )}
                </div>

                <div className="p-8 space-y-6 flex-1">
                   <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-2"><User size={14} className="text-primary" /> {po.technician}</div>
                      <div className="flex items-center gap-2"><Clock size={14} className="text-accent" /> {po.deadline}</div>
                   </div>

                   <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                         <span className="text-[10px] font-black text-slate-500 uppercase">Target Run</span>
                         <span className="text-sm font-black text-slate-900">{po.targetQty} Units</span>
                      </div>
                      <div className="flex justify-between items-center bg-emerald-50/30 px-5 py-3 rounded-2xl border border-emerald-100/50">
                         <span className="text-[10px] font-black text-emerald-600 uppercase">Est. Cost</span>
                         <span className="text-sm font-black text-emerald-600">{po.productionCost.toLocaleString()} EGP</span>
                      </div>
                   </div>

                   <div className="pt-4 space-y-2">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Material Allocation</p>
                      <div className="flex flex-wrap gap-2">
                         {po.materials.slice(0, 3).map((m, idx) => (
                           <span key={idx} className="px-3 py-1 bg-slate-50 text-[9px] font-bold text-slate-400 rounded-lg uppercase">
                              {m.name}
                           </span>
                         ))}
                         {po.materials.length > 3 && <span className="text-[9px] font-black text-primary pl-2">+{po.materials.length - 3} More</span>}
                      </div>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                   <button className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-900 hover:text-white transition-all">TECH SHEET</button>
                   <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-primary transition-all"><Settings size={18} /></button>
                </div>
             </div>
           ))}

           {/* Create New PO Card */}
           <button 
             onClick={() => setIsForgeOpen(true)}
             className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[45px] flex flex-col items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all group min-h-[400px]"
           >
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Plus size={40} />
              </div>
              <p className="text-sm font-black uppercase tracking-widest">New Industry Workflow</p>
           </button>
        </div>
      </div>

      {/* --- Production Forge Sheet (Initiate) --- */}
      <Sheet open={isForgeOpen} onOpenChange={setIsForgeOpen}>
        <SheetContent className="w-full sm:max-w-4xl p-0 border-none flex flex-col bg-slate-50">
           <div className="bg-slate-900 p-12 text-white relative">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <Cpu size={140} className="animate-spin-slow" />
              </div>
              <SheetHeader>
                 <SheetTitle className="text-4xl font-black uppercase tracking-tighter text-white">Forge Engine</SheetTitle>
                 <SheetDescription className="text-slate-400 font-bold text-sm tracking-widest uppercase italic">Convert Sales Orders into Industrial Production Reality.</SheetDescription>
              </SheetHeader>
           </div>

           <div className="flex-1 overflow-y-auto p-12 space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Palette size={16} className="text-primary" /> Product Identity
                    </h5>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product / Sales Order</label>
                          <select 
                            className="w-full bg-white border border-slate-100 px-6 py-4 rounded-2xl text-xs font-black outline-none appearance-none cursor-pointer"
                            value={newOrder.productName}
                            onChange={(e) => setNewOrder({...newOrder, productName: e.target.value})}
                          >
                             <option value="">Select Target Product</option>
                             <option value="Golden Mandala Silk Roll">Golden Mandala Silk Roll</option>
                             <option value="Industrial Linen Banner">Industrial Linen Banner</option>
                             <option value="Custom Vinyl Wrap">Custom Vinyl Wrap</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Quantity</label>
                          <input 
                            type="number" 
                            className="w-full bg-white border border-slate-100 px-6 py-4 rounded-2xl text-2xl font-black outline-none placeholder:text-slate-100" 
                            placeholder="00" 
                            value={newOrder.targetQty || ''}
                            onChange={(e) => setNewOrder({...newOrder, targetQty: Number(e.target.value)})}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                       <User size={16} className="text-accent" /> Logistics Allocation
                    </h5>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Technician</label>
                          <select 
                             className="w-full bg-white border border-slate-100 px-6 py-4 rounded-2xl text-xs font-black outline-none appearance-none cursor-pointer"
                             value={newOrder.technician}
                             onChange={(e) => setNewOrder({...newOrder, technician: e.target.value})}
                          >
                             <option value="">Select Staff</option>
                             <option value="Ahmed Hassan">Ahmed Hassan (Master)</option>
                             <option value="Mona Said">Mona Said (Standard)</option>
                             <option value="Omar Khaled">Omar Khaled (Junior)</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Deadline</label>
                          <input 
                            type="date" 
                            className="w-full bg-white border border-slate-100 px-6 py-4 rounded-2xl text-xs font-black outline-none" 
                            value={newOrder.deadline}
                            onChange={(e) => setNewOrder({...newOrder, deadline: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-8 pt-8 border-t border-slate-100">
                 <div className="flex justify-between items-center">
                    <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Boxes size={16} className="text-primary" /> Bill of Materials (BOM)
                    </h5>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Apply Template Schema</button>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm space-y-6">
                       
                       {/* BOM List */}
                       <div className="space-y-2">
                          {newOrder.materials?.map((m, idx) => (
                             <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 border border-transparent hover:border-slate-100">
                                <div className="col-span-6 font-black text-xs text-slate-900 uppercase">{m.name}</div>
                                <div className="col-span-3 font-black text-sm text-center">{m.qty}</div>
                                <div className="col-span-2 text-center text-[10px] font-black text-slate-400 uppercase italic">{m.unit}</div>
                                <div className="col-span-1 flex justify-end">
                                   <button 
                                      onClick={() => handleRemoveMaterial(m.name)}
                                      className="text-slate-200 hover:text-red-500 transition-all"
                                   >
                                      <Trash size={14} />
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>

                       {/* Add Material Row */}
                       <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 grid grid-cols-12 gap-4 items-end">
                          <div className="col-span-6 space-y-1">
                             <label className="text-[9px] font-black text-slate-300 uppercase">Material Name</label>
                             <input 
                               className="w-full bg-white border-none px-3 py-2 rounded-lg text-xs font-bold outline-none" 
                               placeholder="Ex: Fabric..."
                               value={newMaterial.name}
                               onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                             />
                          </div>
                          <div className="col-span-3 space-y-1">
                             <label className="text-[9px] font-black text-slate-300 uppercase">Qty</label>
                             <input 
                               type="number" 
                               className="w-full bg-white border-none px-3 py-2 rounded-lg text-xs font-bold outline-none text-center"
                               placeholder="0"
                               value={newMaterial.qty || ''}
                               onChange={(e) => setNewMaterial({...newMaterial, qty: Number(e.target.value)})}
                             />
                          </div>
                          <div className="col-span-2 space-y-1">
                             <label className="text-[9px] font-black text-slate-300 uppercase">Unit</label>
                             <select 
                               className="w-full bg-white border-none px-2 py-2 rounded-lg text-[10px] font-bold outline-none"
                               value={newMaterial.unit}
                               onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                             >
                                <option value="m">Meters</option>
                                <option value="g">Grams</option>
                                <option value="L">Liters</option>
                                <option value="pcs">Pcs</option>
                             </select>
                          </div>
                          <div className="col-span-1">
                             <button 
                                onClick={handleAddMaterial}
                                className="w-full py-2 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-primary transition-all"
                             >
                                <Plus size={14} />
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="bg-slate-900 p-8 rounded-[40px] text-white flex justify-between items-center relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                       <Calculator size={60} />
                    </div>
                    <div className="relative z-10">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Calibrated Cost</p>
                       <p className="text-3xl font-black tracking-tighter italic">-- <span className="text-sm">EGP</span></p>
                    </div>
                    <ArrowRight className="text-primary group-hover:translate-x-2 transition-transform" />
                 </div>

                 <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <CheckCircle2 size={60} className="text-emerald-500" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest mb-1">Stock Readiness</p>
                       <p className="text-xl font-black text-emerald-600 uppercase tracking-tighter">Calculating...</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-10 border-t border-slate-100 bg-slate-100/50 flex gap-4">
              <button onClick={() => setIsForgeOpen(false)} className="flex-1 py-5 bg-white border border-slate-200 rounded-[25px] font-black text-xs text-slate-400 uppercase tracking-widest">Cancel Build</button>
              <button 
                 onClick={handleDeployOrder}
                 className="flex-[2] py-5 bg-slate-900 text-white rounded-[25px] font-black text-xs tracking-widest uppercase shadow-2xl flex items-center justify-center gap-2 hover:bg-primary transition-all"
              >
                 <Save size={20} /> Deploy Production Order
              </button>
           </div>
        </SheetContent>
      </Sheet>

      {/* --- Tech Sheet Preview Sheet --- */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
         <SheetContent className="w-full sm:max-w-xl p-0 border-none flex flex-col bg-white">
            {selectedPO && (
              <>
                 <div className="p-16 space-y-12 overflow-y-auto">
                    <div className="flex justify-between items-start">
                       <div className="space-y-4">
                          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">TECH <span className="text-primary not-italic">SHEET</span></h2>
                          <div className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest w-fit">{selectedPO.id}</div>
                       </div>
                       <LucideImage size={80} className="text-slate-100" />
                    </div>

                    <div className="space-y-8">
                       <div className="grid grid-cols-2 gap-8 border-y border-slate-100 py-10">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Product Reference</p>
                             <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{selectedPO.productName}</p>
                          </div>
                          <div className="space-y-2 text-right">
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Mandated Quantity</p>
                             <p className="text-3xl font-black text-primary tracking-tighter leading-none">{selectedPO.targetQty} <span className="text-xs">UNITS</span></p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                             <div className="w-1.5 h-4 bg-primary rounded-full"></div> Mandatory Materials
                          </h5>
                          <div className="space-y-3">
                             {selectedPO.materials.map((m, i) => (
                               <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                  <div className="flex flex-col">
                                     <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{m.name}</span>
                                     {m.isCustomerProvided && <span className="text-[8px] font-black text-accent uppercase mt-1">Client Asset</span>}
                                  </div>
                                  <span className="text-sm font-black text-slate-900 tracking-tighter">{m.qty} {m.unit}</span>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="p-8 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 space-y-4">
                          <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Sign-off Logs</h6>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="h-20 border border-slate-100 bg-white rounded-2xl flex items-end justify-center pb-2 text-[8px] font-black text-slate-200 uppercase tracking-widest">Technician Sign</div>
                             <div className="h-20 border border-slate-100 bg-white rounded-2xl flex items-end justify-center pb-2 text-[8px] font-black text-slate-200 uppercase tracking-widest">Warehouse Release</div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button className="flex-1 py-5 bg-white border border-slate-200 rounded-[25px] font-black text-xs text-slate-900 uppercase tracking-widest flex items-center justify-center gap-2"><Printer size={18} /> Print Tech Copy</button>
                    <button onClick={() => setIsPreviewOpen(false)} className="px-10 py-5 bg-slate-900 text-white rounded-[25px] font-black text-xs tracking-widest uppercase">Close Preview</button>
                 </div>
              </>
            )}
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
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </ManagementLayout>
  );
};

export default ProductionForge;
