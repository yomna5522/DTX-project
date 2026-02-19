import React, { useMemo, useRef, useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import { Palette, Plus, Pencil, Trash, Image as ImageIcon, UploadCloud, Search } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ordersApi } from "@/api/orders";
import { authApi } from "@/api/auth";
import type { PresetDesign } from "@/types/order";

const DesignLibrary = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [presets, setPresets] = useState<PresetDesign[]>(() => ordersApi.getPresetDesigns());
  const [editing, setEditing] = useState<PresetDesign | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    basePricePerUnit: number;
    imageUrl: string;
    visibility: "public" | "private";
    solePropertyClientId: string;
    solePropertyClientName: string;
  }>({
    name: "",
    description: "",
    basePricePerUnit: 0,
    imageUrl: "",
    visibility: "public",
    solePropertyClientId: "",
    solePropertyClientName: "",
  });
  const [clientSearch, setClientSearch] = useState("");
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const allClients = useMemo(() => authApi.getAllUsers(), []);
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return allClients;
    const q = clientSearch.trim().toLowerCase();
    return allClients.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q))
    );
  }, [allClients, clientSearch]);

  const refresh = () => setPresets(ordersApi.getPresetDesigns());

  const openCreate = () => {
    setForm({
      name: "",
      description: "",
      basePricePerUnit: 0,
      imageUrl: "",
      visibility: "public",
      solePropertyClientId: "",
      solePropertyClientName: "",
    });
    setClientSearch("");
    setClientDropdownOpen(false);
    setImagePreviewError(false);
    setIsCreateOpen(true);
    setEditing(null);
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  const openEdit = (p: PresetDesign) => {
    const isPrivate = !!(p.solePropertyClientId || p.solePropertyClientName);
    setForm({
      name: p.name,
      description: p.description ?? "",
      basePricePerUnit: p.basePricePerUnit,
      imageUrl: typeof p.imageUrl === "string" ? p.imageUrl : "",
      visibility: isPrivate ? "private" : "public",
      solePropertyClientId: p.solePropertyClientId ?? "",
      solePropertyClientName: p.solePropertyClientName ?? "",
    });
    setClientSearch(isPrivate ? (p.solePropertyClientName || p.solePropertyClientId || "") : "");
    setClientDropdownOpen(false);
    setImagePreviewError(false);
    setEditing(p);
    setIsCreateOpen(false);
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  const closeSheet = () => {
    setEditing(null);
    setIsCreateOpen(false);
    setFieldError(null);
  };

  const handleSave = () => {
    setFieldError(null);
    const nameTrimmed = form.name.trim();
    if (!nameTrimmed) {
      setFieldError("Design name is required.");
      return;
    }
    if (form.visibility === "private" && !form.solePropertyClientId) {
      setFieldError("Please assign a client for private designs.");
      return;
    }
    const isPrivate = form.visibility === "private" && (form.solePropertyClientId || form.solePropertyClientName);
    const soleProperty = isPrivate
      ? { solePropertyClientId: form.solePropertyClientId, solePropertyClientName: form.solePropertyClientName }
      : { solePropertyClientId: undefined, solePropertyClientName: undefined };
    if (editing) {
      ordersApi.updatePresetDesign(editing.id, {
        name: nameTrimmed,
        description: form.description,
        basePricePerUnit: form.basePricePerUnit,
        imageUrl: form.imageUrl || undefined,
        ...soleProperty,
      });
    } else {
      ordersApi.addPresetDesign({
        name: nameTrimmed,
        description: form.description,
        basePricePerUnit: form.basePricePerUnit,
        imageUrl: form.imageUrl || "/placeholder-design.png",
        ...(isPrivate && soleProperty),
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
                <span
                  className={cn(
                    "absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest z-10",
                    p.solePropertyClientId || p.solePropertyClientName
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  )}
                >
                  {p.solePropertyClientId || p.solePropertyClientName ? "Private" : "Public"}
                </span>
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
                  <p className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded mt-2 inline-block">Private — {p.solePropertyClientName || p.solePropertyClientId}</p>
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
        <SheetContent className="sm:max-w-lg flex flex-col max-h-[100dvh] overflow-hidden p-0 gap-0">
          <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-2">
            <SheetTitle className="uppercase tracking-tight text-slate-900">
              {editing ? "Edit design" : "Add design"}
            </SheetTitle>
            <p className="text-xs text-slate-500 mt-1">
              {editing ? "Update design details and visibility." : "Add a new design to the factory library for the shop."}
            </p>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto min-h-0 px-6">
            <div className="space-y-6 py-4">
              {fieldError && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-700">
                  {fieldError}
                </div>
              )}

              {/* Design preview */}
              <section className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design preview</h3>
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 overflow-hidden">
                  {form.imageUrl ? (
                    <div className="relative aspect-video max-h-48 w-full bg-slate-100">
                      {!imagePreviewError ? (
                        <img
                          src={form.imageUrl}
                          alt="Design preview"
                          className="w-full h-full object-contain"
                          onError={() => setImagePreviewError(true)}
                        />
                      ) : null}
                      {imagePreviewError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
                          Invalid or unavailable image
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-bold text-slate-600 shadow hover:bg-white"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                          className="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-bold text-red-600 shadow hover:bg-white"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video flex flex-col items-center justify-center gap-2 text-slate-400 cursor-pointer hover:bg-slate-100/50 hover:border-slate-300 transition-colors"
                    >
                      <UploadCloud size={40} className="opacity-60" />
                      <span className="text-sm font-bold">Upload image or paste URL below</span>
                    </div>
                  )}
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
                </div>
                <input
                  type="url"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400"
                  value={form.imageUrl}
                  onChange={(e) => { setForm((f) => ({ ...f, imageUrl: e.target.value })); setImagePreviewError(false); }}
                  placeholder="Paste image URL (e.g. https://...)"
                />
              </section>

              {/* Design details */}
              <section className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design details</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Design name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border text-sm font-medium placeholder:text-slate-400",
                      fieldError && !form.name.trim() ? "border-red-300 bg-red-50/30" : "border-slate-200"
                    )}
                    value={form.name}
                    onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setFieldError(null); }}
                    placeholder="e.g. Aesthetic Floral, Cherry Red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium resize-none placeholder:text-slate-400"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Short description for the catalog (optional)"
                  />
                </div>
              </section>

              {/* Pricing */}
              <section className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Base price per unit (EGP)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                    value={form.basePricePerUnit || ""}
                    onChange={(e) => setForm((f) => ({ ...f, basePricePerUnit: Number(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </section>

              {/* Visibility & access */}
              <section className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility & access</h3>
                <p className="text-xs text-slate-500">
                  Public designs appear for all customers in the shop. Private designs are visible only to the assigned client.
                </p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={form.visibility === "public"}
                      onChange={() => setForm((f) => ({ ...f, visibility: "public", solePropertyClientId: "", solePropertyClientName: "" }))}
                      className="rounded-full border-slate-300 text-primary"
                    />
                    <span className="text-sm font-medium">Public</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={form.visibility === "private"}
                      onChange={() => setForm((f) => ({ ...f, visibility: "private" }))}
                      className="rounded-full border-slate-300 text-primary"
                    />
                    <span className="text-sm font-medium">Private</span>
                  </label>
                </div>
                {form.visibility === "private" && (
                  <div className="relative space-y-2">
                    <label className="block text-xs font-bold text-slate-600">Assign to client</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium placeholder:text-slate-400"
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          setClientDropdownOpen(true);
                        }}
                        onFocus={() => setClientDropdownOpen(true)}
                        placeholder="Search by name or email..."
                      />
                      {clientDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" aria-hidden onClick={() => setClientDropdownOpen(false)} />
                          <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                            {filteredClients.length === 0 ? (
                              <p className="px-4 py-3 text-sm text-slate-500">No clients match</p>
                            ) : (
                              filteredClients.map((u) => (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                    setForm((f) => ({ ...f, solePropertyClientId: u.id, solePropertyClientName: u.name }));
                                    setClientSearch(u.name);
                                    setClientDropdownOpen(false);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex flex-col gap-0.5"
                                >
                                  <span className="font-medium text-slate-900">{u.name}</span>
                                  <span className="text-xs text-slate-500">{u.email}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    {form.solePropertyClientName && (
                      <p className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-lg inline-block">
                        Assigned to: {form.solePropertyClientName}
                      </p>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
          <SheetFooter className="flex-shrink-0 flex gap-2 p-6 pt-4 border-t border-slate-100 bg-slate-50/50">
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
