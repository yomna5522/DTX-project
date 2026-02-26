import React, { useState, useEffect, useCallback } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { adminSuppliersApi, type AdminSupplierItem } from "@/api/adminSuppliersApi";
import { adminAuthApi } from "@/api/adminAuth";
import { 
  Plus, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
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
  Trash,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Display type (unified for backend + mock) ---
interface SupplierRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
}

// --- Mock data for non-backend mode ---
const mockSuppliers: SupplierRow[] = [
  { id: "S1", name: "Textile Pro Egypt", email: "m.ali@textilepro.eg", phone: "+20 120 444 5555", balance: 45000 },
  { id: "S2", name: "Ink & Color Chemicals", email: "laila@inkcolor.com", phone: "+20 100 888 9999", balance: 0 },
  { id: "S3", name: "Machine Tech Solutions", email: "i.reda@machinetech.net", phone: "+20 111 222 3333", balance: -5000 },
];

function mapBackendToRow(s: AdminSupplierItem): SupplierRow {
  return {
    id: String(s.id),
    name: s.name,
    email: s.email ?? "",
    phone: s.phone ?? "",
    balance: s.balance,
  };
}

// --- Form validation: required vs optional (convention for all sections) ---
interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

function showFieldError(errors: FormErrors, field: keyof FormErrors) {
  return cn(
    "w-full px-6 py-5 rounded-2xl text-sm font-black transition-all outline-none",
    "focus:ring-4 focus:ring-primary/5",
    errors[field]
      ? "border-2 border-red-500 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500"
      : "bg-slate-50 border-2 border-transparent"
  );
}

