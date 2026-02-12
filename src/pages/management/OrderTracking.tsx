import React, { useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Package, 
  Search, 
  Truck, 
  User, 
  X, 
  Calendar, 
  ArrowRight,
  Filter,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";

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
  thumbnail?: string;
  date: string;
  status: "Pending" | "In Production" | "Quality Check" | "Ready" | "Completed" | "Shipped" | "Delivered" | "Cancelled";
  amount: string;
  progress: number; // 0 to 100
  estimatedDelivery: string;
  trackingHistory: TrackingStep[];
}

// --- Mock Data ---
const mockTrackingHistoryTemplate: TrackingStep[] = [
  { date: "Feb 12", time: "10:30 AM", status: "Order Placed", location: "Web Portal", description: "Order received and confirmed via Web Portal.", completed: true, icon: CheckCircle2 },
  { date: "Feb 12", time: "12:15 PM", status: "Material Allocated", location: "Warehouse A", description: "Fabrics and inks reserved for production.", completed: true, icon: Package },
  { date: "Feb 12", time: "02:00 PM", status: "In Production", location: "Factory Floor 1", description: "Printing process started on Machine #4.", completed: true, icon: TrendingUp },
  { date: "Feb 13", time: "09:00 AM", status: "Quality Check", location: "QC Lab", description: "Final inspection for color accuracy.", completed: false, icon: CheckCircle2 },
  { date: "Feb 13", time: "02:00 PM", status: "Ready for Pickup", location: "Dispatch Center", description: "Order packaged and ready for courier.", completed: false, icon: Package },
  { date: "Feb 13", time: "04:30 PM", status: "Out for Delivery", location: "Logistics Hub", description: "Handed over to courier partner.", completed: false, icon: Truck },
];

const generateMockOrders = (): Order[] => [
  { 
    id: "#ORD-9901", 
    customer: "Mohamed Ali", 
    product: "Premium Business Cards (x500)", 
    thumbnail: "https://images.unsplash.com/photo-1593627993077-76fa3528f804?q=80&w=2070&auto=format&fit=crop",
    date: "Today, 10:30 AM", 
    status: "In Production", 
    amount: "4,500 EGP", 
    progress: 45,
    estimatedDelivery: "Tomorrow, 2:00 PM",
    trackingHistory: mockTrackingHistoryTemplate.map((s, i) => ({...s, completed: i < 3}))
  },
  { 
    id: "#ORD-9902", 
    customer: "Sarah Cairo", 
    product: "Vinyl Banners (x5)", 
    thumbnail: "https://images.unsplash.com/photo-1541336032412-20489561c737?q=80&w=2070&auto=format&fit=crop",
    date: "Today, 09:15 AM", 
    status: "Pending", 
    amount: "1,200 EGP", 
    progress: 10,
    estimatedDelivery: "Feb 14, 10:00 AM",
    trackingHistory: mockTrackingHistoryTemplate.map((s, i) => ({...s, completed: i < 1}))
  },
  { 
    id: "#ORD-9899", 
    customer: "Corporate Inc.", 
    product: "Letterheads & Envelopes", 
    thumbnail: "https://images.unsplash.com/photo-1586075010923-2dd45eeed8bd?q=80&w=2070&auto=format&fit=crop",
    date: "Yesterday, 04:45 PM", 
    status: "Completed", 
    amount: "12,500 EGP", 
    progress: 100,
    estimatedDelivery: "Delivered",
    trackingHistory: mockTrackingHistoryTemplate.map(s => ({...s, completed: true}))
  },
  { 
    id: "#ORD-9898", 
    customer: "Amr Diab", 
    product: "Concert Posters (x2000)", 
    thumbnail: "https://images.unsplash.com/photo-1510134017772-aee7b409392e?q=80&w=2070&auto=format&fit=crop",
    date: "Yesterday, 02:20 PM", 
    status: "Shipped", 
    amount: "8,500 EGP", 
    progress: 90,
    estimatedDelivery: "Today, 6:00 PM",
    trackingHistory: mockTrackingHistoryTemplate.map((s, i) => ({...s, completed: i < 5}))
  },
  { 
    id: "#ORD-9897", 
    customer: "Nile Text", 
    product: "Staff Uniforms (x50)", 
    thumbnail: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1972&auto=format&fit=crop",
    date: "Feb 10, 11:00 AM", 
    status: "Quality Check", 
    amount: "32,000 EGP", 
    progress: 60,
    estimatedDelivery: "Feb 15, 12:00 PM",
    trackingHistory: mockTrackingHistoryTemplate.map((s, i) => ({...s, completed: i < 4}))
  },
  { 
    id: "#ORD-9896", 
    customer: "Cafe 24", 
    product: "Menu Booklets", 
    thumbnail: "https://images.unsplash.com/photo-1612453676150-b8ec1e89ce32?q=80&w=2070&auto=format&fit=crop",
    date: "Feb 09, 09:30 AM", 
    status: "Delivered", 
    amount: "2,100 EGP", 
    progress: 100,
    estimatedDelivery: "Delivered",
    trackingHistory: mockTrackingHistoryTemplate.map(s => ({...s, completed: true}))
  },
  { 
    id: "#ORD-9895", 
    customer: "Startup Hub", 
    product: "Merch Bundle", 
    thumbnail: "https://images.unsplash.com/photo-1632599268395-886ecfd24d55?q=80&w=2070&auto=format&fit=crop",
    date: "Feb 08, 03:15 PM", 
    status: "Cancelled", 
    amount: "5,600 EGP", 
    progress: 0,
    estimatedDelivery: "Cancelled",
    trackingHistory: [mockTrackingHistoryTemplate[0]]
  },
   { 
    id: "#ORD-9894", 
    customer: "Hassan El-Banna", 
    product: "Packaging Boxes", 
    thumbnail: "https://images.unsplash.com/photo-1598532163257-52b1b48b4953?q=80&w=1932&auto=format&fit=crop",
    date: "Feb 08, 01:00 PM", 
    status: "Ready", 
    amount: "15,000 EGP", 
    progress: 80,
    estimatedDelivery: "Ready for Pickup",
    trackingHistory: mockTrackingHistoryTemplate.map((s, i) => ({...s, completed: i < 5}))
  },
];

