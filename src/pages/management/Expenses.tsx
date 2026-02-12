import React, { useState, useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  Banknote, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical, 
  Pencil, 
  Trash, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Building2,
  Zap,
  Coffee,
  Heart,
  Settings2,
  PlusCircle,
  X,
  PieChart,
  ArrowRight,
  ExternalLink,
  Save,
  Tag,
  AlertCircle,
  RefreshCcw,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Download,
  Bell
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
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// --- Types ---

interface Expense {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  paidTo: string;
  status: "Paid" | "Pending" | "Recurring";
  paymentMethod: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
}

// --- Mock Data ---

const initialCategories: ExpenseCategory[] = [
  { id: "CAT_UTIL", name: "Utilities", icon: Zap, color: "bg-amber-500" },
  { id: "CAT_RENT", name: "Facility Rent", icon: Building2, color: "bg-blue-500" },
  { id: "CAT_WAGE", name: "Extra Wages", icon: Banknote, color: "bg-emerald-500" },
  { id: "CAT_MAINT", name: "Maintenance", icon: Settings2, color: "bg-rose-500" },
  { id: "CAT_OTHER", name: "Miscellaneous", icon: Layers, color: "bg-slate-500" }
];

const initialExpenses: Expense[] = [
  {
    id: "EXP-101",
    categoryId: "CAT_UTIL",
    description: "Factory Electricity Bill - Jan",
    amount: 14500,
    date: "2024-01-15",
    paidTo: "State Energy Corp",
    status: "Paid",
    paymentMethod: "Bank Transfer"
  },
  {
    id: "EXP-102",
    categoryId: "CAT_RENT",
    description: "Monthly Warehouse Lease",
    amount: 45000,
    date: "2024-02-01",
    paidTo: "Industrial Real Estate",
    status: "Recurring",
    paymentMethod: "Direct Debit"
  }
];

const Expenses = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>(initialCategories);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("All");
  
  // UI State
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  // Form State
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: "",
    amount: 0,
    categoryId: "",
    paidTo: "",
    status: "Paid",
    paymentMethod: "Cash"
  });

  const [newCatName, setNewCatName] = useState("");

  const handleAddExpense = () => {
    const expenseToAdd: Expense = {
      id: editingExpense?.id || `EXP-${Math.floor(Math.random() * 899) + 100}`,
      categoryId: newExpense.categoryId || "CAT_OTHER",
      description: newExpense.description || "",
      amount: Number(newExpense.amount) || 0,
      date: new Date().toISOString().split('T')[0],
      paidTo: newExpense.paidTo || "",
      status: (newExpense.status as any) || "Paid",
      paymentMethod: newExpense.paymentMethod || "Cash"
    };

    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? expenseToAdd : e));
    } else {
      setExpenses([expenseToAdd, ...expenses]);
    }
    setIsNewExpenseOpen(false);
    setEditingExpense(null);
  };

  const handleAddCategory = () => {
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: newCatName } : c));
    } else {
      const catToAdd: ExpenseCategory = {
        id: `CAT_${Math.floor(Math.random() * 899) + 100}`,
        name: newCatName,
        icon: Tag,
        color: "bg-slate-400"
      };
      setCategories([...categories, catToAdd]);
    }
    setIsCategorySheetOpen(false);
    setEditingCategory(null);
    setNewCatName("");
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exp.paidTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === "All" || exp.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Operational <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Expenses</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">Track factory overhead, maintenance, and facility settlements.</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search description..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => {
                  setEditingExpense(null);
                  setNewExpense({ status: "Paid", paymentMethod: "Cash" });
                  setIsNewExpenseOpen(true);
                }}
                className="bg-primary text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <PlusCircle size={20} />
                <span className="hidden lg:inline uppercase">Add Expense</span>
             </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
           {categories.map(cat => {
             const Icon = cat.icon;
             return (
               <div 
                 key={cat.id} 
                 onClick={() => setSelectedCat(cat.id === selectedCat ? "All" : cat.id)}
                 className={cn(
                  "p-8 rounded-[40px] border transition-all cursor-pointer group relative overflow-hidden",
                  selectedCat === cat.id ? "bg-slate-900 border-slate-900 text-white shadow-2xl" : "bg-white border-slate-100 text-slate-900 hover:border-primary/20"
                 )}
               >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110",
                    selectedCat === cat.id ? "bg-white/20" : "bg-slate-50"
                  )}>
                     <Icon size={24} className={selectedCat === cat.id ? "text-white" : "text-slate-400"} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest">{cat.name}</h3>
                  <div className="flex justify-between items-end mt-2">
                     <p className={cn("text-[10px] font-bold uppercase", selectedCat === cat.id ? "text-white/40" : "text-slate-300")}>
                        {expenses.filter(e => e.categoryId === cat.id).length} Entries
                     </p>
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); setNewCatName(cat.name); setIsCategorySheetOpen(true); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Pencil size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setCategories(categories.filter(c => c.id !== cat.id)); }} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash size={12} /></button>
                     </div>
                  </div>
               </div>
             )
           })}
           <button 
             onClick={() => { setEditingCategory(null); setNewCatName(""); setIsCategorySheetOpen(true); }}
             className="p-8 rounded-[40px] border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-300 hover:border-primary hover:text-primary transition-all flex flex-col items-center justify-center gap-2 group"
           >
              <PlusCircle size={32} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">New Category</span>
           </button>
        </div>

        {/* Directory & Filters */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
           <div className="flex-1 w-full space-y-6">
              <div className="flex items-center gap-6 bg-white p-2 rounded-full border border-slate-100 w-fit">
                 <button 
                   onClick={() => setSelectedCat("All")}
                   className={cn(
                     "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                     selectedCat === "All" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:bg-slate-50"
                   )}
                 >
                   Full Directory
                 </button>
                 <button className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all flex items-center gap-2">
                    <RefreshCcw size={14} /> Recurring Obligations
                 </button>
              </div>

              <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date / ID</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Entity</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description Memo</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume (EGP)</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Settlement</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold">
                       {filteredExpenses.map(exp => (
                         <tr 
                           key={exp.id} 
                           onClick={() => setSelectedExpense(exp)}
                           className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                         >
                            <td className="px-10 py-8">
                               <div className="flex flex-col">
                                  <span className="text-xs text-slate-900">{exp.date}</span>
                                  <span className="text-[10px] text-slate-300 uppercase mt-0.5 tracking-widest">{exp.id}</span>
                               </div>
                            </td>
                            <td className="px-10 py-8 font-black text-xs uppercase tracking-widest text-slate-700">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">{exp.paidTo[0]}</div>
                                  {exp.paidTo}
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <p className="text-xs text-slate-400 max-w-[250px] line-clamp-1 italic">"{exp.description}"</p>
                            </td>
                            <td className="px-10 py-8">
                               <span className="text-lg font-black text-slate-900 tracking-tighter italic">-{exp.amount.toLocaleString()} <span className="text-sm">EGP</span></span>
                            </td>
                            <td className="px-10 py-8 text-right">
                               <span className={cn(
                                 "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                 exp.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                 exp.status === "Recurring" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                               )}>
                                  {exp.status}
                               </span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="w-full lg:w-96 space-y-8">
              <div className="bg-slate-900 p-10 rounded-[45px] text-white space-y-8 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingDown size={100} />
                 </div>
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Gross Burn Rate</p>
                 <div className="space-y-1">
                    <h4 className="text-5xl font-black tracking-tighter text-rose-400">{totalExpenses.toLocaleString()} <span className="text-xl text-white">EGP</span></h4>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Aggregate Expenditure Ledger</p>
                 </div>
                 <div className="pt-8 border-t border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-white/40">Fiscal Health</span>
                       <span className="text-emerald-400 flex items-center gap-1"><TrendingUp size={12} /> Positive Flow</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                       <div className="w-2/3 h-full bg-emerald-500 rounded-full"></div>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[45px] border border-slate-100 space-y-8 shadow-sm">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex justify-between items-center">
                    Payment Distributions <PieChart size={16} />
                 </h4>
                 <div className="space-y-6">
                    {categories.slice(0, 3).map(cat => (
                      <div key={cat.id} className="space-y-3">
                         <div className="flex justify-between items-center text-xs font-black uppercase tracking-tight">
                            <span className="text-slate-700">{cat.name}</span>
                            <span className="text-slate-400">{Math.floor(Math.random() * 40 + 10)}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-slate-50 rounded-full">
                            <div className={cn("h-full rounded-full", cat.color)} style={{ width: `${Math.random() * 60 + 20}%` }}></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- ADD/EDIT EXPENSE SHEET --- */}
      <Sheet open={isNewExpenseOpen} onOpenChange={setIsNewExpenseOpen}>
         <SheetContent className="w-full sm:max-w-2xl p-0 border-none flex flex-col bg-white">
            <div className="bg-slate-900 p-12 text-white relative">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Banknote size={120} />
               </div>
               <SheetHeader>
                  <SheetTitle className="text-4xl font-black uppercase tracking-tighter text-white">Expense Entry</SheetTitle>
                  <SheetDescription className="text-white/80 font-bold text-sm">Register outward capital flow into the system audit.</SheetDescription>
               </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-10">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Volume (EGP)</label>
                  <div className="relative">
                     <input 
                       className="w-full bg-slate-50 text-rose-600 border-none px-8 py-6 rounded-[30px] text-4xl font-black focus:ring-4 focus:ring-rose-500/5 focus:bg-white transition-all outline-none" 
                       placeholder="0.00"
                       type="number"
                       value={newExpense.amount}
                       onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                     />
                     <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-300">Egyptian Pounds</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Spending Category</label>
                     <select 
                       className="w-full bg-slate-50 border-none px-6 py-5 rounded-[25px] text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none appearance-none cursor-pointer"
                       value={newExpense.categoryId}
                       onChange={(e) => setNewExpense({...newExpense, categoryId: e.target.value})}
                     >
                        <option value="">Select Logic</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Counterparty (Paid To)</label>
                     <input 
                       className="w-full bg-slate-50 border-none px-6 py-5 rounded-[25px] text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none" 
                       placeholder="Ex: Egypt Telecom"
                       value={newExpense.paidTo}
                       onChange={(e) => setNewExpense({...newExpense, paidTo: e.target.value})}
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Memo / Description</label>
                  <textarea 
                    className="w-full bg-slate-50 border-none px-6 py-5 rounded-[25px] text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none h-32 resize-none" 
                    placeholder="Provide granular details for the audit log..."
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Lifecycle Status</label>
                     <div className="flex gap-2">
                        {["Paid", "Pending", "Recurring"].map(s => (
                          <button 
                            key={s}
                            onClick={() => setNewExpense({...newExpense, status: s as any})}
                            className={cn(
                              "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                              newExpense.status === s ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            )}
                          >
                             {s}
                          </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Payment Engine</label>
                     <select 
                       className="w-full bg-slate-50 border-none px-6 py-5 rounded-[25px] text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none appearance-none cursor-pointer"
                       value={newExpense.paymentMethod}
                       onChange={(e) => setNewExpense({...newExpense, paymentMethod: e.target.value})}
                     >
                        <option value="Cash">Physical Cash</option>
                        <option value="Bank Transfer">Wire Transfer</option>
                        <option value="Mobile Wallet">Vodafone / Mobile Wallet</option>
                        <option value="Instapay">Instapay Link</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="p-10 border-t border-slate-50 flex gap-4 bg-slate-50/50">
               <button onClick={() => setIsNewExpenseOpen(false)} className="flex-1 py-5 border-2 border-slate-100 rounded-[25px] font-black text-xs text-slate-400 uppercase tracking-widest">Discard Entry</button>
               <button onClick={handleAddExpense} className="flex-[2] py-5 bg-primary text-white rounded-[25px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 uppercase">Forge Expense Settlement</button>
            </div>
         </SheetContent>
      </Sheet>

      {/* --- CATEGORY EDIT SHEET --- */}
      <Sheet open={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen}>
         <SheetContent className="w-full sm:max-w-xl p-0 border-none flex flex-col bg-white">
            <div className="bg-accent p-12 text-white relative">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Layers size={120} />
               </div>
               <SheetHeader>
                  <SheetTitle className="text-4xl font-black uppercase tracking-tighter text-white">{editingCategory ? "Schema Meta" : "Taxonomy Forge"}</SheetTitle>
                  <SheetDescription className="text-white/80 font-bold text-sm">Define a new operational classification for expenditure logic.</SheetDescription>
               </SheetHeader>
            </div>

            <div className="p-12 space-y-10">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                     {editingCategory ? "Renaming Fragment" : "Classification Identifier"}
                  </label>
                  <div className="flex gap-2">
                     <input 
                       className="flex-1 bg-slate-100 border-none px-5 py-4 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-accent/5 transition-all"
                       placeholder="Ex: Lab Testing"
                       value={newCatName}
                       onChange={(e) => setNewCatName(e.target.value)}
                     />
                     <button onClick={handleAddCategory} className="bg-accent text-white px-8 rounded-xl font-black text-xs uppercase tracking-widest">Apply</button>
                  </div>
               </div>
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
      `}</style>
    </ManagementLayout>
  );
};

export default Expenses;
