import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ManagementLayout from "@/components/management/ManagementLayout";
import { adminOrderApi } from "@/api/adminOrderApi";
import { adminCustomersApi } from "@/api/adminCustomersApi";
import type { AdminOrderResponse } from "@/types/orderApi";
import type { BackendOrderStatus } from "@/types/orderApi";
import {
  Users,
  ShoppingBag,
  Package,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Plus,
  FileBarChart,
  CheckCircle2,
  Truck,
  AlertCircle,
  MapPin,
  Calendar,
  ChevronRight,
  Box,
  Loader2,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

// --- Types ---
interface TrackingStep {
  date: string;
  time: string;
  status: string;
  location: string;
  description: string;
  completed: boolean;
  icon: React.ComponentType<{ size?: number }>;
}

interface DashboardOrder {
  id: string;
  customer: string;
  product: string;
  date: string;
  status: string;
  displayStatus: string;
  amount: string;
  progress: number;
  trackingHistory: TrackingStep[];
}

const TRACKING_ICONS = { CheckCircle2, Box, ShoppingBag, Package };

function statusToProgress(s: BackendOrderStatus): number {
  switch (s) {
    case "pending":
      return 10;
    case "in_progress":
      return 50;
    case "done":
    case "paid":
      return 100;
    case "cancelled":
      return 0;
    default:
      return 10;
  }
}

function statusToDisplay(s: BackendOrderStatus): string {
  switch (s) {
    case "pending":
      return "Pending";
    case "in_progress":
      return "In Production";
    case "done":
      return "Completed";
    case "paid":
      return "Paid";
    case "cancelled":
      return "Cancelled";
    default:
      return s;
  }
}

function formatOrderDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today) return `Today, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function buildTrackingSteps(order: AdminOrderResponse): TrackingStep[] {
  const steps: { status: BackendOrderStatus; label: string; icon: keyof typeof TRACKING_ICONS }[] = [
    { status: "pending", label: "Order Placed", icon: "CheckCircle2" },
    { status: "in_progress", label: "In Production", icon: "ShoppingBag" },
    { status: "done", label: "Completed", icon: "CheckCircle2" },
    { status: "paid", label: "Paid", icon: "Package" },
  ];
  const orderStatus = order.status;
  const statusOrder: BackendOrderStatus[] = ["pending", "in_progress", "done", "paid"];
  const currentIdx = statusOrder.indexOf(orderStatus);
  return steps.map((s, i) => {
    const idx = statusOrder.indexOf(s.status);
    const completed = orderStatus === "cancelled" ? false : idx <= currentIdx;
    return {
      date: new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: new Date(order.updated_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      status: s.label,
      location: "—",
      description: `${s.label}.`,
      completed,
      icon: TRACKING_ICONS[s.icon],
    };
  });
}

function adminOrderToDashboardOrder(r: AdminOrderResponse): DashboardOrder {
  const amount = r.total_amount != null ? `${Number(r.total_amount).toLocaleString("en-US")} EGP` : "—";
  return {
    id: r.order_id,
    customer: r.user_info?.fullname || r.user_info?.email || "—",
    product: r.order_type_name || "Order",
    date: formatOrderDate(r.created_at),
    status: r.status,
    displayStatus: statusToDisplay(r.status),
    amount,
    progress: statusToProgress(r.status),
    trackingHistory: buildTrackingSteps(r),
  };
}

const PIE_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  in_progress: "#3b82f6",
  done: "#10b981",
  paid: "#10b981",
  cancelled: "#ef4444",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [showReports, setShowReports] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<DashboardOrder | null>(null);
  const [isTrackingSheetOpen, setIsTrackingSheetOpen] = useState(false);

  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ["admin", "orders", "list"],
    queryFn: () => adminOrderApi.list({}),
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: () => adminCustomersApi.getCustomers(),
  });

  const orders: DashboardOrder[] = useMemo(() => {
    if (!ordersData?.results) return [];
    return ordersData.results.map(adminOrderToDashboardOrder);
  }, [ordersData?.results]);

  const revenueFromOrders = useMemo(() => {
    if (!ordersData?.results) return 0;
    return ordersData.results.reduce((sum, o) => sum + (o.total_amount != null ? Number(o.total_amount) : 0), 0);
  }, [ordersData?.results]);

  const orderCountByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      map[o.status] = (map[o.status] ?? 0) + 1;
    });
    return map;
  }, [orders]);

  const orderStatusData = useMemo(() => {
    const labels: Record<string, string> = {
      pending: "Pending",
      in_progress: "In Production",
      done: "Completed",
      paid: "Paid",
      cancelled: "Cancelled",
    };
    return Object.entries(orderCountByStatus)
      .filter(([, v]) => v > 0)
      .map(([k, value]) => ({ name: labels[k] ?? k, value, color: PIE_COLORS[k] ?? "#94a3b8" }));
  }, [orderCountByStatus]);

  const revenueData = useMemo(() => {
    const byDay: Record<string, number> = {};
    ordersData?.results?.forEach((o) => {
      const day = new Date(o.created_at).toLocaleDateString("en-US", { weekday: "short" });
      const amt = o.total_amount != null ? Number(o.total_amount) : 0;
      byDay[day] = (byDay[day] ?? 0) + amt;
    });
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((name) => ({ name, value: Math.round(byDay[name] ?? 0) }));
  }, [ordersData?.results]);

  const totalOrders = ordersData?.count ?? 0;
  const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "in_progress").length;
  const pendingCount = orderCountByStatus.pending ?? 0;
  const customerCount = customers?.length ?? 0;

  const stats = [
    { label: "Total Revenue (from list)", value: `${revenueFromOrders.toLocaleString("en-US")} EGP`, change: "from orders", trend: "up" as const, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Active Orders", value: String(activeOrders), change: `of ${totalOrders} total`, trend: "up" as const, icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
    { label: "Pending Production", value: String(pendingCount), change: "awaiting start", trend: "down" as const, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Total Customers", value: String(customerCount), change: "registered", trend: "up" as const, icon: Users, color: "bg-purple-50 text-purple-600" },
  ];

  const handleViewTracking = (order: DashboardOrder) => {
    setSelectedOrderForTracking(order);
    setIsTrackingSheetOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
      case "paid":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "in_progress":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "cancelled":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  const isLoading = ordersLoading || customersLoading;
  const hasError = ordersError != null;

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up pb-10">
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="font-medium">Loading dashboard…</span>
          </div>
        )}
        {hasError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-bold">Failed to load dashboard data.</p>
            <p className="text-sm mt-1">{ordersError instanceof Error ? ordersError.message : "Please try again."}</p>
          </div>
        )}
        {!isLoading && !hasError && (
          <>
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Dashboard <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Overview</span></h1>
              <p className="text-slate-500 text-sm font-medium mt-1">Overview of your business performance.</p>
           </div>
           <div className="flex items-center gap-3">
             <button
                type="button"
                onClick={() => navigate("/management/orders")}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-primary transition-all flex items-center gap-2"
              >
                <Plus size={18} /> New Order
              </button>
             <button
                type="button"
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
                      <span className="text-3xl font-black text-slate-900">{totalOrders}</span>
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
                                   {order.displayStatus}
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
                                     {order.displayStatus}
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
              <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden group cursor-pointer" onClick={() => navigate("/management/orders")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/management/orders")}>
                 <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Plus size={24} />
                    </div>
                    <h3 className="font-black text-xl mb-2">Create New Order</h3>
                    <p className="text-white/60 text-sm mb-6 leading-relaxed">Initate a new production workflow, assign tasks, and track progress instantly.</p>
                    <button type="button" className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-900/20" onClick={() => navigate("/management/orders")}>
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
          </>
        )}
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
