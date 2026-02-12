import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  Clock, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Activity,
  Plus,
  FileBarChart,
  Search,
  Filter,
  CheckCircle2,
  Truck,
  AlertCircle,
  X,
  MapPin,
  Calendar,
  ChevronRight,
  Box
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";

// --- Mock Data for Charts ---
const revenueData = [
  { name: "Mon", value: 4000 },
  { name: "Tue", value: 3000 },
  { name: "Wed", value: 5000 },
  { name: "Thu", value: 2780 },
  { name: "Fri", value: 1890 },
  { name: "Sat", value: 2390 },
  { name: "Sun", value: 3490 },
];

const orderStatusData = [
  { name: "Completed", value: 400, color: "#10b981" }, // emerald-500
  { name: "In Production", value: 300, color: "#3b82f6" }, // blue-500
  { name: "Pending", value: 300, color: "#f59e0b" }, // amber-500
  { name: "Issues", value: 100, color: "#ef4444" }, // red-500
];

// --- Types ---
interface TrackingStep {
  date: string;
  time: string;
  status: string;
  location: string;
  description: string;
  completed: boolean;
  icon: any;
}

interface Order {
  id: string;
  customer: string;
  product: string;
  date: string;
  status: "Pending" | "In Production" | "Quality Check" | "Ready" | "Completed" | "Shipped";
  amount: string;
  progress: number; // 0 to 100
  trackingHistory: TrackingStep[];
}

const mockTrackingHistory: TrackingStep[] = [
  { date: "Feb 12", time: "10:30 AM", status: "Order Placed", location: "Cairo Branch", description: "Order received and confirmed via Web Portal.", completed: true, icon: CheckCircle2 },
  { date: "Feb 12", time: "12:15 PM", status: "Material Allocated", location: "Warehouse A", description: "Fabrics and inks reserved for production.", completed: true, icon: Box },
  { date: "Feb 12", time: "02:00 PM", status: "In Production", location: "Factory Floor 1", description: "Printing process started on Machine #4.", completed: true, icon: ShoppingBag },
  { date: "Feb 13", time: "09:00 AM", status: "Quality Check", location: "Quality Control Lab", description: "Final inspection for color accuracy.", completed: false, icon: CheckCircle2 },
  { date: "Feb 13", time: "02:00 PM", status: "Ready for Pickup", location: "Dispatch Center", description: "Order packaged and ready for courier.", completed: false, icon: Package },
];

