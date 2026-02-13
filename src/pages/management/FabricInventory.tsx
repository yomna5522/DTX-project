import React, { useState, useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { Package, Plus, Pencil, Trash, Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
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
import type { FactoryFabric, FabricType } from "@/types/order";

const fabricTypeLabels: Record<FabricType, string> = {
  sublimation: "Sublimation",
  natural: "Natural",
};

const FabricInventory = () => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [fabrics, setFabrics] = useState<FactoryFabric[]>(() => ordersApi.getFactoryFabrics());
  const [editing, setEditing] = useState<FactoryFabric | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<Partial<FactoryFabric> & { name: string; type: FabricType; pricePerMeter: number; minimumQuantity: number }>({
    name: "",
    type: "sublimation",
    pricePerMeter: 0,
    minimumQuantity: 1,
    availableMeters: undefined,
    description: "",
  });

  const refresh = () => setFabrics(ordersApi.getFactoryFabrics());

  const openCreate = () => {
    setForm({
      name: "",
      type: "sublimation",
      pricePerMeter: 0,
      minimumQuantity: 1,
      availableMeters: undefined,
      description: "",
    });
    setIsCreateOpen(true);
    setEditing(null);
  };

  const openEdit = (f: FactoryFabric) => {
    setForm({
      id: f.id,
      name: f.name,
      type: f.type,
      pricePerMeter: f.pricePerMeter,
      minimumQuantity: f.minimumQuantity,
      availableMeters: f.availableMeters,
      description: f.description ?? "",
    });
    setEditing(f);
    setIsCreateOpen(false);
  };

  const closeSheet = () => {
    setEditing(null);
    setIsCreateOpen(false);
  };

  const handleSave = () => {
    if (editing) {
      ordersApi.updateFactoryFabric(editing.id, {
        name: form.name,
        type: form.type,
        pricePerMeter: form.pricePerMeter,
        minimumQuantity: form.minimumQuantity,
        availableMeters: form.availableMeters,
        description: form.description || undefined,
      });
    } else if (isCreateOpen) {
      if (!form.name || form.pricePerMeter < 0) return;
      ordersApi.addFactoryFabric({
        name: form.name,
        type: form.type,
        pricePerMeter: form.pricePerMeter,
        minimumQuantity: form.minimumQuantity ?? 1,
        availableMeters: form.availableMeters,
        description: form.description || undefined,
      });
    }
    refresh();
    closeSheet();
  };

  const handleDeleteClick = (id: string) => setDeleteConfirmId(id);

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    ordersApi.deleteFactoryFabric(deleteConfirmId);
    refresh();
    closeSheet();
    setDeleteConfirmId(null);
  };

  const isOpen = isCreateOpen || editing !== null;

  return (
    <ManagementLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Fabric <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Inventory</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic mt-1">Factory fabrics: type, available meters, price per meter, minimum quantity.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-[22px] font-black text-xs tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <Plus size={20} /> Add fabric
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fabrics.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:border-primary/20 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-primary">
                  <Layers size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(f)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDeleteClick(f.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight mt-3">{f.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{fabricTypeLabels[f.type]}</p>
              <div className="mt-4 space-y-1 text-sm">
                <p className="text-slate-600"><span className="font-bold text-slate-900">{f.pricePerMeter}</span> EGP/m</p>
                <p className="text-slate-600">Min order: <span className="font-bold text-slate-900">{f.minimumQuantity}</span> m</p>
                {f.availableMeters != null && (
                  <p className="text-slate-600">Available: <span className="font-bold text-slate-900">{f.availableMeters}</span> m</p>
                )}
              </div>
              {f.description && <p className="text-xs text-slate-500 mt-2">{f.description}</p>}
            </div>
          ))}
        </div>

        {fabrics.length === 0 && (
          <div className="py-24 text-center text-slate-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold uppercase tracking-widest">No factory fabrics yet</p>
            <p className="text-sm mt-1">Add fabrics so customers can choose “Factory Provides” in the shop.</p>
            <button onClick={openCreate} className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm uppercase">
              Add first fabric
            </button>
          </div>
        )}
      </div>

      <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="uppercase tracking-tight">{editing ? "Edit fabric" : "Add fabric"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</label>
              <input
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Premium Sublimation Polyester"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
              <select
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FabricType }))}
              >
                <option value="sublimation">Sublimation</option>
                <option value="natural">Natural</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price/m (EGP)</label>
                <input
                  type="number"
                  min={0}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                  value={form.pricePerMeter || ""}
                  onChange={(e) => setForm((f) => ({ ...f, pricePerMeter: Number(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min quantity (m)</label>
                <input
                  type="number"
                  min={1}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                  value={form.minimumQuantity ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, minimumQuantity: Number(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available meters (optional)</label>
              <input
                type="number"
                min={0}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                value={form.availableMeters ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, availableMeters: e.target.value === "" ? undefined : Number(e.target.value) }))}
                placeholder="Leave empty if not tracked"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description (optional)</label>
              <textarea
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium resize-none"
                rows={2}
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description"
              />
            </div>
          </div>
          <SheetFooter className="flex gap-2">
            {editing && (
              <button onClick={() => handleDeleteClick(editing.id)} className="px-4 py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50">
                Delete
              </button>
            )}
            <button onClick={closeSheet} className="px-4 py-3 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleSave} className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90">
              {editing ? "Save" : "Add"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove fabric from catalog?</AlertDialogTitle>
            <AlertDialogDescription>This fabric will be removed from the catalog. You can add it again later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
};

export default FabricInventory;
