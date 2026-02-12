import React, { useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash,
  Tag,
  Scale,
  Banknote,
  Building2,
  Paperclip,
  History,
  CheckCircle2,
  Bell,
  Box,
  Image as ImageIcon,
  Save,
  X,
  PlusCircle,
  Archive,
  BarChart3,
  ExternalLink
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
interface MaterialCategory {
  id: string;
  name: string;
  count: number;
}

interface Material {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  unit: string; // e.g., "Grams", "Meters", "Rolls"
  pricePerUnit: number;
  currentStock: number;
  openingStock: number;
  alertThreshold: number;
  supplierId: string;
  supplierName: string;
  lastRestock: string;
  attachments: string[];
  notes: string;
}

// --- Mock Data ---
const initialCategories: MaterialCategory[] = [
  { id: "CAT1", name: "Raw Fabrics", count: 12 },
  { id: "CAT2", name: "Dyes & Inks", count: 8 },
  { id: "CAT3", name: "Artificial Fabrics", count: 15 },
  { id: "CAT4", name: "Packaging", count: 5 },
  { id: "CAT5", name: "Chemicals", count: 10 }
];

const initialMaterials: Material[] = [
  {
    id: "MAT1",
    name: "Cotton Premium XL",
    description: "High-grade natural cotton for organic print series.",
    categoryId: "CAT1",
    unit: "Meters",
    pricePerUnit: 120,
    currentStock: 450,
    openingStock: 500,
    alertThreshold: 100,
    supplierId: "S1",
    supplierName: "Textile Pro Egypt",
    lastRestock: "2024-02-01",
    attachments: ["texture_sample_01.jpg"],
    notes: "Requires cool storage environment."
  },
  {
    id: "MAT2",
    name: "Ultra Chrome Cyan Ink",
    description: "Premium pigment ink for large format printing.",
    categoryId: "CAT2",
    unit: "Grams",
    pricePerUnit: 0.85,
    currentStock: 1200,
    openingStock: 2000,
    alertThreshold: 1500, // Trigger Alert
    supplierId: "S2",
    supplierName: "Ink & Color Chemicals",
    lastRestock: "2024-01-15",
    attachments: ["msds_sheet.pdf"],
    notes: "Shake well before use in machines."
  },
  {
    id: "MAT3",
    name: "Polyester Synthetic Roll",
    description: "Standard industrial grade polyester for sports apparel.",
    categoryId: "CAT3",
    unit: "Rolls",
    pricePerUnit: 2500,
    currentStock: 5,
    openingStock: 20,
    alertThreshold: 8, // Trigger Alert
    supplierId: "S1",
    supplierName: "Textile Pro Egypt",
    lastRestock: "2023-12-10",
    attachments: [],
    notes: "UV resistant material."
  }
];

const Inventory = () => {
  const [categories, setCategories] = useState<MaterialCategory[]>(initialCategories);
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // UI States
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isCategoryMgmtOpen, setIsCategoryMgmtOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form States
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    categoryId: "CAT1",
    unit: "Grams",
    currentStock: 0,
    openingStock: 0,
    alertThreshold: 10,
    attachments: []
  });

  const [newCategoryName, setNewCategoryName] = useState("");

  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingCategory, setEditingCategory] = useState<MaterialCategory | null>(null);

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
      setMaterials(materials.map(m => m.id === editingMaterial.id ? { ...m, ...newMaterial as Material } : m));
      setEditingMaterial(null);
    } else {
      const materialToAdd: Material = {
        ...newMaterial as Material,
        id: `MAT${Math.floor(Math.random() * 1000)}`,
        currentStock: newMaterial.openingStock || 0,
        lastRestock: new Date().toISOString().split('T')[0],
        supplierName: "Textile Pro Egypt", // Default for demo
        attachments: [],
        notes: newMaterial.notes || ""
      };
      setMaterials([materialToAdd, ...materials]);
    }
    setIsAddMaterialOpen(false);
    setNewMaterial({
      categoryId: "CAT1",
      unit: "Grams",
      currentStock: 0,
      openingStock: 0,
      alertThreshold: 10,
      attachments: []
    });
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    setIsDetailOpen(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName) return;
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: newCategoryName } : c));
      setEditingCategory(null);
    } else {
      const catToAdd: MaterialCategory = {
        id: `CAT${Math.floor(Math.random() * 1000)}`,
        name: newCategoryName,
        count: 0
      };
      setCategories([...categories, catToAdd]);
    }
    setNewCategoryName("");
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "All" || m.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = materials.filter(m => m.currentStock <= m.alertThreshold).length;

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Material <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Warehouse</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">Track raw textures, pigments, and substrate stocks across {categories.length} categories.</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Scan SKU or Search name..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => {
                  setEditingMaterial(null);
                  setNewMaterial({
                    categoryId: "CAT1",
                    unit: "Grams",
                    currentStock: 0,
                    openingStock: 0,
                    alertThreshold: 10,
                    attachments: []
                  });
                  setIsAddMaterialOpen(true);
                }}
                className="bg-primary text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <PlusCircle size={20} />
                <span className="hidden lg:inline uppercase">Add Material</span>
             </button>
          </div>
        </div>

        {/* Operational Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm group hover:border-primary/20 transition-all">
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Archive size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Materials</p>
              <p className="text-2xl font-black text-slate-900">{materials.length} SKUs</p>
           </div>
           
           <div className={cn(
             "p-6 rounded-[35px] border shadow-sm group transition-all",
             lowStockCount > 0 ? "bg-red-50 border-red-100" : "bg-white border-slate-100"
           )}>
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                lowStockCount > 0 ? "bg-red-100 text-red-600" : "bg-emerald-50 text-emerald-600"
              )}>
                <AlertTriangle size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Alerts</p>
              <p className={cn(
                "text-2xl font-black",
                lowStockCount > 0 ? "text-red-600" : "text-emerald-600"
              )}>{lowStockCount} Items Low</p>
           </div>

           <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Value</p>
              <p className="text-2xl font-black text-slate-900">450K <span className="text-xs">EGP</span></p>
           </div>

           <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-900 group transition-all" onClick={() => setIsCategoryMgmtOpen(true)}>
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-all">
                <Layers size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Categories</p>
              <p className="text-2xl font-black text-slate-900 group-hover:text-white transition-all">{categories.length} Folders</p>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Sidebar - Categories */}
          <div className="w-full lg:w-72 space-y-4">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Filter by Group</h3>
                <button 
                  onClick={() => setIsCategoryMgmtOpen(true)}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-all"
                >
                  <Pencil size={14} />
                </button>
             </div>
             
             <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setSelectedCategory("All")}
                  className={cn(
                    "px-6 py-4 rounded-[20px] text-xs font-black text-left uppercase transition-all flex items-center justify-between",
                    selectedCategory === "All" ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white text-slate-400 hover:bg-slate-100"
                  )}
                >
                  All Assets <span className="opacity-50 text-[10px] font-bold">{materials.length}</span>
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-6 py-4 rounded-[20px] text-xs font-black text-left uppercase transition-all flex items-center justify-between",
                      selectedCategory === cat.id ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    {cat.name} <span className="opacity-50 text-[10px] font-bold">
                       {materials.filter(m => m.categoryId === cat.id).length}
                    </span>
                  </button>
                ))}
             </div>

             <div className="p-8 bg-slate-900 rounded-[35px] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Bell size={60} />
                </div>
                <h4 className="font-black text-sm uppercase tracking-tighter mb-2">Auto-Ordering</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-4">Stock sync is active. System will suggest POs when thresholds are reached.</p>
                <button className="text-[10px] font-black uppercase text-accent border-b border-accent/30 tracking-widest">Setup Alerts</button>
             </div>
          </div>

          {/* Main Grid */}
          <div className="flex-1 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredMaterials.map(material => {
                  const isLow = material.currentStock <= material.alertThreshold;
                  return (
                    <div 
                      key={material.id}
                      onClick={() => {
                        setSelectedMaterial(material);
                        setIsDetailOpen(true);
                      }}
                      className="bg-white rounded-[35px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer group"
                    >
                      <div className="p-8 space-y-6">
                        <div className="flex justify-between items-start">
                           <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg",
                             isLow ? "bg-red-500" : "bg-slate-900 group-hover:bg-primary transition-colors"
                           )}>
                             {material.name[0]}
                           </div>
                           {isLow && (
                             <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase border border-red-100 animate-pulse">
                               <AlertTriangle size={12} /> Low Stock
                             </span>
                           )}
                        </div>

                        <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase group-hover:text-primary transition-colors">{material.name}</h3>
                          <p className="text-xs text-slate-400 font-medium line-clamp-1 mt-1">{material.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Available</p>
                              <p className={cn(
                                "text-lg font-black tracking-tighter",
                                isLow ? "text-red-500" : "text-slate-900"
                              )}>{material.currentStock.toLocaleString()} <span className="text-[10px] text-slate-400">{material.unit}</span></p>
                           </div>
                           <div className="text-right space-y-1">
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Unit Price</p>
                              <p className="text-lg font-black text-slate-900 tracking-tighter">{material.pricePerUnit} <span className="text-[10px] text-slate-400">EGP</span></p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                              <Building2 size={12} className="text-accent" /> {material.supplierName}
                           </div>
                           <ChevronRight size={18} className="text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </div>

      {/* --- SIDE SHEETS --- */}

      {/* 1. Add/Edit Material Sheet */}
      <Sheet open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 border-none flex flex-col bg-white">
           <div className="bg-slate-900 p-12 text-white relative">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <Package size={120} />
              </div>
              <SheetHeader>
                 <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-white">
                    {editingMaterial ? "Modify Artifact" : "Declare Material"}
                 </SheetTitle>
                 <SheetDescription className="text-slate-400 font-bold text-sm">
                    {editingMaterial ? `Reviewing data for ${editingMaterial.name}` : "Register a new raw material or product into the warehouse catalog."}
                 </SheetDescription>
              </SheetHeader>
           </div>

           <form onSubmit={handleAddMaterial} className="flex-1 overflow-y-auto p-12 space-y-10">
              <div className="space-y-8">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Basic Information</h4>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Material Name</label>
                       <input 
                         required
                         className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                         placeholder="Ex: Artificial Silk XP"
                         value={newMaterial.name || ''}
                         onChange={e => setNewMaterial({...newMaterial, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</label>
                       <textarea 
                         rows={2}
                         className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                         placeholder="Brief details about material composition..."
                         value={newMaterial.description || ''}
                         onChange={e => setNewMaterial({...newMaterial, description: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</label>
                       <select 
                         className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none appearance-none"
                         value={newMaterial.categoryId}
                         onChange={e => setNewMaterial({...newMaterial, categoryId: e.target.value})}
                       >
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Measuring Unit</label>
                       <select 
                         className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none appearance-none"
                         value={newMaterial.unit}
                         onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})}
                       >
                          <option>Grams</option>
                          <option>Meters</option>
                          <option>Rolls</option>
                          <option>Liters</option>
                          <option>Pieces</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="space-y-8 pt-6 border-t border-slate-50">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Financials & Stock</h4>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Price / {newMaterial.unit || 'Unit'}</label>
                       <div className="relative">
                          <input 
                            type="number"
                            className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none"
                            placeholder="0.00"
                            value={newMaterial.pricePerUnit || ''}
                            onChange={e => setNewMaterial({...newMaterial, pricePerUnit: parseFloat(e.target.value)})}
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">EGP</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Opening Stock</label>
                       <input 
                         type="number"
                         className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none"
                         placeholder="0"
                         value={newMaterial.openingStock || ''}
                         onChange={e => setNewMaterial({...newMaterial, openingStock: parseFloat(e.target.value)})}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       Stock Warning Threshold <Bell size={12} className="text-red-400" />
                    </label>
                    <input 
                      type="number"
                      className="w-full bg-red-50 text-red-600 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-red-100 outline-none"
                      placeholder="Alert when below..."
                      value={newMaterial.alertThreshold || ''}
                      onChange={e => setNewMaterial({...newMaterial, alertThreshold: parseFloat(e.target.value)})}
                    />
                 </div>
              </div>

              <div className="space-y-2 pt-6">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Internal Notes</label>
                 <textarea 
                   rows={3}
                   className="w-full bg-slate-100 border-none px-6 py-5 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 outline-none"
                   placeholder="Any storage instructions or quality notes..."
                   value={newMaterial.notes || ''}
                   onChange={e => setNewMaterial({...newMaterial, notes: e.target.value})}
                 />
              </div>
           </form>

           <div className="p-10 border-t border-slate-50 flex gap-4 bg-slate-50/30">
              <button 
                onClick={() => setIsAddMaterialOpen(false)}
                className="flex-1 py-5 border-2 border-slate-100 rounded-[22px] font-black text-xs text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddMaterial}
                className="flex-[2] py-5 bg-primary text-white rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase"
              >
                Store Inventory
              </button>
           </div>
        </SheetContent>
      </Sheet>

      {/* 2. Category Management Dialog (Sheet) */}
      <Sheet open={isCategoryMgmtOpen} onOpenChange={setIsCategoryMgmtOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 border-none flex flex-col bg-white">
          <div className="bg-accent p-12 text-white relative">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Layers size={100} />
             </div>
             <SheetHeader>
                <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-white">Categories</SheetTitle>
                <SheetDescription className="text-white/60 font-medium text-sm text-[10px]">Organize your material database structure.</SheetDescription>
             </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Current Groups</label>
                <div className="space-y-2">
                   {categories.map(cat => (
                     <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group">
                        <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{cat.name}</span>
                        <button 
                          onClick={() => {
                            setEditingCategory(cat);
                            setNewCategoryName(cat.name);
                          }}
                          className="p-2 hover:bg-blue-50 text-slate-300 hover:text-primary rounded-lg transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash size={16} />
                        </button>
                     </div>
                   ))}
                </div>
             </div>

             <div className="pt-8 border-t border-slate-50 space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                   {editingCategory ? `Renaming ${editingCategory.name}` : "Create New Folder"}
                </label>
                <div className="flex gap-2">
                   <input 
                     className="flex-1 bg-slate-100 border-none px-5 py-4 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-accent/5 transition-all"
                     placeholder="Category Name"
                     value={newCategoryName}
                     onChange={(e) => setNewCategoryName(e.target.value)}
                   />
                   <button 
                     onClick={handleAddCategory}
                     className={cn(
                       "p-4 rounded-xl transition-all",
                       editingCategory ? "bg-primary text-white" : "bg-accent text-white hover:scale-105 active:scale-95"
                     )}
                   >
                     {editingCategory ? <Save size={20} /> : <Plus size={20} />}
                   </button>
                </div>
             </div>
          </div>

          <div className="p-8 border-t border-slate-50 bg-slate-50/50">
             <button 
                onClick={() => setIsCategoryMgmtOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-800 transition-all"
             >
                Done
             </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 3. Material Detail View */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-4xl p-0 border-none flex flex-col bg-slate-50">
           {selectedMaterial && (
             <>
               <div className="bg-white p-12 border-b border-slate-100 relative">
                  <button 
                    onClick={() => setIsDetailOpen(false)}
                    className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-300"
                  >
                    <X size={24} />
                  </button>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                     <div className={cn(
                       "w-32 h-32 text-white rounded-[45px] flex items-center justify-center text-5xl font-black shadow-2xl transition-all",
                       selectedMaterial.currentStock <= selectedMaterial.alertThreshold ? "bg-red-500 shadow-red-200" : "bg-slate-900 shadow-slate-200"
                     )}>
                        {selectedMaterial.name[0]}
                     </div>
                     
                     <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                           <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{selectedMaterial.name}</h2>
                           <span className="px-5 py-2 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                              {categories.find(c => c.id === selectedMaterial.categoryId)?.name || 'Misc'}
                           </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 font-bold text-sm text-slate-400">
                           <div className="flex items-center gap-2 uppercase tracking-tighter">
                              <Tag size={16} className="text-accent" /> SKU-{selectedMaterial.id}
                           </div>
                           <div className="flex items-center gap-2 uppercase tracking-tighter">
                              <Scale size={16} className="text-primary" /> Units: {selectedMaterial.unit}
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingMaterial(selectedMaterial);
                            setNewMaterial(selectedMaterial);
                            setIsDetailOpen(false);
                            setIsAddMaterialOpen(true);
                          }}
                          className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                        >
                           <Pencil size={20} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMaterial(selectedMaterial.id)}
                          className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                        >
                           <Trash size={20} />
                        </button>
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-12">
                  <Tabs defaultValue="stock" className="space-y-10">
                    <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start gap-12 rounded-none h-auto p-0">
                       <TabsTrigger value="stock" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-5 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Inventory Status</TabsTrigger>
                       <TabsTrigger value="supply" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-5 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Supply Source</TabsTrigger>
                       <TabsTrigger value="attachments" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-5 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Assets & Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stock" className="space-y-10 animate-fade-in-up">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Box size={100} />
                             </div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">On-Hand Quantity</p>
                             <h4 className={cn(
                               "text-6xl font-black tracking-tighter",
                               selectedMaterial.currentStock <= selectedMaterial.alertThreshold ? "text-red-500" : "text-slate-900"
                             )}>
                                {selectedMaterial.currentStock.toLocaleString()} <span className="text-xl font-bold uppercase">{selectedMaterial.unit}</span>
                             </h4>
                             <div className="mt-6 flex items-center gap-4">
                                <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                   Threshold: {selectedMaterial.alertThreshold} {selectedMaterial.unit}
                                </span>
                                {selectedMaterial.currentStock <= selectedMaterial.alertThreshold && (
                                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded-md text-[9px] font-black uppercase">Critical Low</span>
                                )}
                             </div>
                             
                             <div className="mt-10 pt-8 border-t border-slate-50 flex gap-4">
                                <button className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-xs tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2">
                                   MANAGE STOCK <Plus size={18} />
                                </button>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6">
                             <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Stock Valuation</p>
                                <p className="text-3xl font-black text-slate-900">{(selectedMaterial.currentStock * selectedMaterial.pricePerUnit).toLocaleString()} <span className="text-sm font-bold">EGP</span></p>
                             </div>
                             <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Consumption Pace</p>
                                <div className="flex items-center gap-4 mt-1">
                                   <TrendingUp size={24} className="text-accent" />
                                   <p className="text-2xl font-black text-slate-900 tracking-tighter">Medium Traffic</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </TabsContent>

                    <TabsContent value="supply" className="space-y-6 animate-fade-in-up">
                       <div className="bg-white p-12 rounded-[45px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10 group cursor-pointer hover:border-primary/20 transition-all">
                          <div className="w-24 h-24 bg-slate-900 text-white rounded-[35px] flex items-center justify-center text-4xl font-black shadow-xl group-hover:scale-110 transition-transform">
                             {selectedMaterial.supplierName[0]}
                          </div>
                          <div className="flex-1 space-y-2 text-center md:text-left">
                             <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Verified Provider</p>
                             <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedMaterial.supplierName}</h4>
                             <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-400">
                                <span className="flex items-center gap-1"><History size={14} /> Last restock: {selectedMaterial.lastRestock}</span>
                             </div>
                          </div>
                          <button className="px-8 py-4 bg-slate-50 rounded-xl text-primary font-black text-[10px] tracking-widest uppercase hover:bg-primary hover:text-white transition-all flex items-center gap-2">
                             Provider Profile <ExternalLink size={14} />
                          </button>
                       </div>
                    </TabsContent>

                    <TabsContent value="attachments" className="space-y-8 animate-fade-in-up">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-6">
                             <div className="flex items-center justify-between">
                                <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Digital Assets</h5>
                                <button className="text-[10px] font-black text-primary uppercase">Upload New</button>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                {selectedMaterial.attachments.length > 0 ? (
                                  selectedMaterial.attachments.map((file, i) => (
                                    <div key={i} className="aspect-square bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 group relative">
                                       <ImageIcon size={32} />
                                       <div className="absolute inset-0 bg-slate-900/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger className="p-2 bg-white rounded-full text-slate-900"><MoreVertical size={16} /></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                               <DropdownMenuItem>Download</DropdownMenuItem>
                                               <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                       </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="col-span-2 py-10 bg-slate-50 rounded-[35px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                                     <Paperclip size={32} className="mb-2" />
                                     <p className="text-[10px] font-black uppercase tracking-widest">No attachments</p>
                                  </div>
                                )}
                             </div>
                          </div>

                          <div className="space-y-6">
                             <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Operational Notes</h5>
                             <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm relative italic text-slate-500 text-sm leading-relaxed">
                                <div className="absolute -top-3 -left-3 w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center rotate-[-15deg] shadow-lg">
                                   <Pencil size={18} />
                                </div>
                                {selectedMaterial.notes || "No internal notes provided for this material SKU."}
                             </div>
                          </div>
                       </div>
                    </TabsContent>
                  </Tabs>
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

export default Inventory;
