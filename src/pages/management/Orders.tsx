import React, { useState, useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import {
  ShoppingBag,
  Search,
  ChevronRight,
  Users,
  Package,
  FileText,
  Banknote,
  Layers,
  Tag,
  AlertCircle,
  X,
  Mail,
  MessageCircle,
  Copy,
  ExternalLink,
  Download,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PatternThumbnail } from "@/components/PatternThumbnail";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ordersApi } from "@/api/orders";
import { authApi } from "@/api/auth";
import { userDesignsApi } from "@/api/userDesigns";
import type { Order as ApiOrder, OrderStatus as ApiOrderStatus } from "@/types/order";

type DisplayStatus = "Pending" | "In Progress" | "Done" | "Cancelled";

function mapToDisplayStatus(status: ApiOrderStatus): DisplayStatus {
  switch (status) {
    case "SUBMITTED":
    case "INVOICE_PENDING":
    case "PAYMENT_PENDING":
    case "INVOICED":
      return "Pending";
    case "PAID":
    case "IN_PRODUCTION":
    case "READY":
      return "In Progress";
    case "COMPLETED":
      return "Done";
    case "CANCELLED":
    case "DRAFT":
      return "Cancelled";
    default:
      return "Pending";
  }
}

function fabricSourceLabel(source: "customer" | "factory" | "not_sure"): string {
  switch (source) {
    case "customer":
      return "I Provide";
    case "factory":
      return "Factory Provides";
    case "not_sure":
      return "Not Sure";
    default:
      return source;
  }
}

function orderTypeLabel(type: "sample" | "order"): string {
  return type === "sample" ? "Sample" : "Order";
}

const statusOptions: { label: string; value: DisplayStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In Progress" },
  { label: "Done", value: "Done" },
  { label: "Cancelled", value: "Cancelled" },
];

type RequestVsOrderFilter = "All" | "Request" | "Order";
type OrderTypeCategoryFilter = "All" | "Sample" | "Order";

const requestVsOrderOptions: { label: string; value: RequestVsOrderFilter }[] = [
  { label: "All", value: "All" },
  { label: "Request / Wait quotation", value: "Request" },
  { label: "Order", value: "Order" },
];

const orderTypeCategoryOptions: { label: string; value: OrderTypeCategoryFilter }[] = [
  { label: "All", value: "All" },
  { label: "Sample", value: "Sample" },
  { label: "Order", value: "Order" },
];

const defaultEmailSubject = (orderId: string) => `Quotation for your order ${orderId}`;
const defaultEmailBody = (customerName: string, orderId: string, quantity: number, quotationAmount: string, validity: string) =>
  `Dear ${customerName},\n\nThank you for your request (Order ${orderId}).\n\nWe are pleased to provide the following quotation:\n\n• Quantity: ${quantity} m\n• Quoted amount: ${quotationAmount} EGP\n• Validity: ${validity}\n\nPlease let us know if you would like to proceed or if you have any questions.\n\nBest regards`;
