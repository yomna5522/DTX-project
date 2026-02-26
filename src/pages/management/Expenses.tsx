import React, { useState, useEffect, useCallback } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { adminExpensesApi, type AdminExpenseCategoryItem, type AdminExpenseItem } from "@/api/adminExpensesApi";
import { adminAuthApi } from "@/api/adminAuth";
import {
  Banknote,
  Plus,
  Search,
  ChevronRight,
  Pencil,
  Trash,
  TrendingUp,
  TrendingDown,
  Layers,
  PlusCircle,
  X,
  PieChart,
  RefreshCw,
  Tag,
  Zap,
  Building2,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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

// --- Display types ---
interface ExpenseRow {
  id: string;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  date: string;
  paidTo: string;
  status: "Paid" | "Pending" | "Recurring";
  paymentMethod: string;
}

interface CategoryRow {
  id: string;
  name: string;
}

const CAT_ICONS: Record<string, React.ElementType> = {
  Utilities: Zap,
  "Facility Rent": Building2,
  "Extra Wages": Banknote,
  Maintenance: Settings2,
  Miscellaneous: Layers,
};
const defaultCatIcon = Tag;
const defaultCatColor = "bg-slate-500";

function mapCategoryToRow(c: AdminExpenseCategoryItem): CategoryRow {
  return { id: String(c.id), name: c.name };
}

function mapExpenseToRow(e: AdminExpenseItem): ExpenseRow {
  return {
    id: String(e.id),
    categoryId: String(e.category),
    categoryName: e.category_name,
    description: e.description,
    amount: e.amount,
    date: e.date,
    paidTo: e.paid_to ?? "",
    status: e.status,
    paymentMethod: e.payment_method ?? "",
  };
}

// --- Mock for non-backend ---
const mockCategories: CategoryRow[] = [
  { id: "1", name: "Utilities" },
  { id: "2", name: "Facility Rent" },
  { id: "3", name: "Extra Wages" },
  { id: "4", name: "Maintenance" },
  { id: "5", name: "Miscellaneous" },
];
const mockExpenses: ExpenseRow[] = [
  { id: "1", categoryId: "1", categoryName: "Utilities", description: "Factory Electricity Bill - Jan", amount: 14500, date: "2024-01-15", paidTo: "State Energy Corp", status: "Paid", paymentMethod: "Bank Transfer" },
  { id: "2", categoryId: "2", categoryName: "Facility Rent", description: "Monthly Warehouse Lease", amount: 45000, date: "2024-02-01", paidTo: "Industrial Real Estate", status: "Recurring", paymentMethod: "Direct Debit" },
];

// --- Validation convention (same as Suppliers) ---
interface FormErrors {
  name?: string;
  description?: string;
  amount?: string;
  category?: string;
  date?: string;
}

function showFieldError(errors: FormErrors, field: keyof FormErrors) {
  return cn(
    "w-full px-6 py-5 rounded-2xl text-sm font-black transition-all outline-none focus:ring-4 focus:ring-primary/5",
    errors[field]
      ? "border-2 border-red-500 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500"
      : "bg-slate-50 border-2 border-transparent"
  );
}

const Expenses = () => {
  const isBackendMode = Boolean(adminAuthApi.getSession());
  const [categories, setCategories] = useState<CategoryRow[]>(() => (isBackendMode ? [] : mockCategories));
  const [expenses, setExpenses] = useState<ExpenseRow[]>(() => (isBackendMode ? [] : mockExpenses));
  const [loading, setLoading] = useState(isBackendMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("All");

  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<ExpenseRow | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<CategoryRow | null>(null);

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "" as number | "",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
    paidTo: "",
    status: "Paid" as "Paid" | "Pending" | "Recurring",
    paymentMethod: "Cash",
  });
  const [expenseErrors, setExpenseErrors] = useState<FormErrors>({});
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refetch = useCallback(() => {
    if (!isBackendMode) return;
    setLoadError(null);
    setLoading(true);
    Promise.all([adminExpensesApi.getCategories(), adminExpensesApi.getExpenses()])
      .then(([cats, exps]) => {
        setCategories(cats.map(mapCategoryToRow));
        setExpenses(exps.map(mapExpenseToRow));
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [isBackendMode]);

  useEffect(() => {
    if (isBackendMode) refetch();
    else {
      setCategories(mockCategories);
      setExpenses(mockExpenses);
    }
  }, [isBackendMode, refetch]);

  const validateExpense = (): boolean => {
    const err: FormErrors = {};
    if (!expenseForm.description.trim()) err.description = "Description is required.";
    if (expenseForm.amount === "" || Number(expenseForm.amount) <= 0) err.amount = "Amount must be greater than 0.";
    if (!expenseForm.categoryId) err.category = "Category is required.";
    if (!expenseForm.date) err.date = "Date is required.";
    setExpenseErrors(err);
    return Object.keys(err).length === 0;
  };

  const openNewExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      description: "",
      amount: "",
      categoryId: categories[0]?.id ?? "",
      date: new Date().toISOString().split("T")[0],
      paidTo: "",
      status: "Paid",
      paymentMethod: "Cash",
    });
    setExpenseErrors({});
    setSubmitError(null);
    setIsNewExpenseOpen(true);
  };

  const openEditExpense = (row: ExpenseRow) => {
    setEditingExpense(row);
    setExpenseForm({
      description: row.description,
      amount: row.amount,
      categoryId: row.categoryId,
      date: row.date,
      paidTo: row.paidTo,
      status: row.status,
      paymentMethod: row.paymentMethod || "Cash",
    });
    setExpenseErrors({});
    setSubmitError(null);
    setIsNewExpenseOpen(true);
  };

  const handleSaveExpense = async () => {
    setSubmitError(null);
    if (!validateExpense()) return;
    const amount = Number(expenseForm.amount);
    const categoryId = expenseForm.categoryId;
    const date = expenseForm.date;

    if (isBackendMode) {
      setSubmitting(true);
      try {
        if (editingExpense) {
          const updated = await adminExpensesApi.updateExpense(parseInt(editingExpense.id, 10), {
            category: parseInt(categoryId, 10),
            description: expenseForm.description.trim(),
            amount,
            date,
            paid_to: expenseForm.paidTo.trim() || undefined,
            status: expenseForm.status,
            payment_method: expenseForm.paymentMethod || undefined,
          });
          setExpenses((prev) => prev.map((e) => (e.id === editingExpense.id ? mapExpenseToRow(updated) : e)));
        } else {
          const created = await adminExpensesApi.createExpense({
            category: parseInt(categoryId, 10),
            description: expenseForm.description.trim(),
            amount,
            date,
            paid_to: expenseForm.paidTo.trim() || undefined,
            status: expenseForm.status,
            payment_method: expenseForm.paymentMethod || undefined,
          });
          setExpenses((prev) => [mapExpenseToRow(created), ...prev]);
        }
        setIsNewExpenseOpen(false);
        setEditingExpense(null);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to save expense.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id
            ? {
                ...e,
                categoryId,
                categoryName: categories.find((c) => c.id === categoryId)?.name ?? e.categoryName,
                description: expenseForm.description.trim(),
                amount,
                date,
                paidTo: expenseForm.paidTo.trim(),
                status: expenseForm.status,
                paymentMethod: expenseForm.paymentMethod,
              }
            : e
        )
      );
    } else {
      const newRow: ExpenseRow = {
        id: String(Date.now()),
        categoryId,
        categoryName: categories.find((c) => c.id === categoryId)?.name ?? "",
        description: expenseForm.description.trim(),
        amount,
        date,
        paidTo: expenseForm.paidTo.trim(),
        status: expenseForm.status,
        paymentMethod: expenseForm.paymentMethod,
      };
      setExpenses((prev) => [newRow, ...prev]);
    }
    setIsNewExpenseOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = async () => {
    if (!deleteExpenseTarget) return;
    if (isBackendMode) {
      try {
        await adminExpensesApi.deleteExpense(parseInt(deleteExpenseTarget.id, 10));
        setExpenses((prev) => prev.filter((e) => e.id !== deleteExpenseTarget.id));
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to delete.");
      }
    } else {
      setExpenses((prev) => prev.filter((e) => e.id !== deleteExpenseTarget.id));
    }
    setDeleteExpenseTarget(null);
  };

  const openCategorySheet = (cat: CategoryRow | null) => {
    setEditingCategory(cat);
    setCategoryName(cat?.name ?? "");
    setCategoryError(null);
    setIsCategorySheetOpen(true);
  };

  const handleSaveCategory = async () => {
    const name = categoryName.trim();
    if (!name) {
      setCategoryError("Name is required.");
      return;
    }
    setCategoryError(null);
    if (isBackendMode) {
      setSubmitting(true);
      try {
        if (editingCategory) {
          const updated = await adminExpensesApi.updateCategory(parseInt(editingCategory.id, 10), { name });
          setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? mapCategoryToRow(updated) : c)));
        } else {
          const created = await adminExpensesApi.createCategory({ name });
          setCategories((prev) => [...prev, mapCategoryToRow(created)]);
        }
        setIsCategorySheetOpen(false);
        setEditingCategory(null);
      } catch (err) {
        setCategoryError(err instanceof Error ? err.message : "Failed to save category.");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (editingCategory) {
      setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? { ...c, name } : c)));
    } else {
      setCategories((prev) => [...prev, { id: String(Date.now()), name }]);
    }
    setIsCategorySheetOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    if (isBackendMode) {
      try {
        await adminExpensesApi.deleteCategory(parseInt(deleteCategoryTarget.id, 10));
        setCategories((prev) => prev.filter((c) => c.id !== deleteCategoryTarget.id));
        setExpenses((prev) => prev.filter((e) => e.categoryId !== deleteCategoryTarget.id));
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to delete category.");
      }
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== deleteCategoryTarget.id));
      setExpenses((prev) => prev.filter((e) => e.categoryId !== deleteCategoryTarget.id));
    }
    setDeleteCategoryTarget(null);
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchSearch =
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.paidTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCat === "All" || exp.categoryId === selectedCat;
    return matchSearch && matchCat;
  });
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Operational <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Expenses</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic">Track factory overhead, maintenance, and facility settlements.</p>
            {loadError && <p className="text-red-500 text-xs font-medium">{loadError}</p>}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search description..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isBackendMode && (
              <button
                type="button"
                onClick={refetch}
                disabled={loading}
                className="p-4 rounded-[22px] border border-slate-200 bg-white font-black text-xs tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span className="hidden lg:inline">Refresh</span>
              </button>
            )}
            <button
              onClick={openNewExpense}
              className="bg-primary text-white p-4 lg:px-8 rounded-[22px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <PlusCircle size={20} />
              <span className="hidden lg:inline uppercase">Add Expense</span>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat) => {
            const Icon = CAT_ICONS[cat.name] ?? defaultCatIcon;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCat(selectedCat === cat.id ? "All" : cat.id)}
                className={cn(
                  "p-8 rounded-[40px] border transition-all cursor-pointer group relative overflow-hidden",
                  selectedCat === cat.id ? "bg-slate-900 border-slate-900 text-white shadow-2xl" : "bg-white border-slate-100 text-slate-900 hover:border-primary/20"
                )}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", selectedCat === cat.id ? "bg-white/20" : "bg-slate-50")}>
                  <Icon size={24} className={selectedCat === cat.id ? "text-white" : "text-slate-400"} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">{cat.name}</h3>
                <div className="flex justify-between items-end mt-2">
                  <p className={cn("text-[10px] font-bold uppercase", selectedCat === cat.id ? "text-white/40" : "text-slate-300")}>
                    {expenses.filter((e) => e.categoryId === cat.id).length} Entries
                  </p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openCategorySheet(cat); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Pencil size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteCategoryTarget(cat); }} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash size={12} /></button>
                  </div>
                </div>
              </div>
            );
          })}
          <button
            onClick={() => openCategorySheet(null)}
            className="p-8 rounded-[40px] border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-300 hover:border-primary hover:text-primary transition-all flex flex-col items-center justify-center gap-2"
          >
            <PlusCircle size={32} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">New Category</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-6">
            <div className="flex items-center gap-6 bg-white p-2 rounded-full border border-slate-100 w-fit">
              <button
                onClick={() => setSelectedCat("All")}
                className={cn(
                  "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedCat === "All" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                Full Directory
              </button>
            </div>

            <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
              {loading ? (
                <div className="py-20 text-center">
                  <RefreshCw size={32} className="animate-spin text-primary mx-auto mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading expenses…</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / ID</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (EGP)</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} onClick={() => openEditExpense(exp)} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-900">{exp.date}</span>
                            <span className="text-[10px] text-slate-300 uppercase mt-0.5 tracking-widest">{exp.id}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 font-black text-xs uppercase tracking-widest text-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">{(exp.paidTo || "—")[0]}</div>
                            {exp.paidTo || "—"}
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <p className="text-xs text-slate-400 max-w-[250px] line-clamp-1 italic">&quot;{exp.description}&quot;</p>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-lg font-black text-slate-900 tracking-tighter italic">-{exp.amount.toLocaleString()} <span className="text-sm">EGP</span></span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <span
                            className={cn(
                              "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                              exp.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : exp.status === "Recurring" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                            )}
                          >
                            {exp.status}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button onClick={(e) => { e.stopPropagation(); setDeleteExpenseTarget(exp); }} className="p-2 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500"><Trash size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="w-full lg:w-96 space-y-8">
            <div className="bg-slate-900 p-10 rounded-[45px] text-white space-y-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingDown size={100} /></div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Gross Burn Rate</p>
              <h4 className="text-5xl font-black tracking-tighter text-rose-400">{totalExpenses.toLocaleString()} <span className="text-xl text-white">EGP</span></h4>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Aggregate Expenditure Ledger</p>
            </div>

            <div className="bg-white p-10 rounded-[45px] border border-slate-100 space-y-8 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex justify-between items-center">By Category <PieChart size={16} /></h4>
              <div className="space-y-6">
                {categories.slice(0, 5).map((cat) => {
                  const total = expenses.filter((e) => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0);
                  const pct = totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0;
                  return (
                    <div key={cat.id} className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-black uppercase tracking-tight">
                        <span className="text-slate-700">{cat.name}</span>
                        <span className="text-slate-400">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", defaultCatColor)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Add/Edit Expense Sheet --- */}
      <Sheet open={isNewExpenseOpen} onOpenChange={setIsNewExpenseOpen}>
        <SheetContent className="w-full sm:max-w-2xl p-0 border-none flex flex-col bg-white">
          <div className="bg-slate-900 p-12 text-white relative">
            <SheetHeader>
              <SheetTitle className="text-4xl font-black uppercase tracking-tighter text-white">{editingExpense ? "Edit Expense" : "Expense Entry"}</SheetTitle>
              <SheetDescription className="text-white/80 font-bold text-sm">Description, amount, category and date are required. Paid to and payment method are optional.</SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-12 space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description <span className="text-red-500">*</span></label>
              <textarea
                className={showFieldError(expenseErrors, "description")}
                placeholder="Memo for audit log..."
                rows={3}
                value={expenseForm.description}
                onChange={(e) => { setExpenseForm((p) => ({ ...p, description: e.target.value })); if (expenseErrors.description) setExpenseErrors((p) => ({ ...p, description: undefined })); }}
              />
              {expenseErrors.description && <p className="text-red-500 text-xs font-bold">{expenseErrors.description}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount (EGP) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                step={0.01}
                className={showFieldError(expenseErrors, "amount")}
                placeholder="0.00"
                value={expenseForm.amount === "" ? "" : expenseForm.amount}
                onChange={(e) => { const v = e.target.value; setExpenseForm((p) => ({ ...p, amount: v === "" ? "" : Number(v) })); if (expenseErrors.amount) setExpenseErrors((p) => ({ ...p, amount: undefined })); }}
              />
              {expenseErrors.amount && <p className="text-red-500 text-xs font-bold">{expenseErrors.amount}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category <span className="text-red-500">*</span></label>
                <select
                  className={showFieldError(expenseErrors, "category")}
                  value={expenseForm.categoryId}
                  onChange={(e) => { setExpenseForm((p) => ({ ...p, categoryId: e.target.value })); if (expenseErrors.category) setExpenseErrors((p) => ({ ...p, category: undefined })); }}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {expenseErrors.category && <p className="text-red-500 text-xs font-bold">{expenseErrors.category}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className={showFieldError(expenseErrors, "date")}
                  value={expenseForm.date}
                  onChange={(e) => { setExpenseForm((p) => ({ ...p, date: e.target.value })); if (expenseErrors.date) setExpenseErrors((p) => ({ ...p, date: undefined })); }}
                />
                {expenseErrors.date && <p className="text-red-500 text-xs font-bold">{expenseErrors.date}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Paid to <span className="text-slate-300">(optional)</span></label>
                <input
                  className="w-full bg-slate-50 border-2 border-transparent px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none"
                  placeholder="Ex: Egypt Telecom"
                  value={expenseForm.paidTo}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, paidTo: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment method <span className="text-slate-300">(optional)</span></label>
                <select
                  className="w-full bg-slate-50 border-2 border-transparent px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none"
                  value={expenseForm.paymentMethod}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Wallet">Mobile Wallet</option>
                  <option value="Direct Debit">Direct Debit</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</label>
              <div className="flex gap-2">
                {(["Paid", "Pending", "Recurring"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setExpenseForm((p) => ({ ...p, status: s }))}
                    className={cn("flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", expenseForm.status === s ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {submitError && <p className="text-red-500 text-sm font-bold">{submitError}</p>}
          </div>

          <div className="p-10 border-t border-slate-50 flex gap-4 bg-slate-50/50">
            <button type="button" onClick={() => setIsNewExpenseOpen(false)} className="flex-1 py-5 border-2 border-slate-100 rounded-[25px] font-black text-xs text-slate-400 uppercase tracking-widest">Discard</button>
            <button type="button" onClick={handleSaveExpense} disabled={submitting} className="flex-[2] py-5 bg-primary text-white rounded-[25px] font-black text-xs tracking-widest shadow-xl shadow-primary/20 uppercase disabled:opacity-50">{submitting ? "Saving…" : editingExpense ? "Save Changes" : "Add Expense"}</button>
          </div>
        </SheetContent>
      </Sheet>

      {/* --- Category sheet --- */}
      <Sheet open={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 border-none flex flex-col bg-white">
          <div className="bg-accent p-12 text-white relative">
            <SheetHeader>
              <SheetTitle className="text-4xl font-black uppercase tracking-tighter text-white">{editingCategory ? "Edit Category" : "New Category"}</SheetTitle>
              <SheetDescription className="text-white/80 font-bold text-sm">Name is required.</SheetDescription>
            </SheetHeader>
          </div>
          <div className="p-12 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Name <span className="text-red-500">*</span></label>
              <input
                className={categoryError ? "w-full px-6 py-5 rounded-2xl text-sm font-black border-2 border-red-500 bg-red-50/50 outline-none" : "w-full bg-slate-50 border-2 border-transparent px-6 py-5 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none"}
                placeholder="Ex: Lab Testing"
                value={categoryName}
                onChange={(e) => { setCategoryName(e.target.value); setCategoryError(null); }}
              />
              {categoryError && <p className="text-red-500 text-xs font-bold">{categoryError}</p>}
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setIsCategorySheetOpen(false)} className="flex-1 py-5 border-2 border-slate-100 rounded-xl font-black text-xs text-slate-400 uppercase">Cancel</button>
              <button type="button" onClick={handleSaveCategory} disabled={submitting} className="flex-[2] py-5 bg-accent text-white rounded-xl font-black text-xs uppercase disabled:opacity-50">{submitting ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteExpenseTarget} onOpenChange={(open) => !open && setDeleteExpenseTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>This expense entry will be removed. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExpense} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteCategoryTarget} onOpenChange={(open) => !open && setDeleteCategoryTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>Deleting &quot;{deleteCategoryTarget?.name}&quot; will also remove all expenses in this category. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
};

export default Expenses;
