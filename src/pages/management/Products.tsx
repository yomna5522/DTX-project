import React, { useState, useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  Layers, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical, 
  Pencil, 
  Trash, 
  Tag, 
  LayoutGrid, 
  Image as ImageIcon, 
  Save, 
  X, 
  PlusCircle, 
  Settings2,
  Cpu,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Boxes,
  Palette,
  Maximize2,
  ExternalLink,
  Info
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
interface ProductCategory {
  id: string;
  name: string;
}

interface ProductSubCategory {
  id: string;
  categoryId: string;
  name: string;
}

interface ProductionRequirement {
  materialId: string;
  materialName: string;
  quantityPerUnit: number; // e.g., 0.5 meters of fabric per meter of printed product
  unit: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  subCategoryId: string;
  pricePerUnit: number;
  unit: string; // e.g., "Meter"
  gallery: string[];
  requirements: ProductionRequirement[];
}

// Assume we have active inventory stock (Mocking for capacity calculation)
const mockInventoryStock: Record<string, number> = {
  "MAT1": 500,  // Cotton Premium (Meters)
  "MAT2": 1500, // Cyan Ink (Grams)
  "MAT3": 10,   // Polyester (Rolls)
};

// --- Mock Data ---
const initialCategories: ProductCategory[] = [
  { id: "CAT_DES", name: "Designs" },
  { id: "CAT_FAB", name: "Fabrics" }
];

const initialSubCategories: ProductSubCategory[] = [
  { id: "SUB_NAT", categoryId: "CAT_FAB", name: "Natural Fabrics" },
  { id: "SUB_ART", categoryId: "CAT_FAB", name: "Artificial Fabrics" },
  { id: "SUB_VP", categoryId: "CAT_DES", name: "Vector Patterns" },
  { id: "SUB_PHOTO", categoryId: "CAT_DES", name: "Photographic Prints" }
];

const initialProducts: Product[] = [
  {
    id: "PROD1",
    name: "Golden Mandala Silk",
    description: "Premium oriental design printed on high-gloss artificial silk.",
    subCategoryId: "SUB_ART",
    pricePerUnit: 450,
    unit: "Meter",
    gallery: ["mandala_01.jpg", "mandala_02.jpg"],
    requirements: [
      { materialId: "MAT1", materialName: "Cotton Premium", quantityPerUnit: 1.1, unit: "Meters" },
      { materialId: "MAT2", materialName: "Cyan Ink", quantityPerUnit: 15, unit: "Grams" }
    ]
  },
  {
    id: "PROD2",
    name: "Minimalist Linen Pattern",
    description: "Scandi-style geometric pattern for home decor applications.",
    subCategoryId: "SUB_NAT",
    pricePerUnit: 320,
    unit: "Meter",
    gallery: ["minimal_01.jpg"],
    requirements: [
      { materialId: "MAT1", materialName: "Cotton Premium", quantityPerUnit: 1.0, unit: "Meters" },
      { materialId: "MAT2", materialName: "Cyan Ink", quantityPerUnit: 5, unit: "Grams" }
    ]
  }
];

const Products = () => {
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [subCategories, setSubCategories] = useState<ProductSubCategory[]>(initialSubCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubCat, setSelectedSubCat] = useState<string>("All");

  // UI State
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    subCategoryId: initialSubCategories[0].id,
    unit: "Meter",
    gallery: [],
    requirements: []
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...newProduct as Product } : p));
      setEditingProduct(null);
    } else {
      const prodToAdd: Product = {
        ...newProduct as Product,
        id: `PROD${Math.floor(Math.random() * 1000)}`,
        gallery: [],
        requirements: newProduct.requirements || []
      };
      setProducts([prodToAdd, ...products]);
    }
    setIsProductSheetOpen(false);
  };

  const calculateCapacity = (product: Product) => {
    if (!product.requirements.length) return 0;
    const capacities = product.requirements.map(req => {
      const stock = mockInventoryStock[req.materialId] || 0;
      return Math.floor(stock / req.quantityPerUnit);
    });
    return Math.min(...capacities);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSub = selectedSubCat === "All" || p.subCategoryId === selectedSubCat;
    return matchesSearch && matchesSub;
  });

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Product <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Forge</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">Manage fabrics, designs, and production capacities for DTX Center.</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter products..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({
                    subCategoryId: initialSubCategories[0].id,
                    unit: "Meter",
                    gallery: [],
                    requirements: []
                  });
                  setIsProductSheetOpen(true);
                }}
                className="bg-primary text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <PlusCircle size={20} />
                <span className="hidden lg:inline uppercase">New Product</span>
             </button>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="flex flex-wrap items-center gap-4">
           <button 
             onClick={() => setSelectedSubCat("All")}
             className={cn(
               "px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
               selectedSubCat === "All" ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400 hover:bg-slate-50"
             )}
           >
             All Collections
           </button>
           {subCategories.map(sub => (
             <button 
               key={sub.id}
               onClick={() => setSelectedSubCat(sub.id)}
               className={cn(
                 "px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                 selectedSubCat === sub.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-400 hover:bg-slate-50"
               )}
             >
               {sub.name}
             </button>
           ))}
           <button 
             onClick={() => setIsCategorySheetOpen(true)}
             className="p-3 bg-white border border-dashed border-slate-200 rounded-full text-slate-400 hover:text-primary hover:border-primary transition-all"
           >
             <Settings2 size={18} />
           </button>
        </div>

        {/* Global Capacity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                 <Boxes size={100} />
              </div>
              <div className="w-16 h-16 bg-blue-50 text-primary rounded-[24px] flex items-center justify-center">
                 <Cpu size={32} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Factory Capacity</p>
                 <p className="text-3xl font-black text-slate-900 tracking-tight">24,500 <span className="text-sm">m²</span></p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                 <Palette size={100} />
              </div>
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center">
                 <TrendingUp size={32} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Designs</p>
                 <p className="text-3xl font-black text-slate-900 tracking-tight">{products.length} <span className="text-sm">Units</span></p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                 <AlertTriangle size={100} />
              </div>
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-[24px] flex items-center justify-center">
                 <Cpu size={32} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Blockers</p>
                 <p className="text-3xl font-black text-red-600 tracking-tight">2 <span className="text-sm">Sub-cats</span></p>
              </div>
           </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
           {filteredProducts.map(product => {
              const capacity = calculateCapacity(product);
              return (
                <div 
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsDetailSheetOpen(true);
                  }}
                  className="bg-white p-2 rounded-[45px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 group cursor-pointer"
                >
                  <div className="aspect-[4/5] bg-slate-50 rounded-[38px] overflow-hidden relative">
                     <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 className="text-white" size={32} />
                     </div>
                     <div className="absolute top-6 right-6 z-10">
                        <span className={cn(
                          "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border",
                          capacity > 50 ? "bg-white/90 text-emerald-600 border-emerald-100" : "bg-red-50/90 text-red-600 border-red-100"
                        )}>
                          {capacity > 0 ? `Can Make: ${capacity} ${product.unit}s` : "Stock Blocked"}
                        </span>
                     </div>
                     {/* Placeholder Image */}
                     <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                        <Palette size={64} className="group-hover:scale-110 group-hover:text-primary/20 transition-all duration-700" />
                        <span className="text-[10px] font-black uppercase tracking-widest mt-2">{product.subCategoryId.split('_')[1]} / COLLECTION</span>
                     </div>
                  </div>

                  <div className="p-8 space-y-4">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">SKU: {product.id}</p>
                           <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors tracking-tighter uppercase">{product.name}</h3>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-black text-slate-900 tracking-tighter">{product.pricePerUnit} <span className="text-[10px] text-slate-400">EGP</span></p>
                           <p className="text-[10px] font-bold text-slate-300 uppercase">per {product.unit}</p>
                        </div>
                     </div>
                     <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{product.description}</p>
                     
                     <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                              <Boxes size={14} />
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.requirements.length} Components</span>
                        </div>
                        <ChevronRight className="text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
                     </div>
                  </div>
                </div>
              );
           })}
        </div>
      </div>

      {/* --- SIDE SHEETS --- */}

      {/* 1. Add/Edit Product Sheet */}
      <Sheet open={isProductSheetOpen} onOpenChange={setIsProductSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl p-0 border-none flex flex-col bg-white">
          <div className="bg-slate-900 p-12 text-white relative">
             <div className="absolute top-0 right-0 p-10 opacity-10">
                <Palette size={120} />
             </div>
             <SheetHeader>
                <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-white">Product Architect</SheetTitle>
                <SheetDescription className="text-slate-400 font-bold text-sm">Design a new marketable product and link its production recipe.</SheetDescription>
             </SheetHeader>
          </div>

          <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-12 space-y-10">
             <div className="space-y-8">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Listing Identity</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Market Name</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        placeholder="Ex: Royal Velvet Mandala"
                        value={newProduct.name || ""}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sub-Category</label>
                      <select 
                        className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none appearance-none"
                        value={newProduct.subCategoryId}
                        onChange={e => setNewProduct({...newProduct, subCategoryId: e.target.value})}
                      >
                         {subCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sales Unit</label>
                      <select 
                        className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none appearance-none"
                        value={newProduct.unit}
                        onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                      >
                         <option>Meter</option>
                         <option>Roll</option>
                         <option>Piece</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Market Price</label>
                   <div className="relative">
                      <input 
                        type="number"
                        className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none"
                        placeholder="0.00"
                        value={newProduct.pricePerUnit || ""}
                        onChange={e => setNewProduct({...newProduct, pricePerUnit: parseFloat(e.target.value)})}
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">EGP / {newProduct.unit}</span>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Website Description</label>
                   <textarea 
                     rows={3}
                     className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                     placeholder="How would you sell this to a customer?"
                     value={newProduct.description || ""}
                     onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                   />
                </div>
             </div>

             <div className="space-y-8 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Production Recipe (BOM)</h4>
                </div>
                <div className="p-8 bg-emerald-50/50 rounded-[35px] border border-emerald-100/50 space-y-6">
                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Link Material Requirements</p>
                   {/* This would ideally be a dynamic list where you select from InventorySKUs */}
                   <div className="space-y-4">
                      <div className="flex gap-4 items-center">
                         <div className="flex-1 p-4 bg-white rounded-xl text-xs font-black text-slate-400">Cotton Premium XL</div>
                         <div className="w-24 p-4 bg-white rounded-xl text-xs font-black text-slate-900 border border-emerald-100">1.2m</div>
                      </div>
                      <div className="flex gap-4 items-center opacity-50 italic">
                         <PlusCircle size={16} className="text-emerald-400" />
                         <span className="text-[10px] font-black text-slate-400 uppercase">Map another raw material...</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Design Gallery</label>
                <div className="grid grid-cols-4 gap-4">
                   <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 hover:border-primary transition-all cursor-pointer">
                      <Plus size={24} />
                   </div>
                </div>
             </div>
          </form>

          <div className="p-10 border-t border-slate-50 flex gap-4 bg-slate-50/30">
             <button 
               onClick={() => setIsProductSheetOpen(false)}
               className="flex-1 py-5 border-2 border-slate-100 rounded-[22px] font-black text-xs text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest"
             >
               Discard
             </button>
             <button 
               onClick={handleSaveProduct}
               className="flex-[2] py-5 bg-primary text-white rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase"
             >
               Build Product
             </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 2. Product Detail Insight Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-4xl p-0 border-none flex flex-col bg-slate-50">
          {selectedProduct && (
            <>
              <div className="bg-white p-12 relative border-b border-slate-100">
                 <button 
                   onClick={() => setIsDetailSheetOpen(false)}
                   className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-300"
                 >
                   <X size={24} />
                 </button>

                 <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
                    <div className="w-40 h-54 bg-slate-900 text-white rounded-[45px] flex items-center justify-center text-6xl font-black shadow-2xl shadow-slate-200">
                       {selectedProduct.name[0]}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left space-y-6 pt-4">
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{selectedProduct.name}</h2>
                          <span className="px-5 py-2 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
                             {subCategories.find(s => s.id === selectedProduct.subCategoryId)?.name}
                          </span>
                       </div>
                       
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-10 font-black text-sm text-slate-400">
                          <div className="flex items-center gap-2 uppercase tracking-tight">
                             <Tag size={16} className="text-accent" /> {selectedProduct.id}
                          </div>
                          <div className="flex items-center gap-2 uppercase tracking-tight text-slate-900">
                             <LayoutGrid size={16} className="text-primary" /> {selectedProduct.unit} based
                          </div>
                          <div className="flex items-center gap-2 uppercase tracking-tight text-emerald-600">
                             <CheckCircle2 size={16} /> Market Ready
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingProduct(selectedProduct);
                            setNewProduct(selectedProduct);
                            setIsDetailSheetOpen(false);
                            setIsProductSheetOpen(true);
                          }}
                          className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200 shadow-sm"
                        >
                           <Pencil size={20} />
                        </button>
                        <button className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm">
                           <Trash size={20} />
                        </button>
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto px-12 py-8">
                 <Tabs defaultValue="guidelines" className="space-y-10">
                    <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start gap-12 rounded-none h-auto p-0">
                       <TabsTrigger value="guidelines" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-5 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Production AI</TabsTrigger>
                       <TabsTrigger value="gallery" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-5 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Web Assets</TabsTrigger>
                       <TabsTrigger value="market" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-5 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Commercials</TabsTrigger>
                    </TabsList>

                    <TabsContent value="guidelines" className="space-y-10 animate-fade-in-up">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="bg-slate-900 p-10 rounded-[45px] text-white relative overflow-hidden shadow-2xl">
                             <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Cpu size={120} />
                             </div>
                             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Calculated Capacity</p>
                             <h4 className="text-7xl font-black tracking-tighter text-emerald-400">
                                {calculateCapacity(selectedProduct).toLocaleString()} <span className="text-xl text-white">m</span>
                             </h4>
                             <p className="text-xs font-bold text-white/60 mt-6 leading-relaxed max-w-xs">
                                Capacity is currently bottlenecked by <span className="text-white underline decoration-red-500">Cyan Pigment</span> stock in warehouse.
                             </p>
                             <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
                                <button className="flex-1 bg-white text-slate-900 py-5 rounded-2xl font-black text-xs tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                                   INITIATE PRODUCTION <Cpu size={18} />
                                </button>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Component Requirements</h5>
                             <div className="space-y-3">
                                {selectedProduct.requirements.map((req, i) => (
                                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary transition-all">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                           <Boxes size={18} />
                                        </div>
                                        <div>
                                           <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{req.materialName}</p>
                                           <p className="text-[10px] text-slate-400 font-bold">INV REF: {req.materialId}</p>
                                        </div>
                                     </div>
                                     <p className="text-lg font-black text-slate-900 tracking-tighter">{req.quantityPerUnit} <span className="text-[10px]">{req.unit}</span></p>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </TabsContent>

                    <TabsContent value="gallery" className="animate-fade-in-up">
                       <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="aspect-square bg-white border-4 border-white shadow-xl rounded-[35px] overflow-hidden group relative">
                             <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                                <ImageIcon size={48} />
                             </div>
                             <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                <button className="p-4 bg-white rounded-full text-primary shadow-xl scale-90 group-hover:scale-110 transition-transform"><Pencil size={20} /></button>
                             </div>
                          </div>
                          <div className="aspect-square bg-slate-50 border-4 border-dashed border-slate-200 rounded-[35px] flex flex-col items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all cursor-pointer">
                             <Plus size={32} className="mb-2" />
                             <span className="text-[10px] font-black uppercase">Add Angle</span>
                          </div>
                       </div>
                    </TabsContent>

                    <TabsContent value="market" className="space-y-6 animate-fade-in-up">
                       <div className="bg-white p-12 rounded-[45px] border border-slate-100 shadow-sm space-y-8">
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 bg-blue-50 text-primary rounded-[24px] flex items-center justify-center">
                                <Palette size={32} />
                             </div>
                             <div>
                                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Market Presence</h4>
                                <p className="text-slate-400 text-sm font-medium">This product is currently LIVE on the consumer-side portal.</p>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="space-y-4">
                                <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Public Description</p>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed italic border-l-4 border-accent pl-6 py-2 bg-slate-50/50 rounded-r-2xl">
                                   "{selectedProduct.description}"
                                </p>
                             </div>
                             <div className="bg-slate-900 p-8 rounded-[35px] text-white space-y-6">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Retail Analytics</p>
                                <div className="space-y-4">
                                   <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                      <span className="text-[10px] font-black uppercase">Lifetime Sales</span>
                                      <span className="text-lg font-black tracking-tighter">1,240 {}</span>
                                   </div>
                                   <button className="w-full flex items-center justify-center gap-2 text-[11px] font-black text-emerald-400 uppercase tracking-widest pt-4">
                                      VIEW PUBLIC LISTING <ExternalLink size={14} />
                                   </button>
                                </div>
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

export default Products;
