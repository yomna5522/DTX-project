import React, { useRef, useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { Palette, Plus, Pencil, Trash, Image as ImageIcon, UploadCloud, X } from "lucide-react";
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
import type { PresetDesign } from "@/types/order";

const DesignLibrary = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [presets, setPresets] = useState<PresetDesign[]>(() => ordersApi.getPresetDesigns());
  const [editing, setEditing] = useState<PresetDesign | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; basePricePerUnit: number; imageUrl: string; solePropertyClientId: string; solePropertyClientName: string }>({
    name: "",
    description: "",
    basePricePerUnit: 0,
    imageUrl: "",
    solePropertyClientId: "",
    solePropertyClientName: "",
  });

  const refresh = () => setPresets(ordersApi.getPresetDesigns());

  const openCreate = () => {
    setForm({ name: "", description: "", basePricePerUnit: 0, imageUrl: "", solePropertyClientId: "", solePropertyClientName: "" });
    setIsCreateOpen(true);
    setEditing(null);
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  const openEdit = (p: PresetDesign) => {
    setForm({
      name: p.name,
      description: p.description ?? "",
      basePricePerUnit: p.basePricePerUnit,
      imageUrl: typeof p.imageUrl === "string" ? p.imageUrl : "",
      solePropertyClientId: p.solePropertyClientId ?? "",
      solePropertyClientName: p.solePropertyClientName ?? "",
    });
    setEditing(p);
    setIsCreateOpen(false);
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  const closeSheet = () => {
    setEditing(null);
    setIsCreateOpen(false);
  };

  const handleSave = () => {
    if (editing) {
      ordersApi.updatePresetDesign(editing.id, {
        name: form.name,
        description: form.description,
        basePricePerUnit: form.basePricePerUnit,
        imageUrl: form.imageUrl || undefined,
        solePropertyClientId: form.solePropertyClientId || undefined,
        solePropertyClientName: form.solePropertyClientName || undefined,
      });
    } else if (isCreateOpen) {
      if (!form.name) return;
      ordersApi.addPresetDesign({
        name: form.name,
        description: form.description,
        basePricePerUnit: form.basePricePerUnit,
        imageUrl: form.imageUrl || "/placeholder-design.png",
        ...(form.solePropertyClientId && { solePropertyClientId: form.solePropertyClientId }),
        ...(form.solePropertyClientName && { solePropertyClientName: form.solePropertyClientName }),
      });
    }
    refresh();
    closeSheet();
  };

  const handleDeleteClick = (id: string) => setDeleteConfirmId(id);

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    ordersApi.deletePresetDesign(deleteConfirmId);
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
              Design <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">Library</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium italic mt-1">Preset designs for “Repeat Design” and “Existing design” in the shop.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-[22px] font-black text-xs tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <Plus size={20} /> Add design
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:border-primary/20 transition-all group"
            >
              <div className="aspect-video bg-slate-100 relative">
                {typeof p.imageUrl === "string" && p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-white/90 hover:bg-white text-slate-600 shadow">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteClick(p.id)} className="p-2 rounded-lg bg-white/90 hover:bg-red-50 text-red-600 shadow">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-black text-slate-900 uppercase tracking-tight">{p.name}</h3>
                {p.description && <p className="text-xs text-slate-500 mt-1">{p.description}</p>}
                {(p.solePropertyClientName || p.solePropertyClientId) && (
                  <p className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded mt-2 inline-block">Sole property: {p.solePropertyClientName || p.solePropertyClientId}</p>
                )}
                <p className="text-sm font-bold text-primary mt-2">{p.basePricePerUnit} EGP/unit</p>
              </div>
            </div>
          ))}
        </div>

        {presets.length === 0 && (
          <div className="py-24 text-center text-slate-400">
            <Palette size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold uppercase tracking-widest">No preset designs</p>
            <p className="text-sm mt-1">Add designs for “Existing design” and “Repeat Design” in the shop.</p>
            <button onClick={openCreate} className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm uppercase">
              Add first design
            </button>
          </div>
        )}
      </div>

      <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="uppercase tracking-tight">{editing ? "Edit design" : "Add design"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</label>
              <input
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Aesthetic Floral"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description (optional)</label>
              <textarea
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium resize-none"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base price per unit (EGP)</label>
              <input
                type="number"
                min={0}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                value={form.basePricePerUnit || ""}
                onChange={(e) => setForm((f) => ({ ...f, basePricePerUnit: Number(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image</label>
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type.startsWith("image/")) {
                        const reader = new FileReader();
                        reader.onload = () => setForm((f) => ({ ...f, imageUrl: reader.result as string }));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <UploadCloud size={18} /> Upload image
                  </button>
                  <span className="text-xs text-slate-400">or paste URL below</span>
                </div>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://... or leave empty"
                />
                {form.imageUrl && (
                  <div className="mt-2 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 aspect-video max-h-40">
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admin: Sold to client (sole property)</p>
              <p className="text-xs text-slate-500 mb-2">When set, this design is the sole property of the named client.</p>
              <input
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                value={form.solePropertyClientId}
                onChange={(e) => setForm((f) => ({ ...f, solePropertyClientId: e.target.value }))}
                placeholder="Client ID (optional)"
              />
              <input
                className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                value={form.solePropertyClientName}
                onChange={(e) => setForm((f) => ({ ...f, solePropertyClientName: e.target.value }))}
                placeholder="Client name (optional)"
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
            <AlertDialogTitle>Remove design from catalog?</AlertDialogTitle>
            <AlertDialogDescription>This design will be removed from the catalog. You can add it again later.</AlertDialogDescription>
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

export default DesignLibrary;