const defaultWhatsAppMessage = (customerName: string, orderId: string, quantity: number, quotationAmount: string, validity: string) =>
  `Hi ${customerName},\n\nQuotation for order ${orderId}:\n• Quantity: ${quantity} m\n• Amount: ${quotationAmount} EGP\n• Validity: ${validity}\n\nReply to confirm or ask any questions.`;

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DisplayStatus | "All">("All");
  const [requestVsOrderFilter, setRequestVsOrderFilter] = useState<RequestVsOrderFilter>("All");
  const [orderTypeCategoryFilter, setOrderTypeCategoryFilter] = useState<OrderTypeCategoryFilter>("All");
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<ApiOrder | null>(null);
  const [whatsappError, setWhatsappError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [quotationChannel, setQuotationChannel] = useState<"email" | "whatsapp">("email");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [quotationAmount, setQuotationAmount] = useState("");
  const [quotationValidity, setQuotationValidity] = useState("7 days");
  const [copied, setCopied] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<ApiOrderStatus>("SUBMITTED");
  const [addUserId, setAddUserId] = useState("");
  const [addPresetId, setAddPresetId] = useState("");
  const [addFabricType, setAddFabricType] = useState<"sublimation" | "natural">("sublimation");
  const [addOrderType, setAddOrderType] = useState<"sample" | "order">("order");
  const [addFabricSource, setAddFabricSource] = useState<"customer" | "factory" | "not_sure">("factory");
  const [addFactoryFabricId, setAddFactoryFabricId] = useState("");
  const [addQuantity, setAddQuantity] = useState(1);
  const [addNotes, setAddNotes] = useState("");
  const [addStatus, setAddStatus] = useState<ApiOrderStatus>("SUBMITTED");

  const allOrders = useMemo(() => ordersApi.getAllOrders(), [refresh]);
  const allUsers = useMemo(() => authApi.getAllUsers(), []);
  const presets = useMemo(() => ordersApi.getPresetDesigns(), []);
  const factoryFabricsList = useMemo(() => ordersApi.getFactoryFabrics(), []);

  // Pre-fill quotation templates when opening a quotation request (once per order)
  const itemForQuotation = selectedOrder?.items?.[0];
  const isQuotationRequest = selectedOrder && (selectedOrder.id.startsWith("quot-") || itemForQuotation?.fabricChoice?.fabricSource === "customer" || itemForQuotation?.fabricChoice?.fabricSource === "not_sure");
  React.useEffect(() => {
    if (!selectedOrder || !itemForQuotation || !isQuotationRequest) return;
    const cust = authApi.getUserById(selectedOrder.userId);
    const name = cust?.name ?? "Customer";
    const qty = itemForQuotation.quantity;
    setEmailSubject(defaultEmailSubject(selectedOrder.id));
    setEmailBody(defaultEmailBody(name, selectedOrder.id, qty, "—", "7 days"));
    setWhatsappMessage(defaultWhatsAppMessage(name, selectedOrder.id, qty, "—", "7 days"));
    setQuotationAmount("");
    setQuotationValidity("7 days");
  }, [selectedOrder?.id]);

  const handleOpenMail = () => {
    if (!selectedOrder || !itemForQuotation) return;
    const cust = authApi.getUserById(selectedOrder.userId);
    const to = cust?.email ?? "";
    const subj = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(emailBody);
    window.open(`mailto:${to}?subject=${subj}&body=${body}`, "_blank");
  };

  const handleCopyEmail = () => {
    const text = `Subject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleOpenWhatsApp = () => {
    setWhatsappError("");
    const phone = whatsappPhone.replace(/\D/g, "");
    if (!phone) {
      setWhatsappError("Please enter customer WhatsApp number with country code (e.g. 201234567890).");
      return;
    }
    const text = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const refreshQuotationTemplates = () => {
    if (!selectedOrder || !itemForQuotation || !isQuotationRequest) return;
    const cust = authApi.getUserById(selectedOrder.userId);
    const name = cust?.name ?? "Customer";
    const qty = itemForQuotation.quantity;
    const amount = quotationAmount || "—";
    const validity = quotationValidity || "7 days";
    setEmailSubject(defaultEmailSubject(selectedOrder.id));
    setEmailBody(defaultEmailBody(name, selectedOrder.id, qty, amount, validity));
    setWhatsappMessage(defaultWhatsAppMessage(name, selectedOrder.id, qty, amount, validity));
  };

  const filteredOrders = useMemo(() => {
    return allOrders.filter((o) => {
      const displayStatus = mapToDisplayStatus(o.status);
      const matchesStatus = statusFilter === "All" || displayStatus === statusFilter;
      const customer = authApi.getUserById(o.userId);
      const name = customer?.name ?? o.userId;
      const email = customer?.email ?? "";
      const matchesSearch =
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());
      const firstItem = o.items?.[0];
      const fabricSource = firstItem?.fabricChoice?.fabricSource;
      const isRequest = o.id.startsWith("quot-") || fabricSource === "customer" || fabricSource === "not_sure";
      const matchesRequestVsOrder =
        requestVsOrderFilter === "All" ||
        (requestVsOrderFilter === "Request" && isRequest) ||
        (requestVsOrderFilter === "Order" && !isRequest);
      const orderType = firstItem?.fabricChoice?.orderType ?? "order";
      const matchesOrderTypeCategory =
        orderTypeCategoryFilter === "All" ||
        (orderTypeCategoryFilter === "Sample" && orderType === "sample") ||
        (orderTypeCategoryFilter === "Order" && orderType === "order");
      return matchesStatus && matchesSearch && matchesRequestVsOrder && matchesOrderTypeCategory;
    });
  }, [allOrders, statusFilter, searchTerm, requestVsOrderFilter, orderTypeCategoryFilter]);

  const getStatusColor = (status: DisplayStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "In Progress":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Done":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Cancelled":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const handleStatusChange = (orderId: string, newStatus: ApiOrderStatus) => {
    ordersApi.updateOrderStatus(orderId, newStatus);
    setRefresh((r) => r + 1);
    setSelectedOrder((prev) => {
      if (!prev || prev.id !== orderId) return prev;
      return { ...prev, status: newStatus, updatedAt: new Date().toISOString() };
    });
  };

  const handleDeleteOrder = () => {
    if (selectedOrder) setDeleteConfirmOrder(selectedOrder);
  };

  const confirmDeleteOrder = () => {
    if (!deleteConfirmOrder) return;
    ordersApi.deleteOrder(deleteConfirmOrder.id);
    setRefresh((r) => r + 1);
    setSelectedOrder(null);
    setIsDetailOpen(false);
    setDeleteConfirmOrder(null);
  };

  const handleSaveEdit = () => {
    if (!selectedOrder) return;
    ordersApi.updateOrder(selectedOrder.id, { status: editStatus, quantity: editQuantity, notes: editNotes });
    setRefresh((r) => r + 1);
    setSelectedOrder((prev) => {
      if (!prev || prev.id !== selectedOrder.id) return prev;
      const next = { ...prev, status: editStatus, updatedAt: new Date().toISOString() };
      if (prev.items[0]) {
        next.items = [{ ...prev.items[0], quantity: editQuantity, notes: editNotes, totalPrice: prev.items[0].unitPrice * editQuantity }];
        next.totalAmount = next.items[0].totalPrice;
      }
      return next;
    });
    setIsEditOpen(false);
  };

  const openEdit = () => {
    if (!selectedOrder?.items?.[0]) return;
    setEditQuantity(selectedOrder.items[0].quantity);
    setEditNotes(selectedOrder.items[0].notes ?? "");
    setEditStatus(selectedOrder.status);
    setIsEditOpen(true);
  };

  const handleAddOrder = () => {
    if (!addUserId || !addPresetId) return;
    const fabricChoice: import("@/types/order").FabricChoice = {
      fabricType: addFabricType,
      orderType: addOrderType,
      fabricSource: addFabricSource,
      ...(addFabricSource === "factory" && addFactoryFabricId ? { factoryFabricId: addFactoryFabricId } : {}),
    };
    const designChoice: import("@/types/order").DesignChoice = { source: "existing", presetId: addPresetId };
    ordersApi.createOrderAdmin({
      userId: addUserId,
      designChoice,
      fabricChoice,
      quantity: addQuantity,
      notes: addNotes,
      status: addStatus,
    });
    setRefresh((r) => r + 1);
    setIsAddOrderOpen(false);
    setAddUserId("");
    setAddPresetId("");
    setAddQuantity(1);
    setAddNotes("");
  };

  const item = selectedOrder?.items?.[0];
  const isQuotation = selectedOrder?.id.startsWith("quot-") ?? false;
  const fabricSource = item?.fabricChoice?.fabricSource;
  const waitsQuotation = fabricSource === "customer" || fabricSource === "not_sure";
  const customer = selectedOrder ? authApi.getUserById(selectedOrder.userId) : null;
  const factoryFabric =
    item?.fabricChoice?.factoryFabricId != null
      ? ordersApi.getFactoryFabricById(item.fabricChoice.factoryFabricId)
      : null;

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Orders & <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Quotations</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">Orders and quotation requests from the shop. Filter by request vs order and by sample vs order.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:flex-initial">
            <div className="relative flex-1 lg:w-80 max-w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Order ID / Customer..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsAddOrderOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-[22px] font-black text-xs tracking-widest uppercase shadow-lg shadow-primary/20 hover:opacity-90 whitespace-nowrap"
            >
              <Plus size={20} /> Add order
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-center mr-1">Status:</span>
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value as DisplayStatus | "All")}
                className={cn(
                  "px-5 py-2.5 rounded-[22px] border text-sm font-bold uppercase tracking-widest transition-all",
                  statusFilter === opt.value
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white border-slate-100 text-slate-500 hover:border-primary/30"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-center mr-1">Category:</span>
            {requestVsOrderOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRequestVsOrderFilter(opt.value)}
                className={cn(
                  "px-4 py-2 rounded-xl border text-xs font-bold uppercase transition-all",
                  requestVsOrderFilter === opt.value
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                )}
              >
                {opt.label}
              </button>
            ))}
            <span className="text-slate-300 mx-1">|</span>
            {orderTypeCategoryOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOrderTypeCategoryFilter(opt.value)}
                className={cn(
                  "px-4 py-2 rounded-xl border text-xs font-bold uppercase transition-all",
                  orderTypeCategoryFilter === opt.value
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order / Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fabric source</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map((order) => {
                  const cust = authApi.getUserById(order.userId);
                  const displayStatus = mapToDisplayStatus(order.status);
                  const firstItem = order.items[0];
                  const orderType = firstItem?.fabricChoice?.orderType ?? "order";
                  const fabricSourceType = firstItem?.fabricChoice?.fabricSource;
                  const isQuot = order.id.startsWith("quot-") || fabricSourceType === "customer" || fabricSourceType === "not_sure";
                  return (
                    <tr
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailOpen(true);
                      }}
                      className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 tracking-tight uppercase">{order.id}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200">
                            {(cust?.name ?? order.userId)[0]}
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-700 uppercase leading-none">{cust?.name ?? order.userId}</span>
                            <span className="block text-[9px] font-bold text-slate-400">{cust?.email ?? "—"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-slate-50 text-slate-600 border-slate-100">
                          {orderTypeLabel(orderType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-black text-slate-600 uppercase">
                            {fabricSourceType ? fabricSourceLabel(fabricSourceType) : "—"}
                          </span>
                          {isQuot && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase">
                              <AlertCircle size={12} /> Quotation request
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-900">
                          {order.totalAmount > 0 ? `${order.totalAmount.toLocaleString()} EGP` : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn("px-3 py-1.5 rounded-full text-[9px] font-black uppercase border", getStatusColor(displayStatus))}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-3 bg-white rounded-2xl text-slate-300 hover:text-primary transition-all shadow-sm border border-slate-100">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="p-32 flex flex-col items-center justify-center text-slate-300">
              <ShoppingBag size={80} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">No orders match the filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Order detail sheet – full breakdown from form */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl p-0 border-none flex flex-col bg-slate-50 overflow-y-auto">
          {selectedOrder && item && (
            <>
              <div className="bg-white p-8 border-b border-slate-100 sticky top-0 z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedOrder.id}</h2>
                    <p className="text-slate-500 text-sm mt-1">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase border", getStatusColor(mapToDisplayStatus(selectedOrder.status)))}>
                        {mapToDisplayStatus(selectedOrder.status)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-slate-100 text-slate-600 border-slate-200">
                        {orderTypeLabel(item.fabricChoice.orderType)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-slate-100 text-slate-600 border-slate-200">
                        {fabricSourceLabel(item.fabricChoice.fabricSource)}
                      </span>
                      {(isQuotation || waitsQuotation) && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                          <AlertCircle size={12} /> Waiting for quotation
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={openEdit} className="p-2 hover:bg-slate-100 rounded-full text-slate-600" title="Edit order">
                      <Pencil size={20} />
                    </button>
                    <button type="button" onClick={handleDeleteOrder} className="p-2 hover:bg-red-50 rounded-full text-red-500" title="Delete order">
                      <Trash2 size={20} />
                    </button>
                    <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                      <X size={24} />
                    </button>
                  </div>
                </div>
              </div>

              {isEditOpen && (
                <div className="mx-8 mt-4 p-4 rounded-xl bg-white border-2 border-primary/20 space-y-4">
                  <h4 className="text-sm font-black text-slate-700 uppercase">Edit order</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Quantity (m)</label>
                      <input type="number" min={1} value={editQuantity} onChange={(e) => setEditQuantity(Number(e.target.value) || 1)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Status</label>
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as ApiOrderStatus)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                        <option value="SUBMITTED">Pending</option>
                        <option value="IN_PRODUCTION">In Progress</option>
                        <option value="COMPLETED">Done</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Notes</label>
                    <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600">Cancel</button>
                    <button type="button" onClick={handleSaveEdit} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold">Save changes</button>
                  </div>
                </div>
              )}

              <div className="flex-1 p-8 space-y-6">
                {/* Customer */}
                <section className="bg-white p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Users size={14} /> Customer
                  </h3>
                  <p className="font-bold text-slate-900">{customer?.name ?? selectedOrder.userId}</p>
                  <p className="text-sm text-slate-500">{customer?.email ?? "—"}</p>
                </section>

                {/* Design – show all sources with preview, view, download */}
                <section className="bg-white p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Layers size={14} /> Design
                  </h3>
                  <p className="text-sm text-slate-700 mb-4">
                    Source: <span className="font-bold uppercase">{item.designChoice.source.replace(/_/g, " ")}</span>
                    {item.designChoice.presetId && (
                      <> · {ordersApi.getPresetById(item.designChoice.presetId)?.name ?? item.designChoice.presetId}</>
                    )}
                    {item.designChoice.uploadFileName && <> · {item.designChoice.uploadFileName}</>}
                    {item.designChoice.repeatOrderId && <> · Repeat of order {item.designChoice.repeatOrderId}</>}
                    {item.designChoice.myLibraryDesignId && (
                      <> · {item.myLibraryDesignSnapshot?.name ?? item.designChoice.myLibraryDesignId}</>
                    )}
                  </p>

                  <div className="space-y-4">
                    {/* Existing (preset) */}
                    {item.designChoice.source === "existing" && item.designChoice.presetId && (() => {
                      const preset = ordersApi.getPresetById(item.designChoice.presetId!);
                      if (!preset) return null;
                      const imgSrc = typeof preset.imageUrl === "string" ? preset.imageUrl : (preset as { imageUrl: string }).imageUrl;
                      return (
                        <div className="flex flex-wrap items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-28 h-28 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                            <img src={imgSrc} alt={preset.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900">{preset.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{preset.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <a href={imgSrc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90">
                                <ExternalLink size={14} /> View full size
                              </a>
                              <a href={imgSrc} download={preset.name.replace(/\s+/g, "-") + ".jpg"} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50">
                                <Download size={14} /> Download
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Upload – all files */}
                    {(item.designChoice.source === "upload" && (item.uploadSnapshots?.length ? item.uploadSnapshots : item.designChoice.uploadFileName)) && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uploaded design(s)</p>
                        {item.uploadSnapshots && item.uploadSnapshots.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {item.uploadSnapshots.map((snap, idx) => (
                              <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white">
                                  <img src={snap.dataUrl} alt={snap.fileName} className="w-full h-full object-contain" />
                                </div>
                                <p className="text-xs font-bold text-slate-700 truncate" title={snap.fileName}>{snap.fileName}</p>
                                <div className="flex gap-2">
                                  <a href={snap.dataUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold hover:opacity-90">
                                    <ExternalLink size={12} /> View
                                  </a>
                                  <a href={snap.dataUrl} download={snap.fileName} className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold hover:bg-slate-50">
                                    <Download size={12} /> Save
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">File(s): {item.designChoice.uploadFileName} (no preview stored for this order)</p>
                        )}
                      </div>
                    )}

                    {/* My library – design with repeat & fabric reflected */}
                    {item.designChoice.source === "my_library" && (item.myLibraryDesignSnapshot ?? item.designChoice.myLibraryDesignId) && (() => {
                      const snapshot = item.myLibraryDesignSnapshot;
                      const name = snapshot?.name ?? userDesignsApi.getDesignById(selectedOrder!.userId, item.designChoice.myLibraryDesignId!)?.name ?? item.designChoice.myLibraryDesignId;
                      const imageUrl = snapshot?.imageDataUrl;
                      if (!imageUrl) return <p className="text-sm text-slate-500">My library: {name}</p>;
                      const repeatType = snapshot?.repeatType;
                      const fabricChoice = snapshot?.fabricChoice;
                      const tileSize = snapshot?.tileSize ?? 56;
                      const repeatLabel = repeatType === "full_drop" ? "Full drop" : repeatType === "half_drop" ? "Half drop" : repeatType === "centre" ? "Centre" : repeatType === "mirror" ? "Mirror" : null;
                      return (
                        <div className="flex flex-wrap items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-28 h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            <PatternThumbnail imageDataUrl={imageUrl} repeatType={repeatType} tileSize={tileSize} className="min-w-full min-h-full rounded-lg" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900">{name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Customer’s Design Studio design</p>
                            {(repeatLabel || fabricChoice) && (
                              <p className="text-xs text-slate-600 mt-1">
                                {[repeatLabel, fabricChoice].filter(Boolean).join(" · ")}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90">
                                <ExternalLink size={14} /> View full size
                              </a>
                              <a href={imageUrl} download={(name || "pattern").replace(/\s+/g, "-") + ".png"} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50">
                                <Download size={14} /> Download
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Repeat */}
                    {item.designChoice.source === "repeat" && item.designChoice.repeatOrderId && (() => {
                      const repeatedOrder = ordersApi.getOrderById(item.designChoice.repeatOrderId!);
                      const repeatedItem = repeatedOrder?.items?.[0];
                      const hasSnapshot = repeatedItem?.myLibraryDesignSnapshot ?? (repeatedItem?.uploadSnapshots?.length ?? 0) > 0;
                      const preset = repeatedItem?.designChoice?.presetId ? ordersApi.getPresetById(repeatedItem.designChoice.presetId) : null;
                      return (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="font-bold text-slate-900">Repeat of order {item.designChoice.repeatOrderId}</p>
                          {repeatedOrder && (preset || repeatedItem?.myLibraryDesignSnapshot || (repeatedItem?.uploadSnapshots?.length ?? 0) > 0) ? (
                            <div className="mt-3 flex flex-wrap gap-3">
                              {preset && (
                                <div className="flex items-center gap-2">
                                  <img src={typeof preset.imageUrl === "string" ? preset.imageUrl : (preset as { imageUrl: string }).imageUrl} alt={preset.name} className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                                  <span className="text-xs font-bold text-slate-600">{preset.name}</span>
                                </div>
                              )}
                              {repeatedItem?.myLibraryDesignSnapshot?.imageDataUrl && (
                                <div className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0" title={repeatedItem.myLibraryDesignSnapshot.name}>
                                  <PatternThumbnail imageDataUrl={repeatedItem.myLibraryDesignSnapshot.imageDataUrl} repeatType={repeatedItem.myLibraryDesignSnapshot.repeatType} tileSize={repeatedItem.myLibraryDesignSnapshot.tileSize ?? 28} className="min-w-full min-h-full" />
                                </div>
                              )}
                              {repeatedItem?.uploadSnapshots?.slice(0, 3).map((s, i) => (
                                <img key={i} src={s.dataUrl} alt={s.fileName} className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 mt-1">Original order design not available in this view.</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </section>

                {/* Fabric & quantity */}
                <section className="bg-white p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Package size={14} /> Fabric & quantity
                  </h3>
                  <p className="text-sm text-slate-700">
                    Type: <span className="font-bold uppercase">{item.fabricChoice.fabricType}</span>
                    {" · "}
                    Source: <span className="font-bold">{fabricSourceLabel(item.fabricChoice.fabricSource)}</span>
                  </p>
                  {factoryFabric && (
                    <p className="text-sm text-slate-700 mt-1">
                      Factory fabric: {factoryFabric.name} · {item.quantity} m · {item.unitPrice} EGP/m
                    </p>
                  )}
                  {item.fabricChoice.fabricSource === "customer" && item.fabricChoice.customerNotes && (
                    <p className="text-sm text-slate-600 mt-1">Notes: {item.fabricChoice.customerNotes}</p>
                  )}
                  {item.fabricChoice.fabricSource === "not_sure" && item.fabricChoice.inquiry && (
                    <p className="text-sm text-slate-600 mt-1">Inquiry: {item.fabricChoice.inquiry}</p>
                  )}
                  <p className="font-bold text-slate-900 mt-2">Quantity: {item.quantity} m</p>
                </section>

                {/* Payment */}
                {!isQuotation && (
                  <section className="bg-white p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Banknote size={14} /> Payment
                    </h3>
                    <p className="text-sm text-slate-700">
                      Method: <span className="font-bold uppercase">{selectedOrder.paymentMethod ?? "—"}</span>
                    </p>
                    <p className="font-bold text-slate-900 mt-1">Total: {selectedOrder.totalAmount.toLocaleString()} EGP</p>
                  </section>
                )}

                {/* Notes */}
                {item.notes && (
                  <section className="bg-white p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FileText size={14} /> Notes
                    </h3>
                    <p className="text-sm text-slate-700">{item.notes}</p>
                  </section>
                )}

                {/* Send quotation (Email / WhatsApp) – customizable */}
                {(isQuotation || waitsQuotation) && (
                  <section className="bg-white p-6 rounded-2xl border-2 border-amber-100">
                    <h3 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Mail size={14} /> Send quotation
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Customize the message below, then send by email or WhatsApp.</p>
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setQuotationChannel("email")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all",
                          quotationChannel === "email" ? "bg-primary text-white border-primary" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/50"
                        )}
                      >
                        <Mail size={16} /> Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuotationChannel("whatsapp")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all",
                          quotationChannel === "whatsapp" ? "bg-green-600 text-white border-green-600" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-green-500/30"
                        )}
                      >
                        <MessageCircle size={16} /> WhatsApp
                      </button>
                    </div>

                    {quotationChannel === "email" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To</label>
                          <p className="text-sm font-medium text-slate-700 mt-0.5">{customer?.email ?? "—"}</p>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject (editable)</label>
                          <input
                            type="text"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            placeholder="Quotation subject"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message (editable)</label>
                          <textarea
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            rows={8}
                            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-y"
                            placeholder="Email body"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={handleOpenMail} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90">
                            <ExternalLink size={16} /> Open in email client
                          </button>
                          <button type="button" onClick={handleCopyEmail} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">
                            <Copy size={16} /> {copied ? "Copied!" : "Copy to clipboard"}
                          </button>
                        </div>
                      </div>
                    )}

                    {quotationChannel === "whatsapp" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp number (with country code, no +)</label>
                          <input
                            type="tel"
                            value={whatsappPhone}
                            onChange={(e) => { setWhatsappPhone(e.target.value); setWhatsappError(""); }}
                            className={cn("w-full mt-1 px-3 py-2 rounded-lg border text-sm", whatsappError ? "border-red-300 bg-red-50/50" : "border-slate-200")}
                            placeholder="e.g. 201234567890"
                          />
                          {whatsappError && <p className="text-xs text-red-600 mt-1 font-medium">{whatsappError}</p>}
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message (editable)</label>
                          <textarea
                            value={whatsappMessage}
                            onChange={(e) => setWhatsappMessage(e.target.value)}
                            rows={6}
                            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-y"
                            placeholder="WhatsApp message"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={handleOpenWhatsApp} className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:opacity-90">
                            <ExternalLink size={16} /> Open WhatsApp
                          </button>
                          <button type="button" onClick={handleCopyWhatsApp} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">
                            <Copy size={16} /> {copied ? "Copied!" : "Copy message"}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-end gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quotation amount (EGP)</label>
                        <input
                          type="text"
                          value={quotationAmount}
                          onChange={(e) => setQuotationAmount(e.target.value)}
                          className="w-32 mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          placeholder="e.g. 500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validity</label>
                        <input
                          type="text"
                          value={quotationValidity}
                          onChange={(e) => setQuotationValidity(e.target.value)}
                          className="w-32 mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          placeholder="e.g. 7 days"
                        />
                      </div>
                      <button type="button" onClick={refreshQuotationTemplates} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
                        Refresh template with amount & validity
                      </button>
                    </div>
                  </section>
                )}

                {/* Status update (admin) */}
                <section className="bg-white p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Tag size={14} /> Update status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["SUBMITTED", "Pending"],
                        ["IN_PRODUCTION", "In Progress"],
                        ["COMPLETED", "Done"],
                        ["CANCELLED", "Cancelled"],
                      ] as const
                    ).map(([status, label]) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedOrder.id, status)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-all",
                          selectedOrder.status === status
                            ? "bg-primary text-white border-primary"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/50"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteConfirmOrder} onOpenChange={(open) => !open && setDeleteConfirmOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete order {deleteConfirmOrder?.id}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOrder} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add order (admin) */}
      <Sheet open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <h3 className="text-lg font-black text-slate-900 uppercase mb-4">Add order</h3>
          <p className="text-sm text-slate-500 mb-6">Create an order manually (e.g. phone or offline).</p>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</label>
              <select value={addUserId} onChange={(e) => setAddUserId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                <option value="">Select customer</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design (preset)</label>
              <select value={addPresetId} onChange={(e) => setAddPresetId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                <option value="">Select design</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fabric type</label>
                <select value={addFabricType} onChange={(e) => setAddFabricType(e.target.value as "sublimation" | "natural")} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="sublimation">Sublimation</option>
                  <option value="natural">Natural</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order type</label>
                <select value={addOrderType} onChange={(e) => setAddOrderType(e.target.value as "sample" | "order")} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="sample">Sample</option>
                  <option value="order">Order</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fabric source</label>
              <select value={addFabricSource} onChange={(e) => setAddFabricSource(e.target.value as "customer" | "factory" | "not_sure")} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                <option value="factory">Factory Provides</option>
                <option value="customer">I Provide</option>
                <option value="not_sure">Not Sure</option>
              </select>
            </div>
            {addFabricSource === "factory" && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Factory fabric</label>
                <select value={addFactoryFabricId} onChange={(e) => setAddFactoryFabricId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="">Select fabric</option>
                  {factoryFabricsList.filter((f) => f.type === addFabricType).map((f) => (
                    <option key={f.id} value={f.id}>{f.name} – {f.pricePerMeter} EGP/m</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity (m)</label>
              <input type="number" min={1} value={addQuantity} onChange={(e) => setAddQuantity(Number(e.target.value) || 1)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
              <textarea value={addNotes} onChange={(e) => setAddNotes(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" placeholder="Optional" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial status</label>
              <select value={addStatus} onChange={(e) => setAddStatus(e.target.value as ApiOrderStatus)} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                <option value="SUBMITTED">Pending</option>
                <option value="IN_PRODUCTION">In Progress</option>
                <option value="COMPLETED">Done</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={() => setIsAddOrderOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600">Cancel</button>
              <button type="button" onClick={handleAddOrder} disabled={!addUserId || !addPresetId} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-50">Create order</button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <style>{`
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </ManagementLayout>
  );
};

export default Orders;
