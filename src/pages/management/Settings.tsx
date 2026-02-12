import React, { useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  Mail, 
  Percent, 
  Search, 
  ChevronRight, 
  Pencil, 
  Trash, 
  Lock, 
  Key, 
  Zap, 
  Globe, 
  Save, 
  History, 
  MoreVertical, 
  X, 
  PlusCircle, 
  Info,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ExternalLink,
  Settings2,
  Server,
  CloudLightning,
  ArrowRight,
  ArrowDown
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// --- Types ---

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "Main Admin" | "Manager" | "Technician" | "Accountant";
  permissions: string[];
  lastActive: string;
  isMainAdmin: boolean;
}

interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: string;
  status: "Success" | "Warning" | "Error";
}

// --- Mock Data ---

const initialUsers: SystemUser[] = [
  {
    id: "U-1",
    name: "Factory Owner (Main)",
    email: "owner@dtxprinting.com",
    role: "Main Admin",
    permissions: ["Full Access"],
    lastActive: "Just now",
    isMainAdmin: true
  },
  {
    id: "U-2",
    name: "Financial Manager",
    email: "finance@dtxprinting.com",
    role: "Accountant",
    permissions: ["Financials", "Invoices", "Expenses"],
    lastActive: "2h ago",
    isMainAdmin: false
  }
];

const mockLogs: SystemLog[] = [
  {
    id: "LOG-9901",
    userId: "U-1",
    userName: "Factory Owner",
    action: "Order Confirmation",
    resource: "ORD-9901",
    timestamp: "2024-02-12 11:35:10",
    status: "Success"
  },
  {
    id: "LOG-9902",
    userId: "U-2",
    userName: "Financial Manager",
    action: "Expense Revocation",
    resource: "EXP-105",
    timestamp: "2024-02-12 11:20:45",
    status: "Warning"
  }
];

