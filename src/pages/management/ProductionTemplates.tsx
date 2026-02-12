import React, { useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  FileText, 
  Plus, 
  Search, 
  ChevronRight, 
  Pencil, 
  Trash, 
  PlusCircle, 
  X, 
  Layers, 
  Save, 
  Boxes, 
  Settings2,
  Cpu,
  ArrowRight,
  Zap,
  LayoutTemplate,
  CheckCircle2,
  Calculator,
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

// --- Types ---
interface TemplateMaterial {
  materialId: string;
  materialName: string;
  ratioPerUnit: number; // e.g. 1.1 meters per request unit
  unit: string;
}

interface ProductionTemplate {
  id: string;
  name: string;
  description: string;
  materials: TemplateMaterial[];
  linkedProductCount: number;
}

// --- Mock Data ---
const initialTemplates: ProductionTemplate[] = [
  {
    id: "TPL-001",
    name: "Standard Silk Print Run",
    description: "Linear consumption for silk products including print bleed and seam allowance.",
    linkedProductCount: 5,
    materials: [
      { materialId: "MAT_SILK", materialName: "Silk Premium", ratioPerUnit: 1.1, unit: "m" },
      { materialId: "MAT_INK_CYAN", materialName: "Ink Cyan", ratioPerUnit: 15, unit: "g" },
      { materialId: "MAT_PAPER_P", materialName: "Protection Paper", ratioPerUnit: 1.15, unit: "m" }
    ]
  },
  {
    id: "TPL-002",
    name: "Heavy Linen Finish",
    description: "Increased ink density and protection paper for heavy weight linen.",
    linkedProductCount: 2,
    materials: [
      { materialId: "MAT_LINEN", materialName: "Pure Linen", ratioPerUnit: 1.05, unit: "m" },
      { materialId: "MAT_INK_BLACK", materialName: "Ink Pitch Black", ratioPerUnit: 25, unit: "g" }
    ]
  }
];

const ProductionTemplates = () => {
  const [templates, setTemplates] = useState<ProductionTemplate[]>(initialTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  
  // UI State
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProductionTemplate | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ProductionTemplate>>({
    name: "",
    description: "",
    materials: []
  });

  const [newMaterial, setNewMaterial] = useState<Partial<TemplateMaterial>>({
    materialName: "",
    ratioPerUnit: 0,
    unit: "m"
  });

  const handleAddMaterial = () => {
    if (newMaterial.materialName && newMaterial.ratioPerUnit) {
      setFormData({
        ...formData,
        materials: [
          ...(formData.materials || []),
          { 
            ...newMaterial as TemplateMaterial, 
            materialId: `MAT_${Math.floor(Math.random() * 8999) + 1000}` 
          }
        ]
      });
      setNewMaterial({ materialName: "", ratioPerUnit: 0, unit: "m" });
    }
  };

  const handleRemoveMaterial = (id: string) => {
    setFormData({
      ...formData,
      materials: formData.materials?.filter(m => m.materialId !== id)
    });
  };

  const handleSaveTemplate = () => {
    if (formData.name && (formData.materials?.length || 0) > 0) {
      const templateToSave: ProductionTemplate = {
        id: editingTemplate?.id || `TPL-${Math.floor(Math.random() * 899) + 100}`,
        name: formData.name || "",
        description: formData.description || "",
        materials: formData.materials || [],
        linkedProductCount: editingTemplate?.linkedProductCount || 0
      };

      if (editingTemplate) {
        setTemplates(templates.map(t => t.id === editingTemplate.id ? templateToSave : t));
      } else {
        setTemplates([templateToSave, ...templates]);
      }
      setIsNewTemplateOpen(false);
      setEditingTemplate(null);
      setFormData({ name: "", description: "", materials: [] });
    }
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Production <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Templates</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic mt-1">Standardize material consumption ratios for industrial accuracy.</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search schemas..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => {
                   setEditingTemplate(null);
                   setFormData({ name: "", description: "", materials: [] });
                   setIsNewTemplateOpen(true);
                }}
                className="bg-primary text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <PlusCircle size={20} />
                <span className="hidden lg:inline uppercase italic">Define Schema</span>
             </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredTemplates.map(tpl => (
             <div 
               key={tpl.id}
               className="bg-white rounded-[45px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all group overflow-hidden flex flex-col"
             >
                <div className="p-10 space-y-6 flex-1">
                   <div className="flex justify-between items-start">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                         <LayoutTemplate size={32} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 px-4 py-2 rounded-full">
                         {tpl.linkedProductCount} PRODUCTS
                      </span>
                   </div>

                   <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight italic">{tpl.name}</h3>
                      <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2 italic italic opacity-70">"{tpl.description}"</p>
                   </div>

                   <div className="pt-6 border-t border-slate-50 space-y-4">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                         <Calculator size={14} className="text-primary" /> Consumption Ratios
                      </p>
                      <div className="space-y-2">
                         {tpl.materials.map((m, idx) => (
                           <div key={idx} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                              <span className="text-[10px] font-black text-slate-500 uppercase">{m.materialName}</span>
                              <span className="text-xs font-black text-slate-900">{m.ratioPerUnit} {m.unit}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-slate-50 flex gap-2">
                   <button 
                     onClick={() => {
                        setEditingTemplate(tpl);
                        setFormData(tpl);
                        setIsNewTemplateOpen(true);
                     }}
                     className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2"
                   >
                      <Pencil size={14} /> Modify Ratio
                   </button>
                   <button 
                     onClick={() => handleDeleteTemplate(tpl.id)}
                     className="p-4 bg-white border border-slate-200 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                   >
                      <Trash size={18} />
                   </button>
                </div>
             </div>
           ))}

           {/* Create New Card */}
           <button 
             onClick={() => {
                setEditingTemplate(null);
                setFormData({ name: "", description: "", materials: [] });
                setIsNewTemplateOpen(true);
             }}
             className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[45px] p-10 flex flex-col items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all group min-h-[400px] hover:bg-white"
           >
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/5 transition-transform group-hover:border-primary">
                 <Plus size={40} className="group-hover:text-primary" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest italic">New Schema Definition</p>
           </button>
        </div>
      </div>

      {/* Sheet for New Template */}
      <Sheet open={isNewTemplateOpen} onOpenChange={setIsNewTemplateOpen}>
         <SheetContent className="w-full sm:max-w-2xl p-0 border-none flex flex-col bg-white overflow-hidden">
            <div className="bg-slate-900 p-12 text-white relative">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <LayoutTemplate size={120} />
               </div>
               <SheetHeader className="relative z-10">
                  <SheetTitle className="text-4xl font-black uppercase tracking-tighter text-white italic">Schema <span className="text-primary not-italic">Forge</span></SheetTitle>
                  <SheetDescription className="text-white/60 font-medium text-xs tracking-[0.2em] uppercase">Configure industrial consumption logic.</SheetDescription>
               </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
               <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Template Signature Name</label>
                     <input 
                       className="w-full bg-slate-50 border-none px-6 py-5 rounded-[25px] text-lg font-black focus:ring-4 focus:ring-primary/5 outline-none transition-all uppercase tracking-tighter" 
                       placeholder="Ex: SILK MASTER RATIO"
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Operational Context / Description</label>
                     <textarea 
                       className="w-full bg-slate-50 border-none px-6 py-5 rounded-[25px] text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none h-24 resize-none transition-all" 
                       placeholder="Specify use cases for this consumption model..."
                       value={formData.description}
                       onChange={(e) => setFormData({...formData, description: e.target.value})}
                     />
                  </div>
               </div>

               <div className="space-y-6 pt-10 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                     <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] italic flex items-center gap-2">
                        <Boxes size={16} className="text-primary" /> Ratio Components
                     </h5>
                  </div>

                  {/* Add Material Fragment */}
                  <div className="bg-slate-50 p-6 rounded-[35px] border border-slate-100 space-y-4 shadow-sm">
                     <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Material</label>
                           <input 
                              className="w-full bg-white border-none px-4 py-3 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-primary/10" 
                              placeholder="Ink Cyan"
                              value={newMaterial.materialName}
                              onChange={(e) => setNewMaterial({...newMaterial, materialName: e.target.value})}
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ratio</label>
                           <input 
                              type="number"
                              className="w-full bg-white border-none px-4 py-3 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-primary/10" 
                              placeholder="1.1"
                              value={newMaterial.ratioPerUnit || ""}
                              onChange={(e) => setNewMaterial({...newMaterial, ratioPerUnit: Number(e.target.value)})}
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit</label>
                           <select 
                              className="w-full bg-white border-none px-4 py-3 rounded-xl text-[10px] font-black outline-none"
                              value={newMaterial.unit}
                              onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                           >
                              <option value="m">Meters (m)</option>
                              <option value="g">Grams (g)</option>
                              <option value="L">Liters (L)</option>
                              <option value="pcs">Pieces (pcs)</option>
                           </select>
                        </div>
                     </div>
                     <button 
                       onClick={handleAddMaterial}
                       className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-xl shadow-slate-200"
                     >
                        <PlusCircle size={16} /> Add Logic Component
                     </button>
                  </div>

                  {/* Material List */}
                  <div className="space-y-2">
                     {formData.materials?.map((m, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 group animate-fade-in transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-slate-100">
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                                 <Zap size={14} />
                              </div>
                              <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{m.materialName}</span>
                           </div>
                           <div className="flex items-center gap-6">
                              <span className="text-xs font-black text-primary italic">{m.ratioPerUnit} <span className="opacity-40 uppercase tracking-widest ml-1">{m.unit}</span></span>
                              <button 
                                onClick={() => handleRemoveMaterial(m.materialId)}
                                className="text-slate-200 hover:text-rose-500 transition-all"
                              >
                                 <Trash size={14} />
                              </button>
                           </div>
                        </div>
                     ))}
                     {(!formData.materials || formData.materials.length === 0) && (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-200 space-y-2 border-2 border-dashed border-slate-50 rounded-[35px]">
                           <Info size={32} />
                           <p className="text-[9px] font-black uppercase tracking-widest">No consumption ratios defined</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="p-10 border-t border-slate-50 flex gap-4 bg-slate-50/50">
               <button onClick={() => setIsNewTemplateOpen(false)} className="flex-1 py-5 border-2 border-slate-200 rounded-[25px] font-black text-xs text-slate-400 uppercase tracking-widest transition-all hover:bg-white">Discard Forge</button>
               <button 
                 onClick={handleSaveTemplate}
                 className="flex-[2] py-5 bg-primary text-white rounded-[25px] font-black text-xs tracking-widest uppercase shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
               >
                  <Save size={20} /> Deploy Schema Policy
               </button>
            </div>
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
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </ManagementLayout>
  );
};

export default ProductionTemplates;
