import React, { useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Phone, 
  Mail, 
  CreditCard, 
  History, 
  FileText, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  User,
  ExternalLink,
  ChevronRight,
  Banknote,
  X,
  Check,
  Download,
  AlertCircle,
  TrendingUp,
  Receipt,
  RotateCcw,
  PlusCircle,
  Truck,
  Pencil,
  Trash
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
interface SupplierTransaction {
  id: string;
  date: string;
  type: 'Purchase' | 'Payment' | 'Refund';
  amount: number;
  reference: string;
  status: 'Reconciled' | 'Pending';
}

interface Supplier {
  id: string;
  companyName: string;
  taxNo: string;
  contactPerson: string;
  email: string;
  phone: string;
  balance: number; // Positive = we owe them
  totalPurchases: number;
  lastOrderDate: string;
  category: string;
  transactions: SupplierTransaction[];
}

// --- Mock Data ---
const initialSuppliers: Supplier[] = [
  {
    id: "S1",
    companyName: "Textile Pro Egypt",
    taxNo: "123-456-789",
    contactPerson: "Mohamed Ali",
    email: "m.ali@textilepro.eg",
    phone: "+20 120 444 5555",
    balance: 45000,
    totalPurchases: 250000,
    lastOrderDate: "2024-02-10",
    category: "Raw Fabrics",
    transactions: [
      { id: "TX-901", date: "2024-02-10", type: "Purchase", amount: 15000, reference: "INV-2024-05", status: "Reconciled" },
      { id: "TX-899", date: "2024-02-05", type: "Payment", amount: 20000, reference: "PAY-DTX-44", status: "Reconciled" },
    ]
  },
  {
    id: "S2",
    companyName: "Ink & Color Chemicals",
    taxNo: "987-654-321",
    contactPerson: "Laila Hassan",
    email: "laila@inkcolor.com",
    phone: "+20 100 888 9999",
    balance: 0,
    totalPurchases: 85000,
    lastOrderDate: "2024-01-25",
    category: "Dyes & Inks",
    transactions: [
      { id: "TX-750", date: "2024-01-25", type: "Payment", amount: 5000, reference: "SETTLE-JAN", status: "Reconciled" }
    ]
  },
  {
    id: "S3",
    companyName: "Machine Tech Solutions",
    taxNo: "456-789-123",
    contactPerson: "Ibrahim Reda",
    email: "i.reda@machinetech.net",
    phone: "+20 111 222 3333",
    balance: -5000, // Prepaid
    totalPurchases: 1200000,
    lastOrderDate: "2024-02-05",
    category: "Maintenance",
    transactions: [
      { id: "TX-1004", date: "2024-02-05", type: "Payment", amount: 5000, reference: "PRE-MAINT", status: "Pending" }
    ]
  }
];

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    category: "Raw Fabrics",
    balance: 0,
    totalPurchases: 0
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.companyName || !newSupplier.contactPerson) return;

    const supplierToAdd: Supplier = {
      ...newSupplier as Supplier,
      id: `S${Math.floor(Math.random() * 1000)}`,
      transactions: [],
      lastOrderDate: new Date().toISOString().split('T')[0],
      totalPurchases: 0,
      balance: 0
    };

    setSuppliers([supplierToAdd, ...suppliers]);
    setIsAddSheetOpen(false);
    setNewSupplier({ category: "Raw Fabrics", balance: 0, totalPurchases: 0 });
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayables = suppliers.reduce((acc, s) => acc + (s.balance > 0 ? s.balance : 0), 0);

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Supplier <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Intelligence</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">Coordinate logistics and financial settlements with your {suppliers.length} active providers.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search providers..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[20px] shadow-sm text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => setIsAddSheetOpen(true)}
                className="bg-primary text-white p-4 md:px-8 rounded-[20px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <PlusCircle size={20} />
                <span className="hidden md:inline uppercase">Add Supplier</span>
             </button>
          </div>
        </div>

        {/* Global Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center">
                <AlertCircle size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Accounts Payable</p>
                <p className="text-3xl font-black text-red-600 tracking-tight">{totalPayables.toLocaleString()} <span className="text-sm">EGP</span></p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-50 text-primary rounded-3xl flex items-center justify-center">
                <TrendingUp size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Purchase Volume</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">1.5M <span className="text-sm">EGP</span></p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
                <RotateCcw size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prepaid Balance</p>
                <p className="text-3xl font-black text-emerald-600 tracking-tight">5,000 <span className="text-sm">EGP</span></p>
              </div>
           </div>
        </div>

        {/* Suppliers List Table */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center">
             <h3 className="font-heading font-black text-2xl text-slate-900 tracking-tight uppercase">Provider Directory</h3>
             <button className="flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-widest">
                <Download size={16} /> Export DB
             </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company & Tax Details</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Information</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Balance</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
                  <th className="px-10 py-5"></th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr 
                    key={supplier.id} 
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setIsDetailSheetOpen(true);
                    }}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-all group cursor-pointer"
                  >
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-900 text-white rounded-[24px] flex items-center justify-center text-xl font-black shadow-lg shadow-slate-200 group-hover:bg-primary transition-colors">
                          {supplier.companyName[0]}
                        </div>
                        <div>
                          <p className="font-heading font-black text-xl text-slate-900 group-hover:text-primary transition-colors uppercase">{supplier.companyName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                            <FileText size={12} className="text-accent" /> Tax No: {supplier.taxNo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="space-y-1.5">
                        <p className="text-sm font-black text-slate-700 flex items-center gap-2">
                          <User size={14} className="text-primary" /> {supplier.contactPerson}
                        </p>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                          <Phone size={14} className="text-slate-300" /> {supplier.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="space-y-1">
                        <p className={cn(
                          "text-xl font-black tracking-tighter",
                          supplier.balance > 0 ? "text-red-500" : supplier.balance < 0 ? "text-emerald-500" : "text-slate-300"
                        )}>
                          {supplier.balance === 0 ? "CLEAR" : `${Math.abs(supplier.balance).toLocaleString()} EGP`}
                        </p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                          {supplier.balance > 0 ? "UNSETTLED OWINGS" : supplier.balance < 0 ? "ADVANCE PAYMENT" : "NO DUES"}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-900">{supplier.lastOrderDate}</p>
                        <span className="inline-block px-3 py-1 bg-primary/5 text-primary text-[9px] font-black rounded-full uppercase">
                          {supplier.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                       <button className="p-3 hover:bg-white hover:shadow-md rounded-xl text-slate-300 hover:text-primary transition-all">
                          <ChevronRight size={20} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- ADD SUPPLIER SHEET --- */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 border-none flex flex-col bg-white">
          <div className="bg-slate-900 p-12 text-white relative">
             <div className="absolute top-0 right-0 p-10 opacity-10">
                <Building2 size={120} />
             </div>
             <SheetHeader>
                <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-white">Register Provider</SheetTitle>
                <SheetDescription className="text-slate-400 font-bold text-sm">Add a new commercial provider to your supply chain database.</SheetDescription>
             </SheetHeader>
          </div>

          <form onSubmit={handleAddSupplier} className="flex-1 overflow-y-auto p-12 space-y-10">
             <div className="space-y-8">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Business Identity</h4>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Company Legal Name</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        placeholder="Ex: Nile Textile Mills"
                        value={newSupplier.companyName || ''}
                        onChange={e => setNewSupplier({...newSupplier, companyName: e.target.value})}
                      />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tax Registration ID</label>
                         <input 
                           required
                           className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                           placeholder="999-999-999"
                           value={newSupplier.taxNo || ''}
                           onChange={e => setNewSupplier({...newSupplier, taxNo: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Provider Category</label>
                         <select 
                           className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none"
                           value={newSupplier.category}
                           onChange={e => setNewSupplier({...newSupplier, category: e.target.value})}
                         >
                            <option>Raw Fabrics</option>
                            <option>Dyes & Inks</option>
                            <option>Packaging</option>
                            <option>Machinery</option>
                            <option>Maintenance</option>
                         </select>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-8 pt-6">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Point of Contact</h4>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Representative Name</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        placeholder="John Doe"
                        value={newSupplier.contactPerson || ''}
                        onChange={e => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Work Email</label>
                         <input 
                           type="email"
                           className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                           placeholder="j.doe@company.com"
                           value={newSupplier.email || ''}
                           onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Direct Phone</label>
                         <input 
                           className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                           placeholder="+20 1..."
                           value={newSupplier.phone || ''}
                           onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                         />
                      </div>
                   </div>
                </div>
             </div>
          </form>

          <div className="p-10 border-t border-slate-50 flex gap-4">
             <button 
               onClick={() => setIsAddSheetOpen(false)}
               className="flex-1 py-5 border-2 border-slate-100 rounded-[22px] font-black text-xs text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest"
             >
               Discard
             </button>
             <button 
               onClick={handleAddSupplier}
               className="flex-[2] py-5 bg-primary text-white rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase"
             >
               Commit Provider
             </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* --- SUPPLIER DETAIL SHEET --- */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-4xl p-0 border-none flex flex-col bg-slate-50">
          {selectedSupplier && (
            <>
              <div className="bg-white p-12 border-b border-slate-100 relative">
                 <button 
                    onClick={() => setIsDetailSheetOpen(false)}
                    className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-300"
                 >
                    <X size={24} />
                 </button>

                 <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <div className="w-32 h-32 bg-slate-900 text-white rounded-[45px] flex items-center justify-center text-5xl font-black shadow-2xl shadow-slate-200">
                       {selectedSupplier.companyName[0]}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left space-y-4">
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{selectedSupplier.companyName}</h2>
                          <span className="px-5 py-2 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
                             {selectedSupplier.category}
                          </span>
                       </div>
                       
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 font-bold text-sm text-slate-400">
                          <div className="flex items-center gap-2 uppercase tracking-tighter">
                             <FileText size={16} className="text-accent" /> Tax: {selectedSupplier.taxNo}
                          </div>
                          <div className="flex items-center gap-2 uppercase tracking-tighter">
                             <User size={16} className="text-primary" /> {selectedSupplier.contactPerson}
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-2">
                       <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all">
                          <Pencil size={20} />
                       </button>
                       <button className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                          <Trash size={20} />
                       </button>
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12">
                 <Tabs defaultValue="balance" className="space-y-10">
                    <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start gap-12 rounded-none h-auto p-0">
                       <TabsTrigger value="balance" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-5 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Statement & Balance</TabsTrigger>
                       <TabsTrigger value="transactions" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-5 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Ledger History</TabsTrigger>
                       <TabsTrigger value="logistics" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-5 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Supply Chain</TabsTrigger>
                    </TabsList>

                    <TabsContent value="balance" className="space-y-10 animate-fade-in-up">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Banknote size={100} />
                             </div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Liability</p>
                             <h4 className={cn(
                               "text-6xl font-black tracking-tighter",
                               selectedSupplier.balance > 0 ? "text-red-500" : "text-emerald-500"
                             )}>
                                {Math.abs(selectedSupplier.balance).toLocaleString()} <span className="text-xl">EGP</span>
                             </h4>
                             <p className="text-xs font-bold text-slate-400 mt-4 leading-relaxed">
                                {selectedSupplier.balance > 0 
                                  ? "This amount is overdue or pending settlement from DTX." 
                                  : "Account shows a credit surplus. Available for future orders."}
                             </p>
                             
                             <div className="mt-10 pt-8 border-t border-slate-50 flex gap-4">
                                <button className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-xs tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2">
                                   ISSUE PAYMENT <Check size={18} />
                                </button>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6">
                             <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-4 mb-2">
                                   <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center">
                                      <Receipt size={18} />
                                   </div>
                                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Lifetime purchases</p>
                                </div>
                                <p className="text-3xl font-black text-slate-900">{selectedSupplier.totalPurchases.toLocaleString()} EGP</p>
                             </div>
                             <div className="bg-slate-900 p-8 rounded-[35px] text-white">
                                <div className="flex items-center gap-4 mb-2">
                                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                      <TrendingUp size={18} className="text-emerald-400" />
                                   </div>
                                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Trade Reliability</p>
                                </div>
                                <p className="text-3xl font-black italic tracking-tighter">Tier 1 Provider</p>
                             </div>
                          </div>
                       </div>
                    </TabsContent>

                    <TabsContent value="transactions" className="space-y-6 animate-fade-in-up">
                       <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                          <table className="w-full text-left">
                             <thead>
                                <tr className="bg-slate-50">
                                   <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">TX Reference</th>
                                   <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                   <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction Type</th>
                                   <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                   <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit Status</th>
                                </tr>
                             </thead>
                             <tbody>
                                {selectedSupplier.transactions.map((t) => (
                                   <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                      <td className="px-8 py-6 text-xs font-black text-slate-900">{t.id}</td>
                                      <td className="px-8 py-6 text-xs font-bold text-slate-500">{t.date}</td>
                                      <td className="px-8 py-6">
                                         <span className={cn(
                                           "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                           t.type === 'Payment' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-primary border-blue-100"
                                         )}>
                                            {t.type}
                                         </span>
                                      </td>
                                      <td className="px-8 py-6 font-black text-slate-900">{t.amount.toLocaleString()} EGP</td>
                                      <td className="px-8 py-6">
                                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                            {t.status === 'Reconciled' ? (
                                              <><Check size={14} className="text-emerald-500" /> Reconciled</>
                                            ) : (
                                              <><RotateCcw size={14} className="text-accent animate-spin-slow" /> Pending Audit</>
                                            )}
                                         </div>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </TabsContent>

                    <TabsContent value="logistics" className="animate-fade-in-up">
                       <div className="bg-white p-12 rounded-[45px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10">
                          <div className="w-24 h-24 bg-slate-50 rounded-[35px] flex items-center justify-center text-primary group hover:bg-primary transition-all">
                             <Truck size={40} className="group-hover:text-white" />
                          </div>
                          <div className="flex-1 space-y-2">
                             <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Supply Fulfillment</h4>
                             <p className="text-slate-400 text-sm leading-relaxed max-w-md font-medium">Coordinate logistics, view shipping manifests and manage lead times for this provider.</p>
                          </div>
                          <button className="px-10 py-5 bg-white border-2 border-slate-100 rounded-2xl font-black text-xs tracking-widest text-slate-400 hover:text-primary hover:border-primary transition-all uppercase">
                             Open Logistics Portal
                          </button>
                       </div>
                    </TabsContent>
                 </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </ManagementLayout>
  );
};

export default Suppliers;
