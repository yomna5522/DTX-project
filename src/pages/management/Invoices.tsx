import React, { useState, useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { 
  FileText, 
  Search, 
  ChevronRight, 
  Printer, 
  Download, 
  Mail, 
  CheckCircle2, 
  Clock, 
  X,
  Plus,
  Eye,
  Trash2,
  ArrowRight,
  Calculator,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { billingApi } from "@/api/billing";
import { productionApi } from "@/api/production";
import { downloadInvoicePdf } from "@/services/invoicePdf";
import type { InvoiceDocument, InvoiceLineItem } from "@/types/billing";

const Invoices = () => {
  const [refresh, setRefresh] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Create sheet
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createCustomer, setCreateCustomer] = useState("");
  const [createFrom, setCreateFrom] = useState("");
  const [createTo, setCreateTo] = useState("");
  const [createDiscount, setCreateDiscount] = useState(3);
  const [createVat, setCreateVat] = useState(14);
  const [createNotes, setCreateNotes] = useState("");

  // Preview sheet
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<InvoiceDocument | null>(null);

  // Data
  const allInvoices = useMemo(() => billingApi.getAllInvoices(), [refresh]);
  const customers = useMemo(() => productionApi.getAllCustomerEntities(), [refresh]);

  // Draft preview (live as user changes params)
  const draft = useMemo(() => {
    if (!createCustomer || !createFrom || !createTo) return null;
    return billingApi.buildDraft({
      customerEntityId: createCustomer,
      from: createFrom,
      to: createTo,
      discountPct: createDiscount,
      vatPct: createVat,
    });
  }, [createCustomer, createFrom, createTo, createDiscount, createVat, refresh]);

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return allInvoices;
    const q = searchTerm.toLowerCase();
    return allInvoices.filter(
      (inv) =>
        inv.id.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        `${inv.customerName}.${inv.billNumber}`.toLowerCase().includes(q)
    );
  }, [allInvoices, searchTerm]);

  // Stats
  const totalReceivables = useMemo(() => billingApi.totalReceivables(), [refresh]);
  const totalCollected = useMemo(() => billingApi.totalCollected(), [refresh]);

  // ── Handlers ──────────────────────────────────────────────
  const openCreate = () => {
    setCreateCustomer(customers[0]?.id ?? "");
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    setCreateFrom(monthStart.toISOString().split("T")[0]);
    setCreateTo(now.toISOString().split("T")[0]);
    setCreateDiscount(3);
    setCreateVat(14);
    setCreateNotes("");
    setIsCreateOpen(true);
  };

  const handleCreate = () => {
    if (!createCustomer || !draft || draft.lines.length === 0) return;
    const inv = billingApi.createInvoice({
      customerEntityId: createCustomer,
      from: createFrom,
      to: createTo,
      discountPct: createDiscount,
      vatPct: createVat,
      notes: createNotes || undefined,
    });
    setIsCreateOpen(false);
    setPreviewInvoice(inv);
    setIsPreviewOpen(true);
    setRefresh((r) => r + 1);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    billingApi.deleteInvoice(deleteTarget.id);
    setDeleteTarget(null);
    setRefresh((r) => r + 1);
  };

  const handleMarkPaid = (inv: InvoiceDocument) => {
    billingApi.updateInvoiceStatus(inv.id, "PAID");
    setRefresh((r) => r + 1);
    if (previewInvoice?.id === inv.id) {
      setPreviewInvoice({ ...inv, status: "PAID" });
    }
  };

  const custName = (id: string) =>
    customers.find((c) => c.id === id)?.displayName ?? id;

  const statusColor = (status: InvoiceDocument["status"]) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "ISSUED":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "DRAFT":
        return "bg-slate-50 text-slate-500 border-slate-100";
      case "CANCELLED":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Billing{" "}
              <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">
                Vault
              </span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">
              Auto-generate invoices from approved production runs.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                placeholder="Invoice # / Customer..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
            <button
              onClick={openCreate}
              className="bg-primary text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 uppercase whitespace-nowrap"
            >
              <Plus size={20} />
              <span className="hidden lg:inline">New Invoice</span>
             </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Total Receivables
            </p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tighter">
              {totalReceivables.toLocaleString()}{" "}
              <span className="text-xs">EGP</span>
            </h4>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Total Collected
            </p>
            <h4 className="text-2xl font-black text-emerald-500 tracking-tighter">
              {totalCollected.toLocaleString()}{" "}
              <span className="text-xs font-black text-emerald-400">EGP</span>
            </h4>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Invoices Issued
            </p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tighter">
              {allInvoices.length}
            </h4>
           </div>
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Approved Runs (unbilled)
            </p>
            <h4 className="text-2xl font-black text-amber-600 tracking-tighter">
              {productionApi.getRunsByStatus("APPROVED").length}
            </h4>
           </div>
        </div>

        {/* Invoice list */}
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Bill #
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Period
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
              {filteredInvoices.map((inv) => (
                   <tr 
                     key={inv.id} 
                  className="hover:bg-slate-50/70 transition-all group cursor-pointer"
                     onClick={() => {
                    setPreviewInvoice(inv);
                        setIsPreviewOpen(true);
                     }}
                   >
                  <td className="px-8 py-6">
                         <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        {inv.customerName}.{inv.billNumber}
                      </span>
                      <span className="text-[9px] font-black text-primary uppercase mt-0.5 tracking-widest">
                        {inv.id}
                      </span>
                         </div>
                      </td>
                  <td className="px-8 py-6 uppercase tracking-widest text-xs text-slate-700">
                    {inv.customerName}
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-400 font-black">
                    {inv.periodStart} → {inv.periodEnd}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-lg font-black text-slate-900 tracking-tighter">
                      {inv.total.toLocaleString()}{" "}
                      <span className="text-[10px] text-slate-400">EGP</span>
                    </span>
                      </td>
                  <td className="px-8 py-6 text-center">
                    <span
                      className={cn(
                           "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        statusColor(inv.status)
                      )}
                    >
                            {inv.status}
                         </span>
                      </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {inv.status === "ISSUED" && (
                        <button
                          onClick={() => handleMarkPaid(inv)}
                          className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-all"
                          title="Mark as Paid"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(inv)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setPreviewInvoice(inv);
                          setIsPreviewOpen(true);
                        }}
                        className="p-3 bg-white rounded-2xl text-slate-200 border border-slate-100 group-hover:text-primary group-hover:border-primary/20 transition-all shadow-sm"
                      >
                            <ChevronRight size={18} />
                         </button>
                    </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
          {filteredInvoices.length === 0 && (
            <div className="p-24 flex flex-col items-center justify-center text-slate-300">
              <FileText size={64} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">No invoices yet</p>
              <button
                onClick={openCreate}
                className="mt-6 px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest"
              >
                Generate first invoice
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Invoice Sheet ────────────────────────────── */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-full sm:max-w-3xl p-0 border-none flex flex-col bg-slate-50 overflow-y-auto">
          <div className="bg-slate-900 p-10 text-white">
            <SheetHeader>
              <SheetTitle className="text-2xl font-black uppercase tracking-tighter text-white">
                Generate Invoice
              </SheetTitle>
              <SheetDescription className="text-slate-400 font-bold text-sm">
                Select customer and date range to auto-aggregate approved production runs.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 p-8 space-y-8">
            {/* Params */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Customer
                </label>
                <select
                  value={createCustomer}
                  onChange={(e) => setCreateCustomer(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  placeholder="e.g. July 2025 cycle"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  From
                </label>
                <input
                  type="date"
                  value={createFrom}
                  onChange={(e) => setCreateFrom(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  To
                </label>
                <input
                  type="date"
                  value={createTo}
                  onChange={(e) => setCreateTo(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Discount %
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={createDiscount}
                  onChange={(e) => setCreateDiscount(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  VAT %
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={createVat}
                  onChange={(e) => setCreateVat(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                />
              </div>
            </div>

            {/* Draft preview */}
            {draft && draft.lines.length > 0 ? (
              <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calculator size={14} /> Invoice Preview ({draft.lines.length} line
                    {draft.lines.length > 1 ? "s" : ""})
                  </h4>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">
                        Design
                      </th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">
                        Fabric
                      </th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase text-center">
                        Meters (LM)
                      </th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase text-center">
                        Rate (EGP)
                      </th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {draft.lines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          {line.designRef}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">
                          {line.fabric}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center">
                          {line.totalMeters}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600 text-center">
                          {line.pricePerMeter}
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">
                          {line.lineTotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="border-t border-slate-100 p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-500">Subtotal</span>
                    <span className="font-black text-slate-900">
                      {draft.subtotal.toLocaleString()} EGP
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-500">
                      Discount ({draft.discountPct}%)
                    </span>
                    <span className="font-bold text-red-500">
                      -{draft.discountAmount.toLocaleString()} EGP
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-500">After discount</span>
                    <span className="font-black text-slate-900">
                      {draft.afterDiscount.toLocaleString()} EGP
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-500">VAT ({draft.vatPct}%)</span>
                    <span className="font-bold text-slate-600">
                      +{draft.vatAmount.toLocaleString()} EGP
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Grand Total
                    </span>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">
                      {draft.total.toLocaleString()}{" "}
                      <span className="text-xs">EGP</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : draft && draft.lines.length === 0 ? (
              <div className="bg-white rounded-[30px] border border-slate-100 p-12 flex flex-col items-center text-slate-300">
                <FileText size={48} className="mb-3" />
                <p className="text-xs font-black uppercase tracking-widest">
                  No approved production runs in this range
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Approve runs in the Production Log first, then generate an invoice.
                </p>
              </div>
            ) : null}
          </div>

          <div className="p-8 border-t border-slate-100 bg-white flex gap-3">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-xs text-slate-500 uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!draft || draft.lines.length === 0}
              className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <FileText size={18} /> Issue Invoice
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Invoice Preview Sheet ───────────────────────────── */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent className="w-full sm:max-w-4xl p-0 border-none flex flex-col bg-slate-100">
          {previewInvoice && (
             <>
               <div className="bg-slate-900 p-8 flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-10 pointer-events-none" />
                  <div className="flex items-center gap-4 relative z-10 text-white">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <FileText size={24} className="text-primary" />
                     </div>
                  <span className="text-xs font-black uppercase tracking-[0.3em]">
                    {previewInvoice.customerName}.{previewInvoice.billNumber} PREVIEW
                  </span>
                  </div>
                  <div className="flex gap-3 relative z-10">
                  <button
                    onClick={() => downloadInvoicePdf(previewInvoice)}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                    title="Download PDF"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-3 bg-rose-500/20 hover:bg-rose-500 text-white rounded-xl transition-all ml-4"
                  >
                    <X size={20} />
                  </button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-12 bg-slate-100">
                {/* Branded invoice */}
                <div className="bg-white shadow-2xl rounded-[40px] overflow-hidden max-w-3xl mx-auto flex flex-col min-h-[900px]">
                  {/* Header */}
                     <div className="p-16 border-b-8 border-primary bg-slate-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 grayscale pointer-events-none transform rotate-12">
                           <LayoutGrid size={200} />
                        </div>
                        <div className="flex justify-between items-start relative z-10">
                           <div className="space-y-6">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">
                          DTX <span className="text-primary not-italic">PRINTING</span> Center
                        </h2>
                              <div className="text-[10px] font-bold text-slate-400 flex flex-col gap-1 uppercase tracking-widest">
                                 <span>Industrial Zone A, 4th Industrial City</span>
                                 <span>Cairo, Egypt</span>
                                 <span>tax id: 990-221-440</span>
                              </div>
                           </div>
                           <div className="text-right space-y-2">
                        <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tighter opacity-10">
                          INVOICE
                        </h1>
                        <p className="text-xl font-black text-slate-900 uppercase tracking-widest">
                          {previewInvoice.customerName}.{previewInvoice.billNumber}
                        </p>
                           </div>
                        </div>
                     </div>

                     <div className="p-16 space-y-16 flex-1">
                    {/* Bill To */}
                        <div className="grid grid-cols-2 gap-20">
                           <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] border-b border-primary/10 pb-2">
                          Bill Recipient
                        </h5>
                        <p className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                          {previewInvoice.customerName}
                        </p>
                           </div>
                           <div className="flex justify-end">
                              <div className="space-y-6 text-right w-64">
                                 <div className="grid grid-cols-2 gap-4">
                            <div className="text-[9px] font-black text-slate-300 uppercase">
                              Period
                            </div>
                            <div className="text-xs font-black text-slate-900">
                              {previewInvoice.periodStart} — {previewInvoice.periodEnd}
                            </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                            <div className="text-[9px] font-black text-slate-300 uppercase">
                              Issued
                            </div>
                            <div className="text-xs font-black text-slate-900">
                              {new Date(previewInvoice.createdAt).toLocaleDateString()}
                            </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                            <div className="text-[9px] font-black text-slate-300 uppercase">
                              Status
                            </div>
                            <div
                              className={cn(
                                       "text-[10px] font-black uppercase tracking-widest",
                                previewInvoice.status === "PAID"
                                  ? "text-emerald-500"
                                  : "text-blue-500"
                              )}
                            >
                              {previewInvoice.status}
                            </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-6">
                           <table className="w-full text-left">
                              <thead>
                                 <tr className="border-b-2 border-slate-900">
                            <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                              Design / Fabric
                            </th>
                            <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">
                              Meters (LM)
                            </th>
                            <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">
                              Rate (EGP/m)
                            </th>
                            <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">
                              Total
                            </th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                          {previewInvoice.lines.map((line, idx) => (
                                   <tr key={idx}>
                              <td className="py-6">
                                <span className="font-black text-slate-900 uppercase tracking-tight text-sm">
                                  {line.designRef}
                                </span>
                                <span className="block text-xs text-slate-500 mt-0.5">
                                  {line.fabric}
                                </span>
                              </td>
                              <td className="py-6 text-center font-bold text-slate-500">
                                {line.totalMeters} LM
                              </td>
                              <td className="py-6 text-center font-bold text-slate-500">
                                {line.pricePerMeter.toLocaleString()}
                              </td>
                              <td className="py-6 text-right font-black text-slate-900 text-lg tracking-tighter">
                                {line.lineTotal.toLocaleString()} EGP
                              </td>
                                   </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>

                    {/* Totals */}
                        <div className="flex justify-end pt-16">
                           <div className="w-80 space-y-6">
                              <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                                 <span>Net Subtotal</span>
                          <span className="text-slate-900 font-bold">
                            {previewInvoice.subtotal.toLocaleString()} EGP
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                          <span>Discount ({previewInvoice.discountPct}%)</span>
                          <span className="text-red-500 font-bold">
                            -{previewInvoice.discountAmount.toLocaleString()} EGP
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                          <span>After discount</span>
                          <span className="text-slate-900 font-bold">
                            {previewInvoice.afterDiscount.toLocaleString()} EGP
                          </span>
                              </div>
                              <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                          <span>VAT ({previewInvoice.vatPct}%)</span>
                          <span className="text-slate-900 font-bold">
                            +{previewInvoice.vatAmount.toLocaleString()} EGP
                          </span>
                              </div>
                              <div className="flex justify-between items-center py-8 px-8 bg-slate-900 text-white rounded-[30px] shadow-xl shadow-slate-200">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                            Grand Total
                          </span>
                          <span className="text-3xl font-black tracking-tighter">
                            {previewInvoice.total.toLocaleString()}{" "}
                            <span className="text-xs font-black">EGP</span>
                          </span>
                              </div>
                           </div>
                        </div>
                     </div>

                  {/* Footer branding */}
                     <div className="p-16 flex justify-between items-center bg-slate-50 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                        <span>Thank you for choosing DTX Group Egypt</span>
                        <span className="text-primary opacity-20 italic">Validated Ledger Copy</span>
                     </div>
                  </div>
               </div>
             </>
           )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete invoice {deleteTarget?.customerName}.{deleteTarget?.billNumber}? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </ManagementLayout>
  );
};

export default Invoices;
