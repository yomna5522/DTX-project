import React, { useState, useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical, 
  Pencil, 
  Trash, 
  ArrowLeftRight,
  Wallet,
  Calendar,
  Building2,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  PlusCircle,
  X,
  History,
  TrendingUp,
  Banknote,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
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
interface Material {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
}

interface Supplier {
  id: string;
  name: string;
}

interface PurchaseItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

type PurchaseStatus = "Paid" | "Partial" | "Due" | "Returned";

interface Purchase {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: PurchaseStatus;
  type: "Purchase" | "Return";
  notes?: string;
}

// --- Mock Data ---
const mockMaterials: Material[] = [
  { id: "MAT1", name: "Cotton Premium XL", unit: "Meters", currentStock: 450 },
  { id: "MAT2", name: "Ultra Chrome Cyan Ink", unit: "Grams", currentStock: 1200 },
];

const mockSuppliers: Supplier[] = [
  { id: "S1", name: "Textile Pro Egypt" },
  { id: "S2", name: "Ink & Color Chemicals" },
];

const initialPurchases: Purchase[] = [
  {
    id: "PO-7701",
    date: "2024-02-10",
    supplierId: "S1",
    supplierName: "Textile Pro Egypt",
    items: [
      { materialId: "MAT1", materialName: "Cotton Premium XL", quantity: 100, unitPrice: 110, total: 11000 }
    ],
    totalAmount: 11000,
    paidAmount: 5000,
    dueAmount: 6000,
    status: "Partial",
    type: "Purchase"
  },
  {
    id: "RET-9902",
    date: "2024-02-11",
    supplierId: "S1",
    supplierName: "Textile Pro Egypt",
    items: [
      { materialId: "MAT1", materialName: "Cotton Premium XL", quantity: 10, unitPrice: 110, total: 1100 }
    ],
    totalAmount: 1100,
    paidAmount: 0,
    dueAmount: 0,
    status: "Returned",
    type: "Return",
    notes: "Faulty roll texture."
  }
];

const Purchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Purchase" | "Return">("All");

  // UI State
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form State
  const [newPO, setNewPO] = useState<Partial<Purchase>>({
    supplierId: mockSuppliers[0].id,
    type: "Purchase",
    items: [],
    paidAmount: 0,
    status: "Due"
  });

  const [activeItem, setActiveItem] = useState<{materialId: string, quantity: number, unitPrice: number}>({
    materialId: mockMaterials[0].id,
    quantity: 1,
    unitPrice: 0
  });

  const handleAddItem = () => {
    const mat = materials.find(m => m.id === activeItem.materialId);
    if (!mat) return;
    
    const newItem: PurchaseItem = {
      materialId: activeItem.materialId,
      materialName: mat.name,
      quantity: activeItem.quantity,
      unitPrice: activeItem.unitPrice,
      total: activeItem.quantity * activeItem.unitPrice
    };

    setNewPO(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem],
      totalAmount: (prev.totalAmount || 0) + newItem.total,
      dueAmount: (prev.totalAmount || 0) + newItem.total - (prev.paidAmount || 0)
    }));
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const po: Purchase = {
      ...newPO as Purchase,
      id: newPO.type === "Purchase" ? `PO-${Math.floor(Math.random() * 8999) + 1000}` : `RET-${Math.floor(Math.random() * 8999) + 1000}`,
      date: new Date().toISOString().split('T')[0],
      supplierName: mockSuppliers.find(s => s.id === newPO.supplierId)?.name || "",
      totalAmount: newPO.items?.reduce((sum, i) => sum + i.total, 0) || 0,
      dueAmount: (newPO.items?.reduce((sum, i) => sum + i.total, 0) || 0) - (newPO.paidAmount || 0),
      status: (newPO.paidAmount || 0) >= (newPO.items?.reduce((sum, i) => sum + i.total, 0) || 0) ? "Paid" : (newPO.paidAmount || 0) > 0 ? "Partial" : "Due"
    };

    // Auto-update stock logic
    const updatedMaterials = [...materials];
    po.items.forEach(item => {
      const idx = updatedMaterials.findIndex(m => m.id === item.materialId);
      if (idx !== -1) {
        if (po.type === "Purchase") {
          updatedMaterials[idx].currentStock += item.quantity;
        } else {
          updatedMaterials[idx].currentStock -= item.quantity;
        }
      }
    });

    setMaterials(updatedMaterials);
    setPurchases([po, ...purchases]);
    setIsNewPurchaseOpen(false);
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalSpent = purchases.filter(p => p.type === "Purchase").reduce((sum, p) => sum + p.totalAmount, 0);
  const totalDue = purchases.reduce((sum, p) => sum + p.dueAmount, 0);
  const totalReturns = purchases.filter(p => p.type === "Return").reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Purchase <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Logbook</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">Monitor supply chain expenses, provider balances, and inventory restocks.</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="PO # or Supplier..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => setIsNewPurchaseOpen(true)}
                className="bg-primary text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <PlusCircle size={20} />
                <span className="hidden lg:inline uppercase">New Transaction</span>
             </button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                <Banknote size={80} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Procurement</p>
              <p className="text-2xl font-black text-slate-900">{totalSpent.toLocaleString()} <span className="text-xs">EGP</span></p>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase">
                 <TrendingUp size={12} /> Gross Volume
              </div>
           </div>

           <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                <Clock size={80} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Payables</p>
              <p className="text-2xl font-black text-red-600">{totalDue.toLocaleString()} <span className="text-xs">EGP</span></p>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                 To Providers
              </div>
           </div>

           <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                <ArrowLeftRight size={80} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Returns</p>
              <p className="text-2xl font-black text-amber-600">{totalReturns.toLocaleString()} <span className="text-xs">EGP</span></p>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                 Credit Adjustments
              </div>
           </div>

           <div className="bg-slate-900 p-6 rounded-[35px] shadow-xl shadow-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Receipt size={80} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Accounts</p>
              <p className="text-2xl font-black text-white">{mockSuppliers.length} Providers</p>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-accent uppercase tracking-widest">
                 Live Supply Chain
              </div>
           </div>
        </div>

        {/* Directory Filters */}
        <div className="flex items-center gap-4 bg-white p-2 rounded-full border border-slate-100 w-fit">
           <button 
             onClick={() => setFilterType("All")}
             className={cn(
               "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
               filterType === "All" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
             )}
           >
             All logs
           </button>
           <button 
             onClick={() => setFilterType("Purchase")}
             className={cn(
               "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
               filterType === "Purchase" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
             )}
           >
             <ArrowDownLeft size={14} /> Inbound
           </button>
           <button 
             onClick={() => setFilterType("Return")}
             className={cn(
               "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
               filterType === "Return" ? "bg-amber-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
             )}
           >
             <ArrowUpRight size={14} /> Returns
           </button>
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hash / Date</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financials</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Settlement</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredPurchases.map(p => (
                   <tr 
                     key={p.id} 
                     className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                     onClick={() => {
                        setSelectedPurchase(p);
                        setIsDetailOpen(true);
                     }}
                   >
                      <td className="px-8 py-6">
                         <p className="text-sm font-black text-slate-900 mb-0.5">{p.id}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">{p.date}</p>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                               {p.supplierName[0]}
                            </div>
                            <span className="text-xs font-black text-slate-700 uppercase">{p.supplierName}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-xs font-bold text-slate-500">{p.items.length} SKUs Linked</span>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-sm font-black text-slate-900">{p.totalAmount.toLocaleString()} <span className="text-[10px] text-slate-400">EGP</span></p>
                         {p.dueAmount > 0 && <p className="text-[10px] font-black text-red-500 italic">Debt: {p.dueAmount.toLocaleString()}</p>}
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex justify-center">
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border",
                              p.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                              p.status === "Partial" ? "bg-blue-50 text-blue-600 border-blue-100" : 
                              p.status === "Returned" ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-red-50 text-red-600 border-red-100"
                            )}>
                               {p.status}
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-primary transition-all shadow-sm">
                            <ChevronRight size={18} />
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           {filteredPurchases.length === 0 && (
             <div className="p-20 flex flex-col items-center justify-center text-slate-300">
                <Receipt size={48} className="mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest opacity-40">No transactions found</p>
             </div>
           )}
        </div>
      </div>

      {/* --- SIDE SHEETS --- */}

      {/* 1. New Purchase/Return Sheet */}
      <Sheet open={isNewPurchaseOpen} onOpenChange={setIsNewPurchaseOpen}>
         <SheetContent className="w-full sm:max-w-2xl p-0 border-none flex flex-col bg-white">
            <div className="bg-slate-900 p-12 text-white relative">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Receipt size={120} />
               </div>
               <SheetHeader>
                  <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-white">Log Transaction</SheetTitle>
                  <SheetDescription className="text-slate-400 font-bold text-sm">Create a new purchase invoice or process an inventory return.</SheetDescription>
               </SheetHeader>
            </div>

            <form onSubmit={handleCreatePurchase} className="flex-1 overflow-y-auto p-12 space-y-10">
               <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl w-fit">
                  <button 
                    type="button"
                    onClick={() => setNewPO({...newPO, type: "Purchase"})}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      newPO.type === "Purchase" ? "bg-white text-primary shadow-sm" : "text-slate-400"
                    )}
                  >
                    Standard PO
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewPO({...newPO, type: "Return"})}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      newPO.type === "Return" ? "bg-white text-amber-600 shadow-sm" : "text-slate-400"
                    )}
                  >
                    Inventory Return
                  </button>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Supply Source</label>
                     <select 
                       className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none appearance-none"
                       value={newPO.supplierId}
                       onChange={e => setNewPO({...newPO, supplierId: e.target.value})}
                     >
                        {mockSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                  </div>
               </div>

               {/* Item Adder */}
               <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-4">Line Items</h4>
                  <div className="grid grid-cols-12 gap-4">
                     <div className="col-span-12 md:col-span-5">
                        <select 
                          className="w-full bg-slate-100 border-none px-4 py-4 rounded-xl text-xs font-black outline-none"
                          value={activeItem.materialId}
                          onChange={e => setActiveItem({...activeItem, materialId: e.target.value})}
                        >
                           {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                     </div>
                     <div className="col-span-5 md:col-span-3">
                        <input 
                          type="number"
                          placeholder="Qty"
                          className="w-full bg-slate-100 border-none px-4 py-4 rounded-xl text-xs font-black outline-none"
                          value={activeItem.quantity}
                          onChange={e => setActiveItem({...activeItem, quantity: parseFloat(e.target.value)})}
                        />
                     </div>
                     <div className="col-span-5 md:col-span-3">
                        <input 
                          type="number"
                          placeholder="Price"
                          className="w-full bg-slate-100 border-none px-4 py-4 rounded-xl text-xs font-black outline-none"
                          value={activeItem.unitPrice}
                          onChange={e => setActiveItem({...activeItem, unitPrice: parseFloat(e.target.value)})}
                        />
                     </div>
                     <div className="col-span-2 md:col-span-1">
                        <button 
                          type="button"
                          onClick={handleAddItem}
                          className="w-full h-full bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all"
                        >
                           <Plus size={18} />
                        </button>
                     </div>
                  </div>

                  <div className="space-y-2">
                     {newPO.items?.map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div>
                             <p className="text-xs font-black text-slate-900 uppercase">{item.materialName}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{item.quantity} units @ {item.unitPrice} EGP</p>
                          </div>
                          <p className="text-xs font-black text-slate-900">{item.total.toLocaleString()} EGP</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-50 space-y-6">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Invoice</span>
                     <span className="text-2xl font-black text-slate-900">{newPO.items?.reduce((sum, i) => sum + i.total, 0).toLocaleString()} EGP</span>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Down Payment (Partial)</label>
                     <div className="relative">
                        <input 
                          type="number"
                          className="w-full bg-emerald-50 text-emerald-600 border-none px-6 py-5 rounded-2xl text-xl font-black focus:ring-4 focus:ring-emerald-100 outline-none"
                          placeholder="0.00"
                          value={newPO.paidAmount}
                          onChange={e => setNewPO({...newPO, paidAmount: parseFloat(e.target.value)})}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-300">EGP PAID</span>
                     </div>
                  </div>
               </div>
            </form>

            <div className="p-10 border-t border-slate-50 flex gap-4 bg-slate-50/30">
               <button 
                 onClick={() => setIsNewPurchaseOpen(false)}
                 className="flex-1 py-5 border-2 border-slate-100 rounded-[22px] font-black text-xs text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleCreatePurchase}
                 className="flex-[2] py-5 bg-primary text-white rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase"
               >
                 Execute Workflow
               </button>
            </div>
         </SheetContent>
      </Sheet>

      {/* 2. Detail & Return View */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-4xl p-0 border-none flex flex-col bg-slate-50">
          {selectedPurchase && (
            <>
              <div className="bg-white p-12 border-b border-slate-100 relative shadow-sm">
                 <button 
                   onClick={() => setIsDetailOpen(false)}
                   className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-300"
                 >
                   <X size={24} />
                 </button>

                 <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
                    <div className={cn(
                      "w-40 h-40 rounded-[50px] flex items-center justify-center text-5xl font-black shadow-2xl transition-all",
                      selectedPurchase.type === "Purchase" ? "bg-slate-900 text-white shadow-slate-200" : "bg-amber-500 text-white shadow-amber-200"
                    )}>
                       {selectedPurchase.type === "Purchase" ? <ArrowDownLeft size={64} /> : <ArrowUpRight size={64} />}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left space-y-6 pt-4">
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{selectedPurchase.id}</h2>
                          <span className={cn(
                            "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            selectedPurchase.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                          )}>
                             {selectedPurchase.status}
                          </span>
                       </div>
                       
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-10 font-black text-sm text-slate-400">
                          <div className="flex items-center gap-2 uppercase tracking-tight">
                             <Building2 size={16} className="text-accent" /> {selectedPurchase.supplierName}
                          </div>
                          <div className="flex items-center gap-2 uppercase tracking-tight">
                             <Calendar size={16} className="text-primary" /> {selectedPurchase.date}
                          </div>
                          <div className="flex items-center gap-2 uppercase tracking-tight">
                             <Package size={16} className="text-secondary" /> {selectedPurchase.items.length} Line Items
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200 shadow-sm">
                           <FileText size={20} />
                        </button>
                        <button className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm">
                           <Trash size={20} />
                        </button>
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto px-12 py-10">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                       <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Invoice Breakdown</h5>
                       <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                          <table className="w-full text-left">
                             <thead>
                                <tr className="bg-slate-50/50">
                                   <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Material SKU</th>
                                   <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                                   <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                   <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Ext. Total</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {selectedPurchase.items.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                     <td className="px-8 py-6 text-sm font-black text-slate-800 uppercase tracking-tight">{item.materialName}</td>
                                     <td className="px-8 py-6 text-xs font-bold text-slate-400">{item.unitPrice} EGP</td>
                                     <td className="px-8 py-6 text-xs font-black text-slate-900">{item.quantity}</td>
                                     <td className="px-8 py-6 text-sm font-black text-slate-900 text-right">{item.total.toLocaleString()} EGP</td>
                                  </tr>
                                ))}
                             </tbody>
                          </table>
                          <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                                <p className="text-3xl font-black tracking-tighter">{selectedPurchase.totalAmount.toLocaleString()} <span className="text-sm">EGP</span></p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Paid: {selectedPurchase.paidAmount.toLocaleString()} EGP</p>
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">Outstanding: {selectedPurchase.dueAmount.toLocaleString()} EGP</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Logistics & Notes</h5>
                       <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm space-y-8">
                          <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt Proof</span>
                             </div>
                             <div className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 italic group cursor-pointer hover:border-primary transition-all">
                                <History size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-black uppercase tracking-widest">View Scanned Doc</span>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                <div className="w-1.5 h-4 bg-emerald-400 rounded-full"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Notes</span>
                             </div>
                             <p className="text-sm font-medium text-slate-500 leading-relaxed italic pr-4">
                                "{selectedPurchase.notes || "No operational notes recorded for this transaction."}"
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
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
      `}</style>
    </ManagementLayout>
  );
};

export default Purchases;