const ControlCenter = () => {
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [logs] = useState<SystemLog[]>(mockLogs);
  const [activeTab, setActiveTab] = useState("users");
  
  // UI State
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Control <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Vault</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">Advanced system orchestration, user permissions, and live activity audit logs.</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 border border-slate-100 rounded-full shadow-sm">
             <div className="flex items-center gap-2 px-6 py-2 border-r border-slate-100">
                <Server size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-slate-400">Node Status: <span className="text-emerald-500">OPTIMAL</span></span>
             </div>
             <div className="flex items-center gap-2 px-6 py-2">
                <CloudLightning size={14} className="text-accent" />
                <span className="text-[10px] font-black uppercase text-slate-400">Sync: <span className="text-accent">LIVE</span></span>
             </div>
          </div>
        </div>

        {/* Global Tabs */}
        <Tabs defaultValue="users" onValueChange={setActiveTab} className="space-y-10">
           <TabsList className="bg-white p-2 rounded-full border border-slate-100 w-fit h-auto flex flex-wrap">
              {[
                { id: "users", label: "User Management", icon: Users },
                { id: "logs", label: "Live System Logs", icon: Activity },
                { id: "config", label: "Global Configuration", icon: Settings2 },
                { id: "integrations", label: "Tax Authority Push", icon: Zap }
              ].map(tab => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  className="px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                   <tab.icon size={16} /> {tab.label}
                </TabsTrigger>
              ))}
           </TabsList>

           {/* User Management Content */}
           <TabsContent value="users" className="m-0 space-y-8 animate-fade-in">
              <div className="flex justify-between items-center bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm">
                 <div className="space-y-1 pl-4">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">Privileged Personnel</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">Manage RBAC (Role Based Access Control) levels.</p>
                 </div>
                 <button 
                   onClick={() => setIsUserSheetOpen(true)}
                   className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                 >
                    <PlusCircle size={20} /> Deploy Access
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {users.map(user => (
                   <div key={user.id} className="bg-white rounded-[45px] border border-slate-100 shadow-sm p-10 group relative transition-all hover:border-primary/20">
                      <div className="flex justify-between items-start mb-8">
                         <div className={cn(
                           "w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl",
                           user.isMainAdmin ? "bg-slate-900" : "bg-accent"
                         )}>
                            {user.isMainAdmin ? <ShieldCheck size={32} /> : <Lock size={32} />}
                         </div>
                         {user.isMainAdmin ? (
                            <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-full uppercase tracking-widest">Master User</span>
                         ) : (
                            <DropdownMenu>
                               <DropdownMenuTrigger className="p-2 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20} className="text-slate-300" /></DropdownMenuTrigger>
                               <DropdownMenuContent className="rounded-2xl border-slate-100 p-2 shadow-2xl">
                                  <DropdownMenuItem className="rounded-xl font-black text-[10px] uppercase tracking-widest text-primary p-3">Modify Permissions</DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-xl font-black text-[10px] uppercase tracking-widest text-red-500 p-3">Revoke Vault Access</DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                         )}
                      </div>

                      <div className="space-y-1">
                         <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{user.name}</h4>
                         <p className="text-xs font-bold text-slate-400 italic">"{user.email}"</p>
                      </div>

                      <div className="mt-8 pt-8 border-t border-slate-50 space-y-6">
                         <div className="flex flex-wrap gap-2">
                            {user.permissions.map((p, i) => (
                              <span key={i} className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 text-slate-400 rounded-lg border border-slate-100">
                                 {p}
                              </span>
                            ))}
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            <History size={14} /> Last seen {user.lastActive}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </TabsContent>

           {/* Live System Logs Content */}
           <TabsContent value="logs" className="m-0 animate-fade-in">
              <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                 <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                       <Activity size={20} className="text-primary" />
                       <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Activity Feed</h3>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input 
                            type="text" 
                            placeholder="Search logs..." 
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/5 transition-all w-64"
                          />
                       </div>
                       <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all shadow-sm">
                          <Settings2 size={16} />
                       </button>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {logs.map(log => (
                      <div key={log.id} className="flex gap-6 items-start p-6 bg-slate-50/50 rounded-2xl group border border-transparent hover:border-slate-200 transition-all hover:bg-white hover:shadow-sm">
                         <div className={cn(
                           "w-2 h-2 rounded-full mt-2",
                           log.status === "Success" ? "bg-emerald-500" : 
                           log.status === "Warning" ? "bg-amber-500" : "bg-red-500"
                         )}></div>
                         
                         <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                               <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{log.action}</h4>
                               <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">{log.timestamp}</span>
                            </div>
                            
                            <p className="text-xs text-slate-500 font-medium">
                               Executed by <span className="text-primary font-bold">{log.userName}</span> on resource <span className="font-mono text-slate-700 bg-slate-100 px-1 rounded">{log.resource}</span>
                            </p>
                            
                            <div className="pt-2 flex items-center gap-2">
                               <span className={cn(
                                 "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border",
                                 log.status === "Success" ? "text-emerald-600 border-emerald-100 bg-emerald-50" : 
                                 log.status === "Warning" ? "text-amber-600 border-amber-100 bg-amber-50" : "text-red-600 border-red-100 bg-red-50"
                               )}>{log.status}</span>
                            </div>
                         </div>
                         
                         <button className="text-slate-300 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                            <ExternalLink size={16} />
                         </button>
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-center p-8 opacity-50">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">End of live feed</span>
                    </div>
                 </div>
              </div>
           </TabsContent>

           {/* Global Configuration Content */}
           <TabsContent value="config" className="m-0 animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm space-y-12">
                 <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[20px] flex items-center justify-center">
                       <Mail size={24} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Custom Branding Emails</h4>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure name@dtxprinting.com communication.</p>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Gateway / Relay</label>
                       <input className="w-full bg-slate-50 border-none px-6 py-5 rounded-3xl text-sm font-black focus:ring-4 focus:ring-accent/5 focus:bg-white transition-all outline-none" defaultValue="smtp.dtxprinting.com" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default "From" Identity</label>
                       <input className="w-full bg-slate-50 border-none px-6 py-5 rounded-3xl text-sm font-black focus:ring-4 focus:ring-accent/5 focus:bg-white transition-all outline-none" defaultValue="DTX Systems <automation@dtxprinting.com>" />
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-4 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-6 opacity-5 grayscale group-hover:scale-110 transition-all duration-700">
                          <Globe size={100} />
                       </div>
                       <h6 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 relative z-10"><CheckCircle2 size={14} className="text-emerald-500" /> Digital Identity Optimal</h6>
                       <p className="text-xs font-medium text-slate-400 leading-relaxed pr-10 relative z-10 italic">DTX Custom emails are verified and secured via DKIM/SPF protocols for maximum inbox reliability.</p>
                       <button className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest mt-4 relative z-10 flex items-center gap-1 leading-none">Test Mailer Core <ArrowRight size={14} /></button>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm space-y-12">
                 <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-[20px] flex items-center justify-center">
                       <Percent size={24} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Fiscal Tax Engines</h4>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure VAT & Fiscal settlement parameters.</p>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[40px] text-white">
                       <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">VAT Percentage (EGY)</p>
                          <p className="text-3xl font-black text-white">14.0%</p>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <div className="w-14 h-8 bg-emerald-500/20 rounded-full flex items-center px-1 group cursor-pointer border border-emerald-500/50">
                             <div className="w-6 h-6 bg-emerald-500 rounded-full translate-x-6"></div>
                          </div>
                          <span className="text-[9px] font-black uppercase text-emerald-400">ACTIVE GLOBAL</span>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Tax Breakdown</label>
                       <div className="space-y-3">
                          {[
                            { label: "Printing Production", rates: "14%", icon: FileCode },
                            { label: "Custom Design Services", rates: "14%", icon: FileCode },
                            { label: "Logistics", rates: "0% (Exempt)", icon: FileCode }
                          ].map((tax, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-amber-200 transition-all cursor-pointer">
                               <div className="flex items-center gap-3">
                                  <tax.icon size={16} className="text-amber-500" />
                                  <span className="text-[11px] font-black text-slate-700 uppercase">{tax.label}</span>
                               </div>
                               <span className="text-xs font-black text-slate-900">{tax.rates}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </TabsContent>

           {/* Tax Authority Integration Content */}
           <TabsContent value="integrations" className="m-0 animate-fade-in">
              <div className="bg-white p-16 rounded-[60px] border-2 border-slate-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center space-y-10">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-primary to-accent"></div>
                 
                 <div className="w-32 h-32 bg-slate-900 text-white rounded-[50px] shadow-3xl shadow-slate-200 flex items-center justify-center transform hover:scale-110 transition-transform duration-700">
                    <Zap size={64} className="text-emerald-400" />
                 </div>

                 <div className="space-y-4 max-w-2xl">
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic">ETA <span className="text-primary not-italic underline decoration-accent decoration-8 underline-offset-8">DIRECT SYNC</span></h2>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed uppercase tracking-widest font-black italic">Egypt's Tax Authority / Electronic Invoicing Gateway</p>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed px-10 pt-4">
                       Automate B2B invoice submissions to the Egyptian e-invoice portal. 
                       This integration establishes a secure cryptographic bridge between DTX Printing Center and the Tax Authority API.
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl pt-10">
                    <div className="p-8 bg-slate-50 rounded-[40px] space-y-4 text-left border border-slate-100 hover:border-emerald-500/30 transition-all group">
                       <CheckCircle2 size={24} className="text-emerald-500 group-hover:scale-125 transition-transform" />
                       <h5 className="font-black text-xs text-slate-900 uppercase tracking-widest">Auto-Push B2B</h5>
                       <p className="text-[10px] text-slate-400 font-medium">Automatic delivery of electronic invoices for corporate clients.</p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[40px] space-y-4 text-left border border-slate-100 hover:border-emerald-500/30 transition-all group">
                       <CheckCircle2 size={24} className="text-emerald-500 group-hover:scale-125 transition-transform" />
                       <h5 className="font-black text-xs text-slate-900 uppercase tracking-widest">Crypto Signing</h5>
                       <p className="text-[10px] text-slate-400 font-medium">Hardware security module (HSM) support for legal validation.</p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[40px] space-y-4 text-left border border-slate-100 hover:border-emerald-500/30 transition-all group">
                       <CheckCircle2 size={24} className="text-emerald-500 group-hover:scale-125 transition-transform" />
                       <h5 className="font-black text-xs text-slate-900 uppercase tracking-widest">Portal Archive</h5>
                       <p className="text-[10px] text-slate-400 font-medium">Live sync status and response logs for every submission.</p>
                    </div>
                 </div>

                 <button className="px-16 py-6 bg-slate-900 text-white rounded-[30px] font-black text-xs tracking-widest uppercase shadow-2xl hover:bg-emerald-600 transition-all flex items-center gap-3">
                    <Save size={20} /> Initialize Gate Integration
                 </button>
              </div>
           </TabsContent>
        </Tabs>
      </div>

      {/* Side Sheets for User Management will be implemented here */}

      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </ManagementLayout>
  );
};

export default ControlCenter;
