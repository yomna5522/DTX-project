import React, { useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Building2, 
  Phone, 
  Mail, 
  CreditCard, 
  History, 
  Cloud, 
  Layers, 
  ShieldAlert, 
  Pencil, 
  Trash, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  X,
  Check,
  UserPlus,
  ArrowLeft,
  Calendar,
  Lock,
  Download,
  Share2,
  PackageCheck
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

// --- Types ---
type CustomerType = 'Regular' | 'One-Time';
type CustomerStatus = 'Active' | 'Suspended';

interface Transaction {
  id: string;
  date: string;
  type: 'Payment' | 'Order' | 'Refund';
  amount: number;
  description: string;
  status: 'Completed' | 'Pending';
}

interface CustomerMaterial {
  id: string;
  name: string;
  quantity: string;
  lastUpdated: string;
  status: 'Low' | 'In Stock';
}

interface DesignFile {
  id: string;
  name: string;
  format: string;
  uploadDate: string;
  size: string;
}

interface Customer {
  id: string;
  name: string;
  age?: number;
  company: string;
  email: string;
  phone: string;
  type: CustomerType;
  balance: number;
  totalOrders: number;
  status: CustomerStatus;
  avatar?: string;
  designsCount: number;
  materialsCount: number;
  transactions: Transaction[];
  materials: CustomerMaterial[];
  designs: DesignFile[];
}

// --- Mock Data ---
const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "Ahmed Mansour",
    age: 34,
    company: "Moda Fashion Hub",
    email: "ahmed@modahub.com",
    phone: "+20 122 345 6789",
    type: "Regular",
    balance: -12500, // Due amount
    totalOrders: 42,
    status: "Active",
    designsCount: 15,
    materialsCount: 3,
    transactions: [
      { id: "T1", date: "2024-02-10", type: "Order", amount: 5000, description: "Summer Collection Print", status: "Completed" },
      { id: "T2", date: "2024-02-05", type: "Payment", amount: 10000, description: "Bulk Settlement", status: "Completed" },
      { id: "T3", date: "2024-01-20", type: "Order", amount: 17500, description: "Branding Material Print", status: "Completed" },
    ],
    materials: [
      { id: "M1", name: "Cotton Twill - Navy", quantity: "45m", lastUpdated: "2h ago", status: "In Stock" },
      { id: "M2", name: "Linen White", quantity: "12m", lastUpdated: "Yesterday", status: "Low" }
    ],
    designs: [
      { id: "D1", name: "Summer_Vortex_Final", format: "AI", uploadDate: "2024-01-15", size: "24MB" },
      { id: "D2", name: "Logo_Vector_HighRes", format: "PDF", uploadDate: "2023-12-01", size: "5.2MB" }
    ]
  },
  {
    id: "2",
    name: "Sarah Ibrahim",
    age: 28,
    company: "Personal Designs",
    email: "sarah.i@outlook.com",
    phone: "+20 100 111 2222",
    type: "One-Time",
    balance: 0,
    totalOrders: 1,
    status: "Active",
    designsCount: 2,
    materialsCount: 0,
    transactions: [
      { id: "T4", date: "2024-02-01", type: "Order", amount: 1200, description: "One-Time Custom Hoodie", status: "Completed" },
      { id: "T5", date: "2024-02-01", type: "Payment", amount: 1200, description: "Upfront Payment", status: "Completed" }
    ],
    materials: [],
    designs: [
      { id: "D3", name: "Sarah_Hoodie_Back", format: "PNG", uploadDate: "2024-02-01", size: "1.2MB" }
    ]
  }
];

// --- Components ---

