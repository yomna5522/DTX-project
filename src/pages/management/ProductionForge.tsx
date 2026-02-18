import React, { useState, useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Printer,
  Trash2,
  Pencil,
  X,
  ChevronDown,
  Filter,
  CheckSquare,
  Square,
  ArrowRight,
  Calendar,
  Layers,
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
import { productionApi } from "@/api/production";
import type { ProductionRun, ProductionBillingStatus } from "@/types/production";

type StatusFilter = "All" | ProductionBillingStatus;

const statusColors: Record<ProductionBillingStatus, string> = {
  DRAFT: "bg-slate-50 text-slate-600 border-slate-100",
  APPROVED: "bg-amber-50 text-amber-600 border-amber-100",
  INVOICED: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

const statusLabels: Record<ProductionBillingStatus, string> = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  INVOICED: "Invoiced",
};

const ProductionForge = () => {
  const [refresh, setRefresh] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [customerFilter, setCustomerFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sheet state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRun, setEditingRun] = useState<ProductionRun | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductionRun | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formMachine, setFormMachine] = useState("");
  const [formCustomer, setFormCustomer] = useState("");
  const [formDesignRef, setFormDesignRef] = useState("");
  const [formFabric, setFormFabric] = useState("");
  const [formMeters, setFormMeters] = useState<number>(0);
  const [formNotes, setFormNotes] = useState("");
  const [formOrderId, setFormOrderId] = useState("");

  // Data
  const allRuns = useMemo(() => productionApi.getAllRuns(), [refresh]);
  const customers = useMemo(() => productionApi.getAllCustomerEntities(), [refresh]);
  const machines = productionApi.getMachines();
  const commonFabrics = productionApi.getCommonFabrics();

  // Filters
  const filteredRuns = useMemo(() => {
    return allRuns.filter((r) => {
      if (statusFilter !== "All" && r.billingStatus !== statusFilter) return false;
      if (customerFilter && r.customerEntityId !== customerFilter) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const cust = customers.find((c) => c.id === r.customerEntityId);
        const custName = cust?.displayName?.toLowerCase() ?? "";
        if (
          !r.designRef.toLowerCase().includes(q) &&
          !r.fabric.toLowerCase().includes(q) &&
          !r.machine.toLowerCase().includes(q) &&
          !custName.includes(q) &&
          !r.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [allRuns, statusFilter, customerFilter, dateFrom, dateTo, searchTerm, customers]);

  // Stats
  const totalMeters = filteredRuns.reduce((s, r) => s + r.metersPrinted, 0);
  const draftCount = filteredRuns.filter((r) => r.billingStatus === "DRAFT").length;
  const approvedCount = filteredRuns.filter((r) => r.billingStatus === "APPROVED").length;
  const invoicedCount = filteredRuns.filter((r) => r.billingStatus === "INVOICED").length;

  // ── Handlers ──────────────────────────────────────────────
  const resetForm = () => {
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormMachine(machines[0] ?? "");
    setFormCustomer(customers[0]?.id ?? "");
    setFormDesignRef("");
    setFormFabric("");
    setFormMeters(0);
    setFormNotes("");
    setFormOrderId("");
  };

  const openAdd = () => {
    setEditingRun(null);
    resetForm();
    setIsAddOpen(true);
  };

  const openEdit = (run: ProductionRun) => {
    setEditingRun(run);
    setFormDate(run.date);
    setFormMachine(run.machine);
    setFormCustomer(run.customerEntityId);
    setFormDesignRef(run.designRef);
    setFormFabric(run.fabric);
    setFormMeters(run.metersPrinted);
    setFormNotes(run.notes);
    setFormOrderId(run.sourceOrderId ?? "");
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (!formCustomer || !formDesignRef || !formFabric || formMeters <= 0) return;
    if (editingRun) {
      productionApi.updateRun(editingRun.id, {
        date: formDate,
        machine: formMachine,
        customerEntityId: formCustomer,
        designRef: formDesignRef,
        fabric: formFabric,
        metersPrinted: formMeters,
        notes: formNotes,
        sourceOrderId: formOrderId || undefined,
      });
    } else {
      productionApi.addRun({
        date: formDate,
        machine: formMachine,
        customerEntityId: formCustomer,
        designRef: formDesignRef,
        fabric: formFabric,
        metersPrinted: formMeters,
        notes: formNotes,
        sourceOrderId: formOrderId || undefined,
      });
    }
    setIsAddOpen(false);
    setRefresh((r) => r + 1);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    productionApi.deleteRun(deleteTarget.id);
    setDeleteTarget(null);
    setRefresh((r) => r + 1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const draftIds = filteredRuns.filter((r) => r.billingStatus === "DRAFT").map((r) => r.id);
    if (draftIds.every((id) => selectedIds.has(id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(draftIds));
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.size === 0) return;
    productionApi.approveRuns(Array.from(selectedIds));
    setSelectedIds(new Set());
    setRefresh((r) => r + 1);
  };

  const custName = (id: string) =>
    customers.find((c) => c.id === id)?.displayName ?? id;

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Production{" "}
              <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">
                Log
              </span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">
              Digital production sheet — daily print runs, log and approve. Approved shop orders are added here automatically.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Design / Fabric / Customer..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={openAdd}
              className="bg-primary text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 uppercase whitespace-nowrap"
            >
              <Plus size={20} />
              <span className="hidden lg:inline">Log Run</span>
            </button>
            {allRuns.length > 0 && (
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="p-4 lg:px-6 rounded-[22px] border-2 border-red-100 text-red-600 font-black text-xs tracking-widest hover:bg-red-50 transition-all flex items-center gap-2 uppercase whitespace-nowrap"
              >
                <Trash2 size={18} />
                <span className="hidden lg:inline">Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Clear all confirmation */}
        <AlertDialog open={showClearAllConfirm} onOpenChange={setShowClearAllConfirm}>
          <AlertDialogContent>
            <AlertDialogTitle>Clear all production data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all {allRuns.length} run(s) from the Production Log. This cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  productionApi.clearAllRuns();
                  setSelectedIds(new Set());
                  setRefresh((r) => r + 1);
                  setShowClearAllConfirm(false);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Clear all
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Total Meters
            </p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tighter">
              {totalMeters.toLocaleString()}{" "}
              <span className="text-xs font-black text-slate-400">LM</span>
            </h4>
          </div>
          <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Draft
            </p>
            <h4 className="text-2xl font-black text-slate-500 tracking-tighter">{draftCount}</h4>
          </div>
          <div className="bg-white p-6 rounded-[30px] border border-amber-100 shadow-sm">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
              Approved
            </p>
            <h4 className="text-2xl font-black text-amber-600 tracking-tighter">{approvedCount}</h4>
          </div>
          <div className="bg-white p-6 rounded-[30px] border border-emerald-100 shadow-sm">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
              Invoiced
            </p>
            <h4 className="text-2xl font-black text-emerald-600 tracking-tighter">{invoicedCount}</h4>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Status:
          </span>
          {(["All", "DRAFT", "APPROVED", "INVOICED"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-5 py-2.5 rounded-[22px] border text-xs font-bold uppercase tracking-widest transition-all",
                statusFilter === s
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-white border-slate-100 text-slate-500 hover:border-primary/30"
              )}
            >
              {s === "All" ? "All" : statusLabels[s]}
            </button>
          ))}

          <span className="text-slate-200 mx-1">|</span>

          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-100 text-xs font-bold bg-white"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-100 text-xs font-bold bg-white"
            placeholder="From"
          />
          <span className="text-slate-300 text-xs">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-100 text-xs font-bold bg-white"
            placeholder="To"
          />
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <span className="text-sm font-black text-amber-700">
              {selectedIds.size} run(s) selected
            </span>
            <button
              onClick={handleBulkApprove}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 flex items-center gap-2"
            >
              <CheckCircle2 size={16} /> Approve for Billing
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2.5 bg-white border border-amber-200 text-amber-700 rounded-xl text-xs font-black uppercase hover:bg-amber-100"
            >
              Clear
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-primary">
                      {filteredRuns.filter((r) => r.billingStatus === "DRAFT").length > 0 &&
                      filteredRuns
                        .filter((r) => r.billingStatus === "DRAFT")
                        .every((r) => selectedIds.has(r.id)) ? (
                        <CheckSquare size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Design
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Fabric
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Machine
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Meters
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-4 py-3">
                      {run.billingStatus === "DRAFT" ? (
                        <button
                          onClick={() => toggleSelect(run.id)}
                          className="text-slate-400 hover:text-primary"
                        >
                          {selectedIds.has(run.id) ? (
                            <CheckSquare size={18} className="text-primary" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      ) : (
                        <span className="text-slate-200">
                          <CheckCircle2 size={18} />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-slate-900">{run.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-black text-slate-700 uppercase">
                        {custName(run.customerEntityId)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-slate-700">{run.designRef}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-500">{run.fabric}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-500">{run.machine}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-black text-slate-900">
                        {run.metersPrinted}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[9px] font-black uppercase border",
                          statusColors[run.billingStatus]
                        )}
                      >
                        {statusLabels[run.billingStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {run.billingStatus === "DRAFT" && (
                          <>
                            <button
                              onClick={() => openEdit(run)}
                              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(run)}
                              className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRuns.length === 0 && (
            <div className="p-24 flex flex-col items-center justify-center text-slate-300">
              <Printer size={64} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">
                No production runs match the filter
              </p>
              <button
                onClick={openAdd}
                className="mt-6 px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest"
              >
                Log your first run
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit sheet ────────────────────────────────── */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className="w-full sm:max-w-lg p-0 border-none flex flex-col bg-slate-50 overflow-y-auto">
          <div className="bg-slate-900 p-10 text-white">
            <SheetHeader>
              <SheetTitle className="text-2xl font-black uppercase tracking-tighter text-white">
                {editingRun ? "Edit Production Run" : "Log Production Run"}
              </SheetTitle>
              <SheetDescription className="text-slate-400 font-bold text-sm">
                Record a print job from the factory floor.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 p-8 space-y-6">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
              />
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Customer
              </label>
              <select
                value={formCustomer}
                onChange={(e) => setFormCustomer(e.target.value)}
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

            {/* Machine */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Machine
              </label>
              <select
                value={formMachine}
                onChange={(e) => setFormMachine(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
              >
                <option value="">Select machine</option>
                {machines.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Design ref */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Design Reference
              </label>
              <input
                type="text"
                value={formDesignRef}
                onChange={(e) => setFormDesignRef(e.target.value)}
                placeholder="e.g. Design 1, تصميم ١"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
              />
            </div>

            {/* Fabric */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Fabric
              </label>
              <input
                type="text"
                list="fabric-suggestions"
                value={formFabric}
                onChange={(e) => setFormFabric(e.target.value)}
                placeholder="e.g. كتان 50-50, Waterproof"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
              />
              <datalist id="fabric-suggestions">
                {commonFabrics.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>

            {/* Meters */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Meters Printed (LM)
              </label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={formMeters || ""}
                onChange={(e) => setFormMeters(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Notes (optional)
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white resize-none"
              />
            </div>

            {/* Link to order */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Source Order ID (optional)
              </label>
              <input
                type="text"
                value={formOrderId}
                onChange={(e) => setFormOrderId(e.target.value)}
                placeholder="e.g. ord-1234567890"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
              />
            </div>
          </div>

          <div className="p-8 border-t border-slate-100 bg-white flex gap-3">
            <button
              onClick={() => setIsAddOpen(false)}
              className="flex-1 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-xs text-slate-500 uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formCustomer || !formDesignRef || !formFabric || formMeters <= 0}
              className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 hover:opacity-90 transition-all"
            >
              {editingRun ? "Save Changes" : "Log Run"}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete production run?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete run {deleteTarget?.id} ({deleteTarget?.metersPrinted}m {deleteTarget?.designRef}
              )? This cannot be undone.
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

export default ProductionForge;
