import React, { useState, useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  Wallet, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  Building2,
  Users,
  Banknote,
  Receipt,
  Download,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
  History,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";

// --- Types ---

type TransactionType = "Income" | "Expense" | "Procurement" | "Settlement";

interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  entityName: string; // Customer or Supplier or Expense Category
  description: string;
  amount: number;
  paymentMethod: string;
  status: "Completed" | "Pending" | "Failed";
  referenceId: string; // Linked Order ID or Purchase ID
}

// --- Mock Data ---

const initialTransactions: Transaction[] = [
  {
    id: "TRX-5501",
    date: "2024-02-12",
    type: "Income",
    entityName: "Mohamed Ali",
    description: "Partial Payment for Order ORD-9901",
    amount: 15000,
    paymentMethod: "Bank Transfer",
    status: "Completed",
    referenceId: "ORD-9901"
  },
  {
    id: "TRX-5502",
    date: "2024-02-12",
    type: "Expense",
    entityName: "Utilities",
    description: "Electricity Bill - Feb 2024",
    amount: 3400,
    paymentMethod: "Direct Debit",
    status: "Completed",
    referenceId: "EXP-102"
  },
  {
    id: "TRX-5503",
    date: "2024-02-11",
    type: "Procurement",
    entityName: "Textile Pro Egypt",
    description: "Down payment for PO-7701",
    amount: 5000,
    paymentMethod: "Cash",
    status: "Completed",
    referenceId: "PO-7701"
  },
  {
    id: "TRX-5504",
    date: "2024-02-10",
    type: "Income",
    entityName: "E-Textile Solutions",
    description: "Full Payment for Order ORD-8822",
    amount: 12400,
    paymentMethod: "Online Card",
    status: "Completed",
    referenceId: "ORD-8822"
  }
];

