import React, { useState, useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  Briefcase, 
  Plus, 
  Search, 
  ChevronRight, 
  Pencil, 
  Trash, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Wallet, 
  TrendingUp, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  UserPlus, 
  Download, 
  Filter, 
  History, 
  Printer, 
  Stethoscope, 
  Plane, 
  ArrowRight,
  ChevronDown,
  X,
  CreditCard,
  Gift,
  AlertCircle,
  MoreVertical,
  Camera
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

interface Employee {
  id: string;
  name: string;
  age: number;
  role: string;
  contact: string;
  email: string;
  address: string;
  paygrade: number; // Base monthly salary
  bonus: number;
  deductions: number;
  attachments: string[];
  status: "Active" | "On Leave" | "Terminated";
  joinDate: string;
}

interface AttendanceRecord {
  employeeId: string;
  date: string;
  status: "Present" | "Absent" | "Late" | "Leave";
  checkIn?: string;
}

// --- Mock Data ---

const initialEmployees: Employee[] = [
  {
    id: "EMP-001",
    name: "Ahmed Hassan",
    age: 34,
    role: "Master Technician",
    contact: "+20 100 223 4455",
    email: "ahmed.h@dtxprinting.com",
    address: "October 6th City, Giza",
    paygrade: 12000,
    bonus: 1500,
    deductions: 0,
    attachments: ["national_id.pdf", "contract.pdf"],
    status: "Active",
    joinDate: "2022-01-15"
  },
  {
    id: "EMP-002",
    name: "Sarah Ibrahim",
    age: 28,
    role: "Creative Designer",
    contact: "+20 111 998 7766",
    email: "s.ibrahim@dtxprinting.com",
    address: "New Cairo, Egypt",
    paygrade: 15000,
    bonus: 0,
    deductions: 450,
    attachments: ["portfolio_cert.pdf"],
    status: "Active",
    joinDate: "2023-05-10"
  }
];

const mockAttendance: AttendanceRecord[] = [
  { employeeId: "EMP-001", date: "2024-02-12", status: "Present", checkIn: "08:15 AM" },
  { employeeId: "EMP-002", date: "2024-02-12", status: "Present", checkIn: "08:45 AM" }
];

const HRM = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [activeTab, setActiveTab] = useState("roster");
  const [searchTerm, setSearchTerm] = useState("");

  // UI State
  const [isEmpSheetOpen, setIsEmpSheetOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Human <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Capital</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">Manage factory workforce, payroll settlements, and daily attendance.</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Employee name or ID..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => {
                  setSelectedEmp(null);
                  setIsEmpSheetOpen(true);
                }}
                className="bg-primary text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 uppercase"
              >
                <UserPlus size={20} />
                <span className="hidden lg:inline">Onboard Talent</span>
             </button>
          </div>
        </div>

        {/* HR Dashboard Tabs */}
        <Tabs defaultValue="roster" onValueChange={setActiveTab} className="space-y-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <TabsList className="bg-white p-2 rounded-full border border-slate-100 w-fit h-auto flex flex-wrap">
                 {[
                   { id: "roster", label: "Workforce", icon: Users },
                   { id: "attendance", label: "Attendance Feed", icon: Clock },
                   { id: "payroll", label: "Payroll Forge", icon: Wallet },
                   { id: "leaves", label: "Leave Logs", icon: Plane }
                 ].map(tab => (
                   <TabsTrigger 
                     key={tab.id}
                     value={tab.id}
                     className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all flex items-center gap-2"
                   >
                     <tab.icon size={14} /> {tab.label}
                   </TabsTrigger>
                 ))}
              </TabsList>

              <div className="flex items-center gap-10">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Headcount</p>
                    <p className="text-2xl font-black text-slate-900">{employees.length}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payroll Cycle</p>
                    <p className="text-2xl font-black text-emerald-500">{employees.reduce((sum, e) => sum + e.paygrade, 0).toLocaleString()} <span className="text-xs">EGP</span></p>
                 </div>
              </div>
           </div>

           {/* Workforce Roster */}
           <TabsContent value="roster" className="m-0 space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {filteredEmployees.map(emp => (
                   <div 
                     key={emp.id}
                     onClick={() => {
                        setSelectedEmp(emp);
                        setIsDetailOpen(true);
                     }}
                     className="bg-white rounded-[45px] border border-slate-100 shadow-sm p-8 group hover:shadow-2xl hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden"
                   >
                      <div className="absolute top-0 right-0 p-8 opacity-5 grayscale group-hover:grayscale-0 transition-all">
                         <Briefcase size={80} />
                      </div>
                      
                      <div className="flex items-start gap-6 relative z-10">
                         <div className="w-20 h-20 rounded-[28px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 group-hover:scale-105 transition-transform">
                            <Camera size={24} />
                         </div>
                         <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{emp.name}</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{emp.role}</p>
                            <span className={cn(
                              "inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mt-2",
                              emp.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                            )}>
                               {emp.status}
                            </span>
                         </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-slate-50 space-y-4 relative z-10">
                         <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                            <Phone size={14} className="text-primary" /> {emp.contact}
                         </div>
                         <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                            <Calendar size={14} className="text-accent" /> Join: {emp.joinDate}
                         </div>
                      </div>
                   </div>
                 ))}
                 
                 <button 
                   onClick={() => setIsEmpSheetOpen(true)}
                   className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[45px] flex flex-col items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all group min-h-[250px]"
                 >
                    <Plus size={48} className="mb-4 group-hover:scale-110 transition-transform" />
                   <span className="text-xs font-black uppercase tracking-widest">New Hire Allocation</span>
                 </button>
              </div>
           </TabsContent>

           {/* Attendance Feed */}
           <TabsContent value="attendance" className="m-0 space-y-8 animate-fade-in">
              <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Daily Log: Feb 12, 2024</h3>
                    <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest flex items-center gap-2 uppercase">
                       <Printer size={16} /> Print Sheet
                    </button>
                 </div>
                 <table className="w-full text-left">
                    <thead>
                       <tr>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Identity</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-In Time</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle Status</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold">
                       {employees.map(emp => {
                         const record = attendance.find(a => a.employeeId === emp.id);
                         return (
                           <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group">
                              <td className="px-10 py-8 flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{emp.name[0]}</div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 uppercase">{emp.name}</span>
                                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{emp.role}</span>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-xs font-black text-slate-600">
                                 {record?.checkIn || "Pending Log"}
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex justify-center flex-wrap gap-2">
                                    <span className={cn(
                                       "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                       record?.status === "Present" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                       {record?.status || "Awaiting Mark"}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <div className="flex justify-end gap-2">
                                    <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle2 size={16} /></button>
                                    <button className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><XCircle size={16} /></button>
                                 </div>
                              </td>
                           </tr>
                         )
                       })}
                    </tbody>
                 </table>
              </div>
           </TabsContent>

           {/* Payroll Forge */}
           <TabsContent value="payroll" className="m-0 space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                       <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Settlement Ledger: Feb 2024</h3>
                    </div>
                    <table className="w-full text-left">
                       <thead>
                          <tr>
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Base</th>
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Bonus/Perf</th>
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Deducts</th>
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Takehome</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50 font-bold">
                          {employees.map(emp => (
                            <tr key={emp.id} className="hover:bg-slate-50">
                               <td className="px-8 py-8 font-black text-sm uppercase text-slate-900 tracking-tight">{emp.name}</td>
                               <td className="px-8 py-8 text-center text-xs text-slate-500 font-bold">{emp.paygrade.toLocaleString()}</td>
                               <td className="px-8 py-8 text-center text-xs text-emerald-500 font-black">+{emp.bonus.toLocaleString()}</td>
                               <td className="px-8 py-8 text-center text-xs text-rose-400 font-black">-{emp.deductions.toLocaleString()}</td>
                               <td className="px-8 py-8 text-right text-lg font-black text-slate-900 tracking-tighter">
                                 {(emp.paygrade + emp.bonus - emp.deductions).toLocaleString()} <span className="text-[10px] text-slate-300">EGP</span>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>

                 <div className="space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[45px] text-white space-y-8 relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 p-8 opacity-10">
                          <TrendingUp size={100} />
                       </div>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Monthly Burn Settlement</p>
                       <div className="space-y-2">
                          <h4 className="text-5xl font-black tracking-tighter text-emerald-400">
                             {employees.reduce((sum, e) => sum + e.paygrade + e.bonus - e.deductions, 0).toLocaleString()} <span className="text-xl text-white">EGP</span>
                          </h4>
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Estimated Gross Salaries for Feb 2024</p>
                       </div>
                       <button className="w-full py-6 bg-primary text-white rounded-[25px] font-black text-xs tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-3">
                          <CheckCircle2 size={20} /> Execute Batch Payout
                       </button>
                    </div>

                    <div className="bg-white p-10 rounded-[45px] border border-slate-100 space-y-6">
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payroll Alerts</h5>
                       <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-center gap-4">
                          <AlertCircle size={24} />
                          <p className="text-xs font-black uppercase tracking-tight">2 High Performance bonuses pending approval</p>
                       </div>
                    </div>
                 </div>
              </div>
           </TabsContent>
        </Tabs>
      </div>

      {/* --- SIDE SHEETS --- */}

      {/* 1. Add/Edit Employee Sheet */}
      <Sheet open={isEmpSheetOpen} onOpenChange={setIsEmpSheetOpen}>
         <SheetContent className="w-full sm:max-w-2xl p-0 border-none flex flex-col bg-white">
            <div className="bg-primary p-12 text-white relative">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <UserPlus size={120} />
               </div>
               <SheetHeader>
                  <SheetTitle className="text-4xl font-black uppercase tracking-tighter text-white">Talent Acquisition</SheetTitle>
                  <SheetDescription className="text-white/80 font-bold text-sm">Onboard new personnel and define their industrial footprint.</SheetDescription>
               </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12">
               <div className="space-y-8">
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Identity Core</h5>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Legal Name</label>
                        <input className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none" placeholder="Ex: Ahmed Hassan" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Age / D.O.B</label>
                        <input className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none" type="number" placeholder="32" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Corporate Role</label>
                        <input className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none" placeholder="Ex: Lead Technician" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mobile Contact</label>
                        <input className="w-full bg-slate-50 border-none px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none" placeholder="+20..." />
                     </div>
                  </div>
               </div>

               <div className="space-y-8 pt-8 border-t border-slate-50">
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Financial Package</h5>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Base Monthly Paygrade</label>
                        <div className="relative">
                           <input className="w-full bg-emerald-50 text-emerald-600 border-none px-6 py-5 rounded-2xl text-xl font-black focus:ring-4 focus:ring-emerald-100 outline-none" placeholder="0.00" />
                           <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">EGP</span>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">National ID (Scanned)</label>
                        <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-5 text-slate-300 italic group cursor-pointer hover:border-primary transition-all">
                           <History size={18} className="mr-2" /> Upload Doc
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 border-t border-slate-50 flex gap-4 bg-slate-50/50">
               <button onClick={() => setIsEmpSheetOpen(false)} className="flex-1 py-5 border-2 border-slate-100 rounded-[25px] font-black text-xs text-slate-400 uppercase tracking-widest">Discard</button>
               <button className="flex-[2] py-5 bg-primary text-white rounded-[25px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 uppercase">Forge Employment Contract</button>
            </div>
         </SheetContent>
      </Sheet>

      {/* 2. Employee Detail Insight */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-4xl p-0 border-none flex flex-col bg-slate-50">
           {selectedEmp && (
             <>
               <div className="bg-white p-12 relative border-b border-slate-100 shadow-sm overflow-hidden">
                  <div className="absolute top-0 right-0 p-20 opacity-5 grayscale pointer-events-none transform -rotate-12 translate-x-20">
                     <Briefcase size={240} />
                  </div>

                  <button onClick={() => setIsDetailOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-300 z-10">
                     <X size={24} />
                  </button>

                  <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-12">
                     <div className="w-48 h-48 rounded-[60px] bg-slate-900 flex items-center justify-center text-white shadow-3xl transform hover:rotate-6 transition-all duration-500">
                        <Users size={64} />
                     </div>

                     <div className="flex-1 space-y-6 pt-6 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                           <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{selectedEmp.name}</h2>
                           <span className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                              STAFF ID: {selectedEmp.id}
                           </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-10 font-black text-xs text-slate-400 uppercase tracking-tight italic">
                           <div className="flex items-center gap-2"><Briefcase size={16} className="text-primary not-italic" /> {selectedEmp.role}</div>
                           <div className="flex items-center gap-2"><MapPin size={16} className="text-accent not-italic" /> {selectedEmp.address}</div>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
                           <button className="px-8 py-4 bg-primary text-white rounded-[22px] font-black text-[10px] tracking-widest uppercase hover:scale-105 transition-all shadow-xl shadow-primary/20">Edit Profile</button>
                           <button className="px-8 py-4 bg-slate-50 border border-slate-200 text-slate-400 rounded-[22px] font-black text-[10px] tracking-widest uppercase">Restrict Access</button>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto px-12 py-10 space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] ml-2">Digital Attachments</h5>
                        <div className="space-y-4">
                           {selectedEmp.attachments.map((file, i) => (
                             <div key={i} className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                      <FileText size={20} />
                                   </div>
                                   <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{file}</span>
                                </div>
                                <button className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:text-primary transition-all">
                                   <Download size={18} />
                                </button>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] ml-2">Recent Attendance Pulse</h5>
                        <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm space-y-8">
                           <div className="grid grid-cols-7 gap-3">
                              {[...Array(31)].map((_, i) => (
                                <div key={i} className={cn(
                                  "aspect-square rounded-xl flex items-center justify-center text-[8px] font-black uppercase transition-all",
                                  i < 12 ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-200"
                                )}>
                                   {i + 1}
                                </div>
                              ))}
                           </div>
                           <div className="flex justify-between items-center pt-6 border-t border-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-400">
                              <span>Attendance Performance</span>
                              <span className="text-emerald-500">98% Efficient</span>
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

export default HRM;