const initialOrders: Order[] = [
  { 
    id: "#ORD-9901", 
    customer: "Mohamed Ali", 
    product: "Premium Business Cards", 
    date: "Today, 10:30 AM", 
    status: "In Production", 
    amount: "4,500 EGP", 
    progress: 45,
    trackingHistory: mockTrackingHistory 
  },
  { 
    id: "#ORD-9900", 
    customer: "Sarah Cairo", 
    product: "Vinyl Banners (x5)", 
    date: "Today, 09:15 AM", 
    status: "Pending", 
    amount: "1,200 EGP", 
    progress: 10,
    trackingHistory: [mockTrackingHistory[0]]
  },
  { 
    id: "#ORD-9899", 
    customer: "Corporate Inc.", 
    product: "Letterheads & Envelopes", 
    date: "Yesterday, 04:45 PM", 
    status: "Completed", 
    amount: "12,500 EGP", 
    progress: 100,
    trackingHistory: mockTrackingHistory.map(s => ({...s, completed: true}))
  },
  { 
    id: "#ORD-9898", 
    customer: "Amr Diab", 
    product: "Concert Posters", 
    date: "Yesterday, 02:20 PM", 
    status: "Shipped", 
    amount: "850 EGP", 
    progress: 100,
    trackingHistory: mockTrackingHistory
  },
  { 
    id: "#ORD-9897", 
    customer: "Nile Text", 
    product: "Staff Uniforms", 
    date: "Feb 10, 11:00 AM", 
    status: "Quality Check", 
    amount: "3,200 EGP", 
    progress: 80,
    trackingHistory: mockTrackingHistory.slice(0, 4)
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [showReports, setShowReports] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  
  // Tracking State
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [isTrackingSheetOpen, setIsTrackingSheetOpen] = useState(false);

  // New Order Form State
  const [newOrder, setNewOrder] = useState({
    customer: "",
    product: "",
    amount: "",
    status: "Pending" as Order["status"]
  });

  const handleAddOrder = () => {
    if (!newOrder.customer || !newOrder.product || !newOrder.amount) return;

    const order: Order = {
      id: `#ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      customer: newOrder.customer,
      product: newOrder.product,
      date: "Just now",
      status: newOrder.status,
      amount: `${newOrder.amount} EGP`,
      progress: newOrder.status === "Pending" ? 10 : newOrder.status === "In Production" ? 40 : 100,
      trackingHistory: [mockTrackingHistory[0]]
    };

    setOrders([order, ...orders]);
    setIsAddOrderOpen(false);
    setNewOrder({ customer: "", product: "", amount: "", status: "Pending" });
  };

  const handleViewTracking = (order: Order) => {
    setSelectedOrderForTracking(order);
    setIsTrackingSheetOpen(true);
  };

  const stats = [
    { label: "Total Revenue", value: "284,500 EGP", change: "+12.5%", trend: "up", icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Active Orders", value: orders.filter(o => o.status !== "Completed" && o.status !== "Shipped").length.toString(), change: "+5 today", trend: "up", icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
    { label: "Pending Production", value: orders.filter(o => o.status === "Pending").length.toString(), change: "-2 from yesterday", trend: "down", icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Total Customers", value: "1,240", change: "+8 this week", trend: "up", icon: Users, color: "bg-purple-50 text-purple-600" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Shipped": return "bg-slate-100 text-slate-600 border-slate-200";
      case "In Production": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Quality Check": return "bg-purple-50 text-purple-600 border-purple-100";
      case "Ready": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      default: return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up pb-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">Overview of your business performance.</p>
           </div>
           <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsAddOrderOpen(true)}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-primary transition-all flex items-center gap-2"
              >
                <Plus size={18} /> New Order
              </button>
             <button 
                onClick={() => setShowReports(!showReports)}
                className={cn(
                  "px-6 py-3 rounded-xl text-sm font-bold border transition-all flex items-center gap-2",
                  showReports ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary"
                )}
              >
                <FileBarChart size={18} /> {showReports ? "Hide Reports" : "View Reports"}
              </button>
           </div>
        </div>

        {/* Reports Section (Collapsible) */}
        {showReports && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
             <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black text-lg text-slate-900">Revenue Trend</h3>
                   <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-1 outline-none cursor-pointer">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>This Year</option>
                   </select>
                </div>
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                         <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(value) => `${value}`} />
                         <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            cursor={{stroke: '#e2e8f0', strokeWidth: 1}}
                         />
                         <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                <h3 className="font-black text-lg text-slate-900 mb-6">Order Status</h3>
                <div className="flex-1 min-h-[200px] relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                         >
                            {orderStatusData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Pie>
                         <Tooltip />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                      <span className="text-3xl font-black text-slate-900">1,100</span>
                      <span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
                   </div>
                </div>
                <div className="mt-6 space-y-3">
                   {orderStatusData.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                         <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="font-bold text-slate-600">{item.name}</span>
                         </div>
                         <span className="font-black text-slate-900">{item.value}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
               <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-3 rounded-xl", stat.color)}>
                     <stat.icon size={24} />
                  </div>
                  <span className={cn(
                    "flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full",
                    stat.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                     {stat.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />} {stat.change}
                  </span>
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Recent Orders & Tracking */}
           <div className="lg:col-span-2 space-y-8">
              {/* Order Tracking System */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <Truck className="text-primary" size={20} />
                       <h3 className="font-black text-lg text-slate-900">Live Order Tracking</h3>
                    </div>
                    <button onClick={() => navigate('/management/orders/tracking')} className="text-xs font-bold text-slate-400 hover:text-primary transition-colors">View All Streams</button>
                 </div>
                 <div className="p-6 space-y-8">
                    {orders.slice(0, 3).map((order, i) => (
                       <div key={i} className="space-y-4 pt-2 first:pt-0">
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-xs text-slate-500 border border-slate-100">
                                   {order.customer.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                   <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-sm text-slate-900">{order.product}</h4>
                                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{order.id}</span>
                                   </div>
                                   <p className="text-xs text-slate-500 font-medium">{order.customer}</p>
                                </div>
                             </div>
                             <div className="flex flex-col items-end gap-2">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border",
                                  getStatusColor(order.status)
                                )}>
                                   {order.status}
                                </span>
                                <button 
                                   onClick={() => handleViewTracking(order)}
                                   className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                                >
                                   Track Delivery <ChevronRight size={10} />
                                </button>
                             </div>
                          </div>
                          
                          {/* Mini Timeline/Progress Mockup */}
                          <div className="relative pt-2">
                             <div className="flex justify-between items-center relative z-10 px-2">
                                {[1, 2, 3, 4].map((step, idx) => {
                                  // Mock milestone logic for visuals
                                  const stepsCount = 4;
                                  const currentStep = Math.floor((order.progress / 100) * stepsCount);
                                  const isCompleted = idx <= currentStep;
                                  const isCurrent = idx === currentStep;
                                  
                                  return (
                                    <div key={idx} className="flex flex-col items-center gap-2">
                                       <div className={cn(
                                          "w-3 h-3 rounded-full border-2 transition-all",
                                          isCompleted ? "bg-primary border-primary" : "bg-white border-slate-200"
                                       )}></div>
                                    </div>
                                  );
                                })}
                             </div>
                             <div className="absolute top-[13px] left-2 right-2 h-0.5 bg-slate-100 -z-0">
                                <div 
                                  className="h-full bg-primary transition-all duration-1000"
                                  style={{width: `${order.progress}%`}}
                                ></div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-lg text-slate-900">Recent Orders</h3>
                    <button onClick={() => navigate('/management/orders')} className="text-xs font-bold text-primary hover:underline">View All</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead className="bg-slate-50/50">
                          <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <th className="px-6 py-4">Order ID</th>
                             <th className="px-6 py-4">Customer</th>
                             <th className="px-6 py-4">Date</th>
                             <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4 text-right">Amount</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {orders.slice(0, 8).map((order, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                               <td className="px-6 py-4 text-xs font-black text-slate-900 group-hover:text-primary transition-colors">{order.id}</td>
                               <td className="px-6 py-4">
                                  <div className="text-sm font-bold text-slate-700">{order.customer}</div>
                                  <div className="text-xs text-slate-400">{order.product}</div>
                               </td>
                               <td className="px-6 py-4 text-xs font-medium text-slate-500">{order.date}</td>
                               <td className="px-6 py-4">
                                  <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border",
                                    getStatusColor(order.status)
                                  )}>
                                     {order.status}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">{order.amount}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           {/* Quick Actions / Activity */}
           <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden group cursor-pointer" onClick={() => setIsAddOrderOpen(true)}>
                 <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Plus size={24} />
                    </div>
                    <h3 className="font-black text-xl mb-2">Create New Order</h3>
                    <p className="text-white/60 text-sm mb-6 leading-relaxed">Initate a new production workflow, assign tasks, and track progress instantly.</p>
                    <button className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-900/20">
                       + Start Workflow
                    </button>
                 </div>
                 {/* Decorative Circle */}
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">Stock Alerts</h3>
                    <AlertCircle size={14} className="text-amber-500" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-red-50 border border-red-100 transition-transform hover:scale-105">
                       <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                          <Package size={16} />
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-900">Cyan Ink Low</p>
                          <p className="text-[10px] font-bold text-red-500">Only 2 Units left</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- Add Order Sheet --- */}
        <Sheet open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
           <SheetContent className="sm:max-w-md bg-white border-l border-slate-100 p-0 flex flex-col">
              <SheetHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
                 <SheetTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">New Order</SheetTitle>
                 <SheetDescription className="text-xs font-medium text-slate-500">Enter order details to start production.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</label>
                    <div className="relative">
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       <input 
                         type="text" 
                         className="w-full bg-slate-50 border-none pl-12 pr-4 py-4 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                         placeholder="Ex: Mohamed Ali"
                         value={newOrder.customer}
                         onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product / Service</label>
                    <div className="relative">
                       <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       <input 
                         type="text" 
                         className="w-full bg-slate-50 border-none pl-12 pr-4 py-4 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                         placeholder="Ex: Business Cards (x1000)"
                         value={newOrder.product}
                         onChange={(e) => setNewOrder({...newOrder, product: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (EGP)</label>
                       <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input 
                            type="number" 
                            className="w-full bg-slate-50 border-none pl-12 pr-4 py-4 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            placeholder="0.00"
                            value={newOrder.amount}
                            onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                       <select 
                          className="w-full bg-slate-50 border-none px-4 py-4 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer appearance-none"
                          value={newOrder.status}
                          onChange={(e) => setNewOrder({...newOrder, status: e.target.value as any})}
                       >
                          <option value="Pending">Pending</option>
                          <option value="In Production">In Production</option>
                          <option value="Quality Check">Quality Check</option>
                          <option value="Ready">Ready</option>
                          <option value="Completed">Completed</option>
                       </select>
                    </div>
                 </div>
              </div>
              <SheetFooter className="p-6 border-t border-slate-50 bg-slate-50/50">
                 <div className="flex gap-4 w-full">
                    <SheetClose asChild>
                       <button className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors">
                          Cancel
                       </button>
                    </SheetClose>
                    <button 
                       onClick={handleAddOrder}
                       className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-900 text-white shadow-lg hover:bg-primary transition-colors"
                    >
                       Create Order
                    </button>
                 </div>
              </SheetFooter>
           </SheetContent>
        </Sheet>

        {/* --- Track Delivery Sheet --- */}
        <Sheet open={isTrackingSheetOpen} onOpenChange={setIsTrackingSheetOpen}>
           <SheetContent className="w-full sm:max-w-lg p-0 border-none flex flex-col bg-slate-50">
              {selectedOrderForTracking && (
                <>
                   <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                         <MapPin size={100} />
                      </div>
                      <div className="relative z-10">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Shipment Tracker</p>
                         <h2 className="text-2xl font-black uppercase tracking-tight">{selectedOrderForTracking.id}</h2>
                         <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-300">
                             <Truck size={14} /> 
                             <span>Transit Route: Cairo <ArrowUpRight size={10} className="inline opacity-50" /> Alexandria</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 relative">
                      {/* Tracking Timeline */}
                      <div className="absolute left-[54px] top-10 bottom-10 w-0.5 bg-slate-200 -z-0"></div>

                      <div className="space-y-10">
                         {selectedOrderForTracking.trackingHistory.map((step, idx) => (
                           <div key={idx} className="flex gap-6 relative z-10 group">
                              <div className={cn(
                                "w-12 h-12 rounded-full border-4 flex items-center justify-center shrink-0 shadow-lg transition-all",
                                step.completed ? "bg-primary border-white text-white" : "bg-white border-slate-100 text-slate-300"
                              )}>
                                 <step.icon size={18} />
                              </div>
                              <div className={cn(
                                "flex-1 p-5 rounded-2xl border shadow-sm transition-all",
                                step.completed ? "bg-white border-slate-100" : "bg-slate-50 border-transparent opacity-60 grayscale"
                              )}>
                                 <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">{step.status}</h4>
                                    <span className="text-[10px] font-bold text-slate-400">{step.time}</span>
                                 </div>
                                 <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">{step.description}</p>
                                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {step.date}</span>
                                    <span className="flex items-center gap-1"><MapPin size={12} /> {step.location}</span>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                         <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Estimated Delivery</p>
                         <p className="text-xl font-black text-slate-900 mt-1">Tomorrow, 02:00 PM</p>
                      </div>
                   </div>
                   
                   <SheetFooter className="p-6 border-t border-slate-100 bg-white">
                      <button onClick={() => setIsTrackingSheetOpen(false)} className="w-full py-4 bg-slate-100 font-black text-xs text-slate-500 uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors">
                         Close Tracker
                      </button>
                   </SheetFooter>
                </>
              )}
           </SheetContent>
        </Sheet>
      </div>

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

export default Dashboard;