const CustomerAvatar = ({ name, avatar, size = "md" }: { name: string, avatar?: string, size?: "sm" | "md" | "lg" | "xl" }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl"
  };

  if (avatar) {
    return (
      <div className={cn("rounded-[22px] overflow-hidden border-4 border-white shadow-xl", sizeClasses[size])}>
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-[22px] flex items-center justify-center font-black border-4 border-white shadow-xl",
      "bg-gradient-to-br from-primary to-primary-foreground text-white",
      sizeClasses[size]
    )}>
      {initials}
    </div>
  );
};

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<CustomerType | 'All'>('All');
  
  // UI State
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    type: 'Regular',
    status: 'Active',
    balance: 0,
    totalOrders: 0,
    designsCount: 0,
    materialsCount: 0
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.email) return;

    const customerToAdd: Customer = {
      ...newCustomer as Customer,
      id: Math.random().toString(36).substr(2, 9),
      transactions: [],
      materials: [],
      designs: [],
      totalOrders: 0,
      balance: 0,
      designsCount: 0,
      materialsCount: 0
    };

    setCustomers([customerToAdd, ...customers]);
    setIsAddSheetOpen(false);
    setNewCustomer({ type: 'Regular', status: 'Active' });
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || c.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalDues = customers.reduce((acc, c) => acc + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Top Header - Action Bar */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Customer <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Database</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">Manage accounts, materials, and cloud storage for 124 clients.</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search clients..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[20px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => setIsAddSheetOpen(true)}
                className="bg-primary text-white p-4 lg:px-8 rounded-[20px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                <span className="hidden lg:inline">NEW CUSTOMER</span>
             </button>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Portfolio Growth</p>
                <p className="text-2xl font-black text-slate-900">+12.5%</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-red-50 text-accent rounded-2xl flex items-center justify-center">
                <AlertCircle size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Outstanding Dues</p>
                <p className="text-2xl font-black text-red-600">{totalDues.toLocaleString()} EGP</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <PackageCheck size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">On-Site Materials</p>
                <p className="text-2xl font-black text-slate-900">142 Rolls</p>
              </div>
           </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-4">
           <div className="flex bg-slate-100/50 p-1.5 rounded-[22px] border border-slate-200/50">
              {['All', 'Regular', 'One-Time'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as any)}
                  className={cn(
                    "px-6 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all",
                    selectedType === type 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-slate-500 hover:text-primary hover:bg-white/50"
                  )}
                >
                  {type}
                </button>
              ))}
           </div>
        </div>

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {filteredCustomers.map((customer) => (
              <div 
                key={customer.id}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setIsDetailSheetOpen(true);
                }}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-accent/5 transition-colors"></div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                   <CustomerAvatar name={customer.name} avatar={customer.avatar} size="lg" />
                   <div className="flex flex-col items-end gap-2">
                       <span className={cn(
                         "px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.15em] uppercase border",
                         customer.type === 'Regular' ? "bg-primary/5 text-primary border-primary/10" : "bg-accent/5 text-accent border-accent/10"
                       )}>
                         {customer.type}
                       </span>
                       {customer.status === 'Suspended' && (
                         <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold">
                            <ShieldAlert size={12} /> SUSPENDED
                         </span>
                       )}
                   </div>
                </div>

                <div className="space-y-2 mb-8 relative z-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors uppercase">{customer.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tight">
                    <Building2 size={14} className="text-primary" /> {customer.company}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">A/C BALANCE</p>
                    <p className={cn(
                      "text-lg font-black tracking-tight",
                      customer.balance < 0 ? "text-red-500" : "text-emerald-500"
                    )}>
                      {customer.balance === 0 ? "SETTLED" : `${Math.abs(customer.balance).toLocaleString()} EGP`}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ENGAGEMENT</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight">{customer.totalOrders} ORDERS</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 relative z-10">
                   <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                          <Cloud size={14} className="text-slate-300" />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                        +{customer.designsCount}
                      </div>
                   </div>
                   <button className="flex items-center gap-2 text-[11px] font-black text-primary group/btn">
                      VIEW PROFILE <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
           ))}

           {/* Add Placeholder Card */}
           <div 
             onClick={() => setIsAddSheetOpen(true)}
             className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-12 group cursor-pointer hover:border-primary/50 transition-all"
           >
              <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UserPlus size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Expand Portfolio</h3>
              <p className="text-slate-300 text-sm font-medium">Add a new business client</p>
           </div>
        </div>
      </div>

      {/* --- SIDE SHEETS --- */}

      {/* 1. Add/Edit Customer Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 overflow-hidden border-none flex flex-col">
          <div className="bg-primary p-12 text-white relative">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <UserPlus size={120} />
             </div>
             <SheetHeader>
                <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-white">Add New Client</SheetTitle>
                <SheetDescription className="text-white/60 font-medium text-sm">Create a fully integrated factory account for your customer.</SheetDescription>
             </SheetHeader>
          </div>

          <form onSubmit={handleAddCustomer} className="flex-1 overflow-y-auto p-12 space-y-8 bg-white">
             {/* Account Identity */}
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Account Identity</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">Full Name</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border-none px-5 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Ex: Ahmed Mansour"
                        value={newCustomer.name || ''}
                        onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">Company Name</label>
                      <input 
                        className="w-full bg-slate-50 border-none px-5 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Ex: Fashion Co."
                        value={newCustomer.company || ''}
                        onChange={e => setNewCustomer({...newCustomer, company: e.target.value})}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">Email Address</label>
                      <input 
                        required
                        type="email"
                        className="w-full bg-slate-50 border-none px-5 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="ahmed@domain.com"
                        value={newCustomer.email || ''}
                        onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">Age</label>
                      <input 
                        type="number"
                        className="w-full bg-slate-50 border-none px-5 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="30"
                        value={newCustomer.age || ''}
                        onChange={e => setNewCustomer({...newCustomer, age: parseInt(e.target.value)})}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500">Phone Number</label>
                   <input 
                     className="w-full bg-slate-50 border-none px-5 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                     placeholder="+20 123..."
                     value={newCustomer.phone || ''}
                     onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                   />
                </div>
             </div>

             {/* Account Configuration */}
             <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Configuration</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     type="button"
                     onClick={() => setNewCustomer({...newCustomer, type: 'Regular'})}
                     className={cn(
                       "p-6 rounded-3xl border-2 text-left transition-all",
                       newCustomer.type === 'Regular' ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                     )}
                   >
                     <p className="font-black text-primary text-sm uppercase mb-1">Regular</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">Recurrent Client. Supports Dues & Payments.</p>
                   </button>
                   <button 
                     type="button"
                     onClick={() => setNewCustomer({...newCustomer, type: 'One-Time'})}
                     className={cn(
                       "p-6 rounded-3xl border-2 text-left transition-all",
                       newCustomer.type === 'One-Time' ? "border-accent bg-accent/5 ring-4 ring-accent/5" : "border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                     )}
                   >
                     <p className="font-black text-accent text-sm uppercase mb-1">One-Time</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">Single Project. Pre-paid cycle only.</p>
                   </button>
                </div>
             </div>
          </form>

          <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex gap-4">
             <button 
               onClick={() => setIsAddSheetOpen(false)}
               className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-500 hover:bg-slate-100 transition-all"
             >
               CANCEL
             </button>
             <button 
               onClick={handleAddCustomer}
               className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs text-center tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
             >
               CREATE ACCOUNT
             </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 2. Customer Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-4xl p-0 overflow-hidden border-none flex flex-col bg-slate-50">
          {selectedCustomer && (
            <>
              {/* Profile Header */}
              <div className="bg-white p-12 relative border-b border-slate-100">
                <button 
                  onClick={() => setIsDetailSheetOpen(false)}
                  className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                   <CustomerAvatar name={selectedCustomer.name} avatar={selectedCustomer.avatar} size="xl" />
                   <div className="flex-1 text-center md:text-left space-y-4">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                         <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{selectedCustomer.name}</h2>
                         <span className={cn(
                           "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                           selectedCustomer.type === 'Regular' ? "bg-primary/5 text-primary border-primary/10" : "bg-accent/5 text-accent border-accent/10"
                         )}>
                           {selectedCustomer.type}
                         </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400 font-bold text-sm">
                         <div className="flex items-center gap-2 uppercase tracking-tight">
                            <Building2 size={16} className="text-primary" /> {selectedCustomer.company}
                         </div>
                         <div className="flex items-center gap-2 uppercase tracking-tight">
                            <Mail size={16} className="text-primary" /> {selectedCustomer.email}
                         </div>
                         <div className="flex items-center gap-2 uppercase tracking-tight">
                            <Phone size={16} className="text-primary" /> {selectedCustomer.phone}
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex gap-2">
                      <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm">
                        <Pencil size={20} />
                      </button>
                      <button className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                        <Trash size={20} />
                      </button>
                   </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex-1 overflow-y-auto px-12 py-8">
                <Tabs defaultValue="overview" className="space-y-8">
                  <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start gap-8 rounded-none h-auto p-0">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-4 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Overview</TabsTrigger>
                    <TabsTrigger value="transactions" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-4 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Transactions</TabsTrigger>
                    <TabsTrigger value="materials" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-4 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Materials</TabsTrigger>
                    <TabsTrigger value="cloud" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-4 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Cloud Designs</TabsTrigger>
                    <TabsTrigger value="access" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-4 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Access Mgmt</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-8 animate-fade-in-up">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {/* Balance Tile */}
                         <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                              <Banknote size={80} className="text-slate-900" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Account Balance</p>
                            <h4 className={cn(
                              "text-5xl font-black tracking-tighter",
                              selectedCustomer.balance < 0 ? "text-red-500" : "text-emerald-500"
                            )}>
                              {selectedCustomer.balance === 0 ? "0.00" : Math.abs(selectedCustomer.balance).toLocaleString()} <span className="text-xl">EGP</span>
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-2">
                              {selectedCustomer.balance < 0 ? "OUTSTANDING PAYABLES" : "ACCOUNT SETTLED"}
                            </p>
                            <button className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                              SETTLE PAYMENT <Check size={16} />
                            </button>
                         </div>

                         {/* Quick Stats Grid */}
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Orders</p>
                               <p className="text-2xl font-black text-slate-900">{selectedCustomer.totalOrders}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Stock Rolls</p>
                               <p className="text-2xl font-black text-slate-900">{selectedCustomer.materialsCount}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Designs</p>
                               <p className="text-2xl font-black text-slate-900">{selectedCustomer.designsCount}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm bg-primary/5 border-primary/10">
                               <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Reliability</p>
                               <p className="text-2xl font-black text-primary italic">Grade A</p>
                            </div>
                         </div>
                      </div>
                  </TabsContent>

                  <TabsContent value="transactions" className="space-y-4 animate-fade-in-up">
                      <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                         <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h4 className="font-heading font-black text-xl uppercase tracking-tight">Ledger History</h4>
                            <button className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
                               <Download size={14} /> EXPORT STATEMENT
                            </button>
                         </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                               <thead>
                                  <tr className="bg-slate-50">
                                     <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Ref ID</th>
                                     <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Date</th>
                                     <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Type</th>
                                     <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Description</th>
                                     <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Amount</th>
                                     <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Status</th>
                                  </tr>
                               </thead>
                               <tbody>
                                  {selectedCustomer.transactions.map((t) => (
                                     <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4 text-xs font-bold text-slate-400">#{t.id}</td>
                                        <td className="px-8 py-4 text-xs font-bold text-slate-600">{t.date}</td>
                                        <td className="px-8 py-4">
                                           <span className={cn(
                                             "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider",
                                             t.type === 'Payment' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-primary"
                                           )}>
                                              {t.type}
                                           </span>
                                        </td>
                                        <td className="px-8 py-4 text-xs font-medium text-slate-600">{t.description}</td>
                                        <td className="px-8 py-4 font-black text-slate-900">{t.amount.toLocaleString()} EGP</td>
                                        <td className="px-8 py-4">
                                           <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px]">
                                              <Check size={12} /> COMPLETED
                                           </div>
                                        </td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </div>
                  </TabsContent>

                  <TabsContent value="materials" className="space-y-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {selectedCustomer.materials.map((m) => (
                           <div key={m.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm group">
                              <div className="flex justify-between items-start mb-6">
                                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary transition-all group-hover:bg-primary group-hover:text-white">
                                    <Layers size={24} />
                                 </div>
                                 <span className={cn(
                                   "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                   m.status === 'Low' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                 )}>
                                   {m.status}
                                 </span>
                              </div>
                              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{m.name}</h4>
                              <p className="text-3xl font-black text-primary mb-4">{m.quantity}</p>
                              <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                                 <span>LAST UPDATED: {m.lastUpdated}</span>
                                 <button className="text-primary underline underline-offset-4 uppercase">View History</button>
                              </div>
                           </div>
                         ))}
                         
                         <button className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-slate-300 hover:border-primary/30 transition-all group">
                            <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-heading font-black text-sm uppercase">Add Stock Flow</p>
                         </button>
                      </div>
                  </TabsContent>

                  <TabsContent value="cloud" className="space-y-4 animate-fade-in-up">
                      <div className="bg-primary p-12 rounded-[40px] text-white relative overflow-hidden mb-8">
                         <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Share2 size={120} />
                         </div>
                         <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Sharing Link</h3>
                         <p className="text-white/60 text-sm max-w-sm mb-6">Give your customer access to upload their own design files directly to this cloud.</p>
                         <button className="bg-white text-primary px-8 py-4 rounded-xl font-black text-xs tracking-widest hover:scale-105 transition-all">
                            COPY ACCESS LINK
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {selectedCustomer.designs.map((d) => (
                           <div key={d.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                                   {d.format}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{d.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{d.uploadDate} • {d.size}</p>
                                 </div>
                              </div>
                              <button className="p-3 hover:bg-slate-50 rounded-lg text-slate-400">
                                 <Download size={18} />
                              </button>
                           </div>
                         ))}
                      </div>
                  </TabsContent>

                  <TabsContent value="access" className="space-y-10 animate-fade-in-up">
                      <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                         <div className="flex justify-between items-center">
                            <div>
                               <h4 className="font-black text-slate-900 uppercase">Portal Credentials</h4>
                               <p className="text-slate-400 text-xs font-medium mt-1">Manage client-side web portal login details.</p>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Linked</span>
                               <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-glow"></div>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Login Email</label>
                                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                     <Mail size={16} className="text-slate-300" />
                                     <span className="text-sm font-bold text-slate-900">{selectedCustomer.email}</span>
                                  </div>
                               </div>
                               <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase">
                                  <Pencil size={12} /> UPDATE AUTH EMAIL
                               </button>
                            </div>
                            <div className="space-y-4">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">Auth Password</label>
                                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                     <Lock size={16} className="text-slate-300" />
                                     <span className="text-sm font-bold text-slate-900">••••••••••••••</span>
                                  </div>
                               </div>
                               <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase">
                                  <Lock size={12} /> RESET SECURE PASS
                                </button>
                            </div>
                         </div>
                      </div>

                      <div className="bg-red-50/50 p-10 rounded-[32px] border border-red-100 space-y-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                               <ShieldAlert size={24} />
                            </div>
                            <div>
                               <h4 className="font-black text-red-900 uppercase tracking-tight">Restrict Account Access</h4>
                               <p className="text-red-700/60 text-xs font-medium">Suspending an account will disable their ability to place orders on the web-portal.</p>
                            </div>
                         </div>
                         
                         <div className="flex justify-end gap-3 pt-4">
                            <button className="bg-white border border-red-200 text-red-600 px-8 py-3 rounded-xl font-black text-[11px] tracking-widest hover:bg-red-600 hover:text-white transition-all">
                               SUSPEND PERMANENTLY
                            </button>
                            <button className="bg-red-600 text-white px-8 py-3 rounded-xl font-black text-[11px] tracking-widest shadow-lg shadow-red-200">
                               DISABLE PORTAL ONLY
                            </button>
                         </div>
                      </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sheet Footer Actions */}
              <div className="p-8 bg-white border-t border-slate-100 flex justify-between items-center relative z-20">
                 <div className="flex items-center gap-6">
                    <div>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ACCOUNT STATUS</p>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm font-black text-slate-900">HEALTHY</span>
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">LOYALTY</p>
                       <p className="text-sm font-black text-primary italic">2.4 YEARS</p>
                    </div>
                 </div>
                 <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    GENERATE AUDIT REPORT
                 </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Background Banknote Decor */}
      <style>{`
        .shadow-glow { box-shadow: 0 0 15px rgba(16, 185, 129, 0.5); }
        .decoration-accent { text-decoration-color: #EC1C24; }
      `}</style>

    </ManagementLayout>
  );
};

const Banknote = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

export default Customers;
