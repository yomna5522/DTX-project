import React, { useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  Printer, 
  Download, 
  ExternalLink, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  History,
  X,
  Building2,
  Users,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle
} from "@/components/ui/sheet";

// --- Types ---

interface Invoice {
  id: string;
  orderId: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  items: {
    description: string;
    qty: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: "Paid" | "Outstanding" | "Overdue";
}

// --- Mock Data ---

const initialInvoices: Invoice[] = [
  {
    id: "INV-2024-001",
    orderId: "ORD-9901",
    date: "2024-02-12",
    dueDate: "2024-02-26",
    customerName: "Mohamed Ali",
    customerAddress: "Building 12, Industrial Zone, Cairo, Egypt",
    customerEmail: "mohamed.ali@example.com",
    items: [
      { description: "Golden Mandala Silk - 50m Printing run", qty: 50, rate: 450, amount: 22500 }
    ],
    subtotal: 22500,
    tax: 3150,
    total: 25650,
    status: "Outstanding"
  },
  {
    id: "INV-2024-002",
    orderId: "ORD-8822",
    date: "2024-02-10",
    dueDate: "2024-02-10",
    customerName: "E-Textile Solutions",
    customerAddress: "4th Floor, Tech Hub, Giza",
    customerEmail: "finance@etextile.co",
    items: [
      { description: "Minimal Linen Pattern - 100m Standard", qty: 100, rate: 124, amount: 12400 }
    ],
    subtotal: 12400,
    tax: 0,
    total: 12400,
    status: "Paid"
  }
];

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Billing <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Vault</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">High-fidelity branded invoices for customer orders and settlements.</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Invoice # / Order / Entity..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="bg-primary text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 uppercase">
                <Printer size={20} />
                <span className="hidden lg:inline">Batch Print</span>
             </button>
          </div>
        </div>