const OrderTracking = () => {
  const [orders, setOrders] = useState<Order[]>(generateMockOrders());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": case "Delivered": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Shipped": return "bg-sky-50 text-sky-600 border-sky-100";
      case "In Production": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Quality Check": return "bg-purple-50 text-purple-600 border-purple-100";
      case "Ready": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "Cancelled": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up pb-20">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Global <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Tracking</span></h1>
              <p className="text-slate-400 text-sm font-medium italic mt-1">Real-time logistics and production monitoring.</p>
           </div>

           <div className="flex gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Track Order ID, Customer..." 
                   className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <button className="bg-slate-900 text-white p-4 rounded-[22px] flex items-center gap-2 hover:bg-primary transition-colors shadow-lg">
                 <Filter size={20} />
              </button>
           </div>
        </div>

        {/* Tracking Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {filteredOrders.map((order, idx) => (
             <div 
               key={idx} 
               onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}
               className="bg-white rounded-[35px] border border-slate-100 shadow-sm p-8 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
             >
                {order.thumbnail && (
                  <>
                     <div className="absolute top-0 right-0 w-full h-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-cover bg-center pointer-events-none z-0" style={{backgroundImage: `url(${order.thumbnail})`}}></div>
                     <div className="absolute top-0 right-0 p-32 bg-slate-50 rounded-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0"></div>
                  </>
                )}
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                   <div className="flex items-center gap-4">
                      {order.thumbnail ? (
                        <img src={order.thumbnail} alt={order.product} className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-slate-200" />
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-xs text-slate-500 border border-slate-200">
                           {order.customer.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                         <h3 className="text-lg font-black text-slate-900 tracking-tight">{order.id}</h3>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{order.customer}</p>
                      </div>
                   </div>
                   <span className={cn(
                      "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      getStatusColor(order.status)
                   )}>
                      {order.status}
                   </span>
                </div>

                <div className="space-y-6 relative z-10">
                   <div>
                      <h4 className="font-bold text-slate-700 mb-1">{order.product}</h4>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                         <span className="flex items-center gap-1"><Calendar size={12} /> {order.date}</span>
                         <span className="flex items-center gap-1"><Package size={12} /> {order.amount}</span>
                      </div>
                   </div>

                   {/* Progress */}
                   <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                         <span>Progress</span>
                         <span>{order.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-primary transition-all duration-1000 ease-out" 
                           style={{width: `${order.progress}%`}}
                         ></div>
                      </div>
                   </div>

                   <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-bold">
                         <Truck size={14} className="text-primary" />
                         ETA: {order.estimatedDelivery}
                      </div>
                      <span className="font-black text-primary flex items-center gap-1 group-hover:underline">
                         View Details <ChevronRight size={12} />
                      </span>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Detailed Tracking Sheet */}
        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
           <SheetContent className="w-full sm:max-w-xl p-0 border-none flex flex-col bg-slate-50">
              {selectedOrder && (
                 <>
                    {/* Header */}
                    <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-10 opacity-5">
                          <MapPin size={150} />
                       </div>
                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                             <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/80 border border-white/10 inline-flex items-center gap-2">
                                <Truck size={12} /> Live Tracking
                             </div>
                             <button onClick={() => setIsDetailOpen(false)} className="text-white/60 hover:text-white transition-colors"><X size={20} /></button>
                          </div>
                          
                          <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">{selectedOrder.id}</h2>
                          <p className="text-sm font-medium text-slate-400 mb-6">{selectedOrder.product} <span className="text-slate-600 mx-2">•</span> {selectedOrder.customer}</p>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm font-bold text-white">{selectedOrder.status}</p>
                             </div>
                             <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Est. Arrival</p>
                                <p className="text-sm font-bold text-emerald-400">{selectedOrder.estimatedDelivery}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 overflow-y-auto p-10 relative">
                       <div className="absolute left-[59px] top-12 bottom-12 w-0.5 bg-slate-200 -z-0"></div>

                       <div className="space-y-8">
                          {selectedOrder.trackingHistory.map((step, idx) => (
                             <div key={idx} className="flex gap-6 relative z-10 group">
                                <div className={cn(
                                   "w-12 h-12 rounded-full border-4 flex items-center justify-center shrink-0 shadow-sm transition-all z-10",
                                   step.completed ? "bg-primary border-white text-white shadow-primary/30" : "bg-white border-slate-100 text-slate-300"
                                )}>
                                   <step.icon size={18} />
                                </div>
                                <div className={cn(
                                   "flex-1 p-5 rounded-3xl border transition-all",
                                   step.completed ? "bg-white border-slate-100 shadow-sm" : "bg-transparent border-transparent opacity-50"
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
                    </div>

                    {/* Footer Action */}
                    <div className="p-6 bg-white border-t border-slate-100">
                       <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-lg">
                          Request Status Update
                       </button>
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
      </div>
    </ManagementLayout>
  );
};

export default OrderTracking;