const Suppliers = () => {
  const isBackendMode = Boolean(adminAuthApi.getSession());
  const [suppliers, setSuppliers] = useState<SupplierRow[]>(() => (isBackendMode ? [] : mockSuppliers));
  const [loading, setLoading] = useState(isBackendMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRow | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SupplierRow | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [newSupplier, setNewSupplier] = useState({ name: "", email: "", phone: "" });
  const [addErrors, setAddErrors] = useState<FormErrors>({});
  const [addSubmitting, setAddSubmitting] = useState(false);

  const refetch = useCallback(() => {
    if (!isBackendMode) return;
    setLoadError(null);
    setLoading(true);
    adminSuppliersApi
      .getSuppliers()
      .then((list) => setSuppliers(list.map(mapBackendToRow)))
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Failed to load suppliers"))
      .finally(() => setLoading(false));
  }, [isBackendMode]);

  useEffect(() => {
    if (isBackendMode) refetch();
    else setSuppliers(mockSuppliers);
  }, [isBackendMode, refetch]);

  const validateAdd = (): boolean => {
    const err: FormErrors = {};
    if (!newSupplier.name.trim()) err.name = "Name is required.";
    setAddErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validateAdd()) return;
    if (isBackendMode) {
      setAddSubmitting(true);
      try {
        const created = await adminSuppliersApi.createSupplier({
          name: newSupplier.name.trim(),
          email: newSupplier.email.trim() || undefined,
          phone: newSupplier.phone.trim() || undefined,
        });
        setSuppliers((prev) => [mapBackendToRow(created), ...prev]);
        setIsAddSheetOpen(false);
        setNewSupplier({ name: "", email: "", phone: "" });
        setAddErrors({});
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to add supplier.");
      } finally {
        setAddSubmitting(false);
      }
      return;
    }
    const row: SupplierRow = {
      id: `S${Date.now()}`,
      name: newSupplier.name.trim(),
      email: newSupplier.email.trim(),
      phone: newSupplier.phone.trim(),
      balance: 0,
    };
    setSuppliers((prev) => [row, ...prev]);
    setIsAddSheetOpen(false);
    setNewSupplier({ name: "", email: "", phone: "" });
    setAddErrors({});
  };

  const openEdit = (row: SupplierRow) => {
    setSelectedSupplier(null);
    setIsDetailSheetOpen(false);
    setEditForm({ name: row.name, email: row.email, phone: row.phone });
    setEditErrors({});
    setSubmitError(null);
    setSelectedSupplier(row);
    setIsEditSheetOpen(true);
  };

  const validateEdit = (): boolean => {
    const err: FormErrors = {};
    if (!editForm.name.trim()) err.name = "Name is required.";
    setEditErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    setSubmitError(null);
    if (!validateEdit()) return;
    if (isBackendMode) {
      try {
        const updated = await adminSuppliersApi.updateSupplier(parseInt(selectedSupplier.id, 10), {
          name: editForm.name.trim(),
          email: editForm.email.trim() || undefined,
          phone: editForm.phone.trim() || undefined,
        });
        setSuppliers((prev) =>
          prev.map((s) => (s.id === selectedSupplier.id ? mapBackendToRow(updated) : s))
        );
        setIsEditSheetOpen(false);
        setSelectedSupplier(null);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to update supplier.");
      }
      return;
    }
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === selectedSupplier.id
          ? { ...s, name: editForm.name.trim(), email: editForm.email.trim(), phone: editForm.phone.trim() }
          : s
      )
    );
    setIsEditSheetOpen(false);
    setSelectedSupplier(null);
  };

  const handleDeleteSupplier = async () => {
    if (!deleteTarget) return;
    if (isBackendMode) {
      try {
        await adminSuppliersApi.deleteSupplier(parseInt(deleteTarget.id, 10));
        setSuppliers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setIsDetailSheetOpen(false);
        setSelectedSupplier(null);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to delete supplier.");
      }
    } else {
      setSuppliers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setIsDetailSheetOpen(false);
      setSelectedSupplier(null);
    }
    setDeleteTarget(null);
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPayables = suppliers.reduce((acc, s) => acc + (s.balance > 0 ? s.balance : 0), 0);

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Supplier <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Intelligence</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Coordinate logistics and settlements with your <strong>{suppliers.length}</strong> provider{suppliers.length !== 1 ? "s" : ""}.
            </p>
            {loadError && <p className="text-red-500 text-xs font-medium">{loadError}</p>}
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
            {isBackendMode && (
              <button
                type="button"
                onClick={refetch}
                disabled={loading}
                className="p-4 rounded-[20px] border border-slate-200 bg-white font-black text-xs tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
                title="Refresh suppliers"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span className="hidden md:inline">Refresh</span>
              </button>
            )}
            <button
              onClick={() => {
                setNewSupplier({ name: "", email: "", phone: "" });
                setAddErrors({});
                setSubmitError(null);
                setIsAddSheetOpen(true);
              }}
              className="bg-primary text-white p-4 md:px-8 rounded-[20px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <PlusCircle size={20} />
              <span className="hidden md:inline uppercase">Add Supplier</span>
            </button>
          </div>
        </div>

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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Providers</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{suppliers.length}</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
              <RotateCcw size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prepaid Balance</p>
              <p className="text-3xl font-black text-emerald-600 tracking-tight">
                {Math.abs(suppliers.filter((s) => s.balance < 0).reduce((a, s) => a + s.balance, 0)).toLocaleString()} <span className="text-sm">EGP</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-heading font-black text-2xl text-slate-900 tracking-tight uppercase">Provider Directory</h3>
            <button className="flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-widest">
              <Download size={16} /> Export DB
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center">
                <RefreshCw size={32} className="animate-spin text-primary mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading suppliers…</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Balance</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
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
                            {supplier.name[0]?.toUpperCase() ?? "?"}
                          </div>
                          <p className="font-heading font-black text-xl text-slate-900 group-hover:text-primary transition-colors uppercase">{supplier.name}</p>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="space-y-1.5">
                          {supplier.email && (
                            <p className="text-sm font-black text-slate-700 flex items-center gap-2">
                              <Mail size={14} className="text-primary" /> {supplier.email}
                            </p>
                          )}
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                            <Phone size={14} className="text-slate-300" /> {supplier.phone || "—"}
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
                      <td className="px-10 py-7 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(supplier);
                          }}
                          className="p-3 hover:bg-white hover:shadow-md rounded-xl text-slate-300 hover:text-primary transition-all"
                        >
                          <Pencil size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
              <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-white">Add Supplier</SheetTitle>
              <SheetDescription className="text-slate-400 font-bold text-sm">Name is required. Email and phone are optional.</SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleAddSupplier} className="flex-1 overflow-y-auto p-12 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Name <span className="text-red-500">*</span></label>
                <input
                  className={showFieldError(addErrors, "name")}
                  placeholder="Ex: Nile Textile Mills"
                  value={newSupplier.name}
                  onChange={(e) => {
                    setNewSupplier((prev) => ({ ...prev, name: e.target.value }));
                    if (addErrors.name) setAddErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                />
                {addErrors.name && <p className="text-red-500 text-xs font-bold mt-1">{addErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email <span className="text-slate-300">(optional)</span></label>
                <input
                  type="email"
                  className={showFieldError(addErrors, "email")}
                  placeholder="contact@company.com"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier((prev) => ({ ...prev, email: e.target.value }))}
                />
                {addErrors.email && <p className="text-red-500 text-xs font-bold mt-1">{addErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone <span className="text-slate-300">(optional)</span></label>
                <input
                  className={showFieldError(addErrors, "phone")}
                  placeholder="+20 1..."
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier((prev) => ({ ...prev, phone: e.target.value }))}
                />
                {addErrors.phone && <p className="text-red-500 text-xs font-bold mt-1">{addErrors.phone}</p>}
              </div>
            </div>
            {submitError && <p className="text-red-500 text-sm font-bold">{submitError}</p>}
          </form>

          <div className="p-10 border-t border-slate-50 flex gap-4">
            <button
              type="button"
              onClick={() => setIsAddSheetOpen(false)}
              className="flex-1 py-5 border-2 border-slate-100 rounded-[22px] font-black text-xs text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleAddSupplier}
              disabled={addSubmitting}
              className="flex-[2] py-5 bg-primary text-white rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase disabled:opacity-50"
            >
              {addSubmitting ? "Saving…" : "Add Supplier"}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* --- EDIT SUPPLIER SHEET --- */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 border-none flex flex-col bg-white">
          <div className="bg-primary/90 p-12 text-white relative">
            <SheetHeader>
              <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-white">Edit Supplier</SheetTitle>
              <SheetDescription className="text-white/70 font-bold text-sm">Name is required. Contact fields are optional.</SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleUpdateSupplier} className="flex-1 overflow-y-auto p-12 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Name <span className="text-red-500">*</span></label>
                <input
                  className={showFieldError(editErrors, "name")}
                  placeholder="Supplier name"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm((prev) => ({ ...prev, name: e.target.value }));
                    if (editErrors.name) setEditErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                />
                {editErrors.name && <p className="text-red-500 text-xs font-bold mt-1">{editErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email <span className="text-slate-300">(optional)</span></label>
                <input
                  type="email"
                  className={showFieldError(editErrors, "email")}
                  placeholder="contact@company.com"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone <span className="text-slate-300">(optional)</span></label>
                <input
                  className={showFieldError(editErrors, "phone")}
                  placeholder="+20 1..."
                  value={editForm.phone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            {submitError && <p className="text-red-500 text-sm font-bold">{submitError}</p>}
          </form>

          <div className="p-10 border-t border-slate-50 flex gap-4">
            <button
              type="button"
              onClick={() => setIsEditSheetOpen(false)}
              className="flex-1 py-5 border-2 border-slate-100 rounded-[22px] font-black text-xs text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateSupplier}
              className="flex-[2] py-5 bg-primary text-white rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 uppercase"
            >
              Save Changes
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* --- DETAIL SHEET --- */}
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
                    {selectedSupplier.name[0]?.toUpperCase() ?? "?"}
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{selectedSupplier.name}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 font-bold text-sm text-slate-400">
                      {selectedSupplier.email && (
                        <div className="flex items-center gap-2 uppercase tracking-tighter">
                          <Mail size={16} className="text-primary" /> {selectedSupplier.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2 uppercase tracking-tighter">
                        <Phone size={16} className="text-primary" /> {selectedSupplier.phone || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(selectedSupplier)}
                      className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(selectedSupplier)}
                      className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12">
                <Tabs defaultValue="balance" className="space-y-10">
                  <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start gap-12 rounded-none h-auto p-0">
                    <TabsTrigger value="balance" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-5 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Balance</TabsTrigger>
                    <TabsTrigger value="logistics" className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-b-4 border-transparent px-2 py-5 rounded-none h-auto text-[11px] font-black uppercase tracking-widest text-slate-400">Logistics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="balance" className="space-y-10 animate-fade-in-up">
                    <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm relative overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Balance</p>
                      <h4 className={cn(
                        "text-6xl font-black tracking-tighter",
                        selectedSupplier.balance > 0 ? "text-red-500" : "text-emerald-500"
                      )}>
                        {Math.abs(selectedSupplier.balance).toLocaleString()} <span className="text-xl">EGP</span>
                      </h4>
                      <p className="text-xs font-bold text-slate-400 mt-4">
                        {selectedSupplier.balance > 0 ? "Amount owed to this supplier." : selectedSupplier.balance < 0 ? "Prepaid / credit balance." : "No dues."}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="logistics" className="animate-fade-in-up">
                    <div className="bg-white p-12 rounded-[45px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10">
                      <div className="w-24 h-24 bg-slate-50 rounded-[35px] flex items-center justify-center text-primary">
                        <Truck size={40} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Supply & Logistics</h4>
                        <p className="text-slate-400 text-sm">Coordinate shipments and lead times for this provider.</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deleteTarget?.name} from the provider directory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSupplier} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
};

export default Suppliers;