        {/* Financial Recap (Mini) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-emerald-500/20 transition-all">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Receivables</p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{(invoices.filter(i => i.status === "Outstanding").reduce((sum, i) => sum + i.total, 0)).toLocaleString()} <span className="text-xs">EGP</span></h4>
           </div>
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Settled</p>
              <h4 className="text-2xl font-black text-emerald-500 tracking-tighter">{(invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.total, 0)).toLocaleString()} <span className="text-xs font-black text-emerald-400">EGP</span></h4>
           </div>
        </div>

        {/* Invoice Directory */}
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hash / Cycle</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Entity</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Date</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Volume</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">View</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
                 {filteredInvoices.map(inv => (
                   <tr 
                     key={inv.id} 
                     onClick={() => {
                        setSelectedInvoice(inv);
                        setIsPreviewOpen(true);
                     }}
                     className="hover:bg-slate-50/70 transition-all group cursor-pointer"
                   >
                      <td className="px-8 py-8">
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{inv.id}</span>
                            <span className="text-[9px] font-black text-primary uppercase mt-0.5 tracking-widest">{inv.orderId}</span>
                         </div>
                      </td>
                      <td className="px-8 py-8 uppercase tracking-widest text-xs text-slate-700">{inv.customerName}</td>
                      <td className="px-8 py-8 text-xs text-slate-400 font-black">{inv.date}</td>
                      <td className="px-8 py-8">
                         <span className="text-lg font-black text-slate-900 tracking-tighter">{inv.total.toLocaleString()} <span className="text-[10px] text-slate-400">EGP</span></span>
                      </td>
                      <td className="px-8 py-8 text-center">
                         <span className={cn(
                           "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                           inv.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                           inv.status === "Outstanding" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-red-50 text-red-600 border-red-100"
                         )}>
                            {inv.status}
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
        </div>
      </div>

      {/* --- Branded Invoice Preview Sheet --- */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent className="w-full sm:max-w-4xl p-0 border-none flex flex-col bg-slate-100">
           {selectedInvoice && (
             <>
               <div className="bg-slate-900 p-8 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary opacity-10 pointer-events-none"></div>
                  <div className="flex items-center gap-4 relative z-10 text-white">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <FileText size={24} className="text-primary" />
                     </div>
                     <span className="text-xs font-black uppercase tracking-[0.3em]">{selectedInvoice.id} PREVIEW</span>
                  </div>
                  <div className="flex gap-3 relative z-10">
                     <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"><Download size={20} /></button>
                     <button className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"><Printer size={20} /></button>
                     <button onClick={() => setIsPreviewOpen(false)} className="p-3 bg-rose-500/20 hover:bg-rose-500 text-white rounded-xl transition-all ml-4"><X size={20} /></button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-12 bg-slate-100">
                  {/* --- ACTUAL BRANDED INVOICE START --- */}
                  <div className="bg-white shadow-2xl rounded-[40px] overflow-hidden max-w-3xl mx-auto flex flex-col min-h-[1000px]">
                     {/* Invoice Header */}
                     <div className="p-16 border-b-8 border-primary bg-slate-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 grayscale pointer-events-none transform rotate-12">
                           <LayoutGrid size={200} />
                        </div>
                        
                        <div className="flex justify-between items-start relative z-10">
                           <div className="space-y-6">
                              <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">DTX <span className="text-primary not-italic">PRINTING</span> Center</h2>
                              <div className="text-[10px] font-bold text-slate-400 flex flex-col gap-1 uppercase tracking-widest">
                                 <span>Industrial Zone A, 4th Industrial City</span>
                                 <span>Cairo, Egypt</span>
                                 <span>tax id: 990-221-440</span>
                              </div>
                           </div>
                           <div className="text-right space-y-2">
                              <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tighter opacity-10">INVOICE</h1>
                              <p className="text-xl font-black text-slate-900 uppercase tracking-widest">{selectedInvoice.id}</p>
                           </div>
                        </div>
                     </div>

                     <div className="p-16 space-y-16 flex-1">
                        {/* Bill To / Info Grid */}
                        <div className="grid grid-cols-2 gap-20">
                           <div className="space-y-4">
                              <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] border-b border-primary/10 pb-2">Bill Recipient</h5>
                              <div className="space-y-2">
                                 <p className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{selectedInvoice.customerName}</p>
                                 <p className="text-sm font-medium text-slate-500 leading-relaxed pr-10 italic">"{selectedInvoice.customerAddress}"</p>
                                 <p className="text-xs font-black text-slate-400 mt-4">{selectedInvoice.customerEmail}</p>
                              </div>
                           </div>
                           <div className="flex justify-end">
                              <div className="space-y-6 text-right w-64">
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="text-[9px] font-black text-slate-300 uppercase">Issuance Date</div>
                                    <div className="text-xs font-black text-slate-900">{selectedInvoice.date}</div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="text-[9px] font-black text-slate-300 uppercase">Settlement Term</div>
                                    <div className="text-xs font-black text-slate-900">{selectedInvoice.dueDate}</div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                    <div className="text-[9px] font-black text-slate-300 uppercase">Status</div>
                                    <div className={cn(
                                       "text-[10px] font-black uppercase tracking-widest",
                                       selectedInvoice.status === "Paid" ? "text-emerald-500" : "text-blue-500"
                                    )}>{selectedInvoice.status}</div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-6">
                           <table className="w-full text-left">
                              <thead>
                                 <tr className="border-b-2 border-slate-900">
                                    <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest">Service Description</th>
                                    <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Unit Volume</th>
                                    <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Execution Rate</th>
                                    <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">Ext. Total</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {selectedInvoice.items.map((item, idx) => (
                                   <tr key={idx}>
                                      <td className="py-8 font-black text-slate-900 uppercase tracking-tight text-sm">{item.description}</td>
                                      <td className="py-8 text-center font-bold text-slate-500">{item.qty} units</td>
                                      <td className="py-8 text-center font-bold text-slate-500">{item.rate.toLocaleString()} EGP</td>
                                      <td className="py-8 text-right font-black text-slate-900 text-lg tracking-tighter">{item.amount.toLocaleString()} EGP</td>
                                   </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>

                        {/* Totals Section */}
                        <div className="flex justify-end pt-16">
                           <div className="w-80 space-y-6">
                              <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                                 <span>Net Subtotal</span>
                                 <span className="text-slate-900 font-bold">{selectedInvoice.subtotal.toLocaleString()} EGP</span>
                              </div>
                              <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                                 <span>Applied V.A.T (14%)</span>
                                 <span className="text-slate-900 font-bold">{selectedInvoice.tax.toLocaleString()} EGP</span>
                              </div>
                              <div className="flex justify-between items-center py-8 px-8 bg-slate-900 text-white rounded-[30px] shadow-xl shadow-slate-200">
                                 <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Grand Total</span>
                                 <span className="text-3xl font-black tracking-tighter">{selectedInvoice.total.toLocaleString()} <span className="text-xs font-black">EGP</span></span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Footer Branding */}
                     <div className="p-16 flex justify-between items-center bg-slate-50 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                        <span>Thank you for choosing DTX Group Egypt</span>
                        <span className="text-primary opacity-20 italic">Validated Ledger Copy</span>
                     </div>
                  </div>
                  {/* --- ACTUAL BRANDED INVOICE END --- */}
                  
                  <div className="max-w-3xl mx-auto mt-12 mb-12 flex items-center gap-6 p-8 bg-white/50 rounded-[35px] border border-white">
                     <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center">
                        <Mail size={24} />
                     </div>
                     <div className="flex-1">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Direct Dispatch</p>
                        <p className="text-[10px] font-medium text-slate-400 italic mt-0.5">Push this document as a PDF attachment to the client's registered email.</p>
                     </div>
                     <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:scale-105 transition-all">
                        SEND TO CLIENT
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

export default Invoices;