const Financials = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | TransactionType>("All");
  
  // UI State
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.entityName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const incomeTotal = transactions.filter(tx => tx.type === "Income").reduce((sum, tx) => sum + tx.amount, 0);
  const expenseTotal = transactions.filter(tx => tx.type !== "Income").reduce((sum, tx) => sum + tx.amount, 0);
  const netPosition = incomeTotal - expenseTotal;

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Financial <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Pulse</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">Master ledger of all cash movements across the factory ecosystem.</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tx Hash / Entity / Ref..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="bg-slate-900 text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 uppercase">
                <Download size={20} />
                <span className="hidden lg:inline">Export CSV</span>
             </button>
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm space-y-4 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                 <TrendingUp size={80} className="text-emerald-500" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gross Cash Inflow</p>
              <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                 {incomeTotal.toLocaleString()} <span className="text-sm">EGP</span>
              </h4>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                 <ArrowUpRight size={14} /> 12% Growth vs Last Mo.
              </div>
           </div>

           <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm space-y-4 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                 <TrendingDown size={80} className="text-rose-500" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gross Cash Outflow</p>
              <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                 {expenseTotal.toLocaleString()} <span className="text-sm">EGP</span>
              </h4>
              <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase">
                 <ArrowDownLeft size={14} /> Operational Burn
              </div>
           </div>

           <div className={cn(
             "p-10 rounded-[45px] text-white shadow-2xl space-y-4 relative overflow-hidden",
             netPosition >= 0 ? "bg-slate-900" : "bg-rose-900"
           )}>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <DollarSign size={80} />
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Net Liquidity Position</p>
              <h4 className="text-4xl font-black tracking-tighter">
                 {Math.abs(netPosition).toLocaleString()} <span className="text-sm">{netPosition >= 0 ? "SURPLUS" : "DEFICIT"} EGP</span>
              </h4>
              <div className="mt-8 pt-6 border-t border-white/5">
                 <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Audited System Ledger</p>
              </div>
           </div>
        </div>

        {/* Directory & Filters */}
        <div className="flex items-center gap-6 bg-white p-2 rounded-full border border-slate-100 w-fit">
           <button 
             onClick={() => setFilterType("All")}
             className={cn(
               "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
               filterType === "All" ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:bg-slate-50"
             )}
           >
             Master View
           </button>
           {[
             { label: "Customer Payments", type: "Income" as const, color: "text-emerald-500", bg: "bg-emerald-50" },
             { label: "Material Sourcing", type: "Procurement" as const, color: "text-blue-500", bg: "bg-blue-50" },
             { label: "Operational Overhead", type: "Expense" as const, color: "text-rose-500", bg: "bg-rose-50" }
           ].map(btn => (
             <button 
               key={btn.type}
               onClick={() => setFilterType(btn.type)}
               className={cn(
                 "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                 filterType === btn.type ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-slate-100/50"
               )}
             >
               {btn.label}
             </button>
           ))}
        </div>

        {/* Main Ledger Table */}
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Master ID / Date</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Counterparty</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Description</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Flow Volume</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Settlement</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Insight</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
                 {filteredTransactions.map(tx => (
                   <tr 
                     key={tx.id} 
                     onClick={() => {
                        setSelectedTx(tx);
                        setIsDetailOpen(true);
                     }}
                     className="hover:bg-slate-50/70 transition-all group cursor-pointer"
                   >
                      <td className="px-8 py-8">
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{tx.id}</span>
                            <span className="text-[10px] text-slate-300 uppercase mt-0.5">{tx.date}</span>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] font-black",
                              tx.type === "Income" ? "bg-emerald-50 text-emerald-600" : 
                              tx.type === "Expense" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                            )}>
                               {tx.entityName[0]}
                            </div>
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{tx.entityName}</span>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <p className="text-xs text-slate-400 max-w-[250px] line-clamp-1 italic">"{tx.description}"</p>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex items-center gap-2">
                            {tx.type === "Income" ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownLeft size={14} className="text-rose-500" />}
                            <span className={cn(
                              "text-lg font-black tracking-tighter",
                              tx.type === "Income" ? "text-emerald-500" : "text-slate-900"
                            )}>
                               {tx.type === "Income" ? "+" : "-"}{tx.amount.toLocaleString()} <span className="text-[10px] text-slate-400">EGP</span>
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-8 text-center">
                         <span className="px-5 py-2 rounded-full bg-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest border border-slate-200">
                            {tx.paymentMethod}
                         </span>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <button className="p-3 bg-white rounded-2xl text-slate-200 border border-slate-100 group-hover:text-primary group-hover:border-primary/20 transition-all shadow-sm">
                            <ChevronRight size={18} />
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           {filteredTransactions.length === 0 && (
             <div className="p-40 flex flex-col items-center justify-center text-slate-100">
                <Wallet size={80} className="mb-4 opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">No transaction records detected</p>
             </div>
           )}
        </div>
      </div>

      {/* --- Transaction Detail Sheet --- */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 border-none flex flex-col bg-slate-50">
           {selectedTx && (
             <>
               <div className="bg-white p-12 relative border-b border-slate-100">
                  <button onClick={() => setIsDetailOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-300">
                     <X size={24} />
                  </button>
                  
                  <div className="flex flex-col items-center text-center space-y-8 pt-10">
                     <div className={cn(
                       "w-24 h-24 rounded-[35px] flex items-center justify-center text-white shadow-2xl",
                       selectedTx.type === "Income" ? "bg-emerald-500" : selectedTx.type === "Expense" ? "bg-rose-500" : "bg-blue-500"
                     )}>
                        <Wallet size={48} />
                     </div>

                     <div className="space-y-2">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                           {selectedTx.type === "Income" ? "" : "-"}{selectedTx.amount.toLocaleString()} <span className="text-xl">EGP</span>
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Audited Entry: {selectedTx.id}</p>
                     </div>

                     <div className="flex gap-10 py-6 px-12 bg-slate-50 rounded-[35px] border border-slate-100 shadow-sm font-black text-[10px] uppercase tracking-widest text-slate-400">
                        <div className="flex flex-col items-start gap-1">
                           <span className="opacity-40">Entry Date</span>
                           <span className="text-slate-900">{selectedTx.date}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="flex flex-col items-start gap-1">
                           <span className="opacity-40">Method</span>
                           <span className="text-slate-900">{selectedTx.paymentMethod}</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex-1 p-12 space-y-12 overflow-y-auto">
                  <div className="space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Transaction Trace</h5>
                     </div>
                     <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                        <div className="flex justify-between items-center group">
                           <div>
                              <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Source / Entity</p>
                              <p className="text-lg font-black text-slate-900 uppercase tracking-widest group-hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                                 {selectedTx.entityName} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </p>
                           </div>
                           <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                              {selectedTx.type === "Income" ? <Users size={20} /> : <Building2 size={20} />}
                           </div>
                        </div>

                        <div className="space-y-2">
                           <p className="text-[9px] font-black text-slate-300 uppercase">Operational Memo</p>
                           <p className="text-sm font-medium text-slate-500 leading-relaxed italic border-l-4 border-slate-100 pl-6 py-2">
                              "{selectedTx.description}"
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">System Linkage</h5>
                     </div>
                     <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[40px] text-white overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all">
                        <div className="absolute top-0 right-0 p-10 opacity-10 grayscale group-hover:grayscale-0 transition-all">
                           <History size={80} />
                        </div>
                        <div className="relative z-10">
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Linked Document</p>
                           <p className="text-xl font-black uppercase tracking-widest">{selectedTx.referenceId}</p>
                        </div>
                        <ArrowRight className="text-primary group-hover:translate-x-2 transition-transform" />
                     </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                     <button className="flex-1 py-5 bg-white border border-slate-200 rounded-[25px] font-black text-xs text-slate-900 uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                        <Download size={18} /> Receipt.pdf
                     </button>
                     <button className="flex-1 py-5 bg-rose-50 border border-rose-100 rounded-[25px] font-black text-xs text-rose-600 uppercase tracking-widest shadow-sm hover:bg-rose-600 hover:text-white transition-all">
                        REVOKE TRX
                     </button>
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

export default Financials;
