import React, { useState, useCallback, useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  X,
  ChevronDown,
  FileText,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { productionApi } from "@/api/production";
import type { ProductionBillingStatus } from "@/types/production";
import * as XLSX from "xlsx";

// ── Target fields for production runs ─────────────────────
const TARGET_FIELDS = [
  { key: "date", label: "Date", required: true },
  { key: "machine", label: "Machine", required: false },
  { key: "customerEntityId", label: "Customer ID", required: false },
  { key: "designRef", label: "Design Reference", required: true },
  { key: "fabric", label: "Fabric", required: true },
  { key: "metersPrinted", label: "Meters Printed", required: true },
  { key: "notes", label: "Notes", required: false },
  { key: "sourceOrderId", label: "Source Order ID", required: false },
] as const;

type TargetKey = (typeof TARGET_FIELDS)[number]["key"];

// Steps
type WizardStep = "upload" | "sheet" | "map" | "preview" | "done";

const ImportWizard = () => {
  const [step, setStep] = useState<WizardStep>("upload");
  const [fileName, setFileName] = useState("");
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<TargetKey, string>>({} as Record<TargetKey, string>);

  // Import config
  const [defaultCustomer, setDefaultCustomer] = useState("");
  const [defaultMachine, setDefaultMachine] = useState("");
  const [defaultBillingStatus, setDefaultBillingStatus] = useState<ProductionBillingStatus>("DRAFT");

  // Result
  const [importedCount, setImportedCount] = useState(0);

  const customers = useMemo(() => productionApi.getAllCustomerEntities(), []);
  const machines = productionApi.getMachines();

  // ── Step 1: Upload ──────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      if (wb.SheetNames.length === 1) {
        selectSheet(wb, wb.SheetNames[0]);
        setStep("map");
      } else {
        setStep("sheet");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const selectSheet = (wb: XLSX.WorkBook, name: string) => {
    setSelectedSheet(name);
    const ws = wb.Sheets[name];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: "",
    });
    setRawData(json);
    if (json.length > 0) {
      const cols = Object.keys(json[0]);
      setColumns(cols);
      // Auto-map: match by name similarity
      const autoMap: Record<string, string> = {};
      for (const tf of TARGET_FIELDS) {
        const match = cols.find(
          (c) =>
            c.toLowerCase().includes(tf.key.toLowerCase()) ||
            c.toLowerCase().includes(tf.label.toLowerCase()) ||
            tf.key === "metersPrinted" && c.toLowerCase().includes("meter") ||
            tf.key === "designRef" && c.toLowerCase().includes("design") ||
            tf.key === "date" && c.toLowerCase().includes("date")
        );
        if (match) autoMap[tf.key] = match;
      }
      setMapping(autoMap as Record<TargetKey, string>);
    }
  };

  // ── Preview data ────────────────────────────────────────
  const previewRows = useMemo(() => {
    if (rawData.length === 0) return [];
    return rawData.slice(0, 50).map((row) => {
      const mapped: Record<string, unknown> = {};
      for (const tf of TARGET_FIELDS) {
        const col = mapping[tf.key];
        mapped[tf.key] = col ? row[col] : "";
      }
      return mapped;
    });
  }, [rawData, mapping]);

  const isMapValid = useMemo(() => {
    return TARGET_FIELDS.filter((f) => f.required).every(
      (f) => mapping[f.key] && mapping[f.key] !== ""
    );
  }, [mapping]);

  // ── Step 4: Import ─────────────────────────────────────
  const handleImport = () => {
    const toImport = rawData.map((row) => {
      const dateRaw = mapping.date ? row[mapping.date] : "";
      let dateStr = "";
      if (typeof dateRaw === "number") {
        // Excel serial date
        const d = XLSX.SSF.parse_date_code(dateRaw);
        dateStr = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
      } else {
        dateStr = String(dateRaw || new Date().toISOString().split("T")[0]);
      }

      const metersRaw = mapping.metersPrinted ? row[mapping.metersPrinted] : 0;
      const meters = typeof metersRaw === "number" ? metersRaw : parseFloat(String(metersRaw)) || 0;

      return {
        date: dateStr,
        machine: String(
          (mapping.machine ? row[mapping.machine] : "") || defaultMachine || "Unknown"
        ),
        customerEntityId:
          String((mapping.customerEntityId ? row[mapping.customerEntityId] : "") || defaultCustomer || ""),
        designRef: String((mapping.designRef ? row[mapping.designRef] : "") || "Unknown"),
        fabric: String((mapping.fabric ? row[mapping.fabric] : "") || "Unknown"),
        metersPrinted: meters,
        notes: String((mapping.notes ? row[mapping.notes] : "") || ""),
        sourceOrderId: (mapping.sourceOrderId ? String(row[mapping.sourceOrderId] || "") : undefined) || undefined,
        billingStatus: defaultBillingStatus,
      };
    }).filter((r) => r.metersPrinted > 0);

    const imported = productionApi.importRuns(toImport);
    setImportedCount(imported.length);
    setStep("done");
  };

  // Drop zone
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <ManagementLayout>
      <div className="space-y-8 animate-fade-in-up max-w-5xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Import{" "}
            <span className="text-primary underline decoration-accent decoration-4 underline-offset-4">
              Wizard
            </span>
          </h1>
          <p className="text-slate-400 text-sm font-medium italic">
            Upload Excel files to batch-import production runs into the system.
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2">
          {(["upload", "sheet", "map", "preview", "done"] as WizardStep[]).map(
            (s, i) => (
              <React.Fragment key={s}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                    step === s
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : s === "sheet" && sheetNames.length <= 1
                        ? "opacity-30 border-slate-100 text-slate-300"
                        : "border-slate-100 text-slate-400"
                  )}
                >
                  {i + 1}. {s === "sheet" ? "Sheet" : s === "map" ? "Map Columns" : s === "preview" ? "Preview" : s === "done" ? "Done" : "Upload"}
                </div>
                {i < 4 && (
                  <ArrowRight
                    size={14}
                    className="text-slate-200 flex-shrink-0"
                  />
                )}
              </React.Fragment>
            )
          )}
        </div>

        {/* ── STEP: UPLOAD ───────────────────────────────── */}
        {step === "upload" && (
          <div
            className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-16 flex flex-col items-center justify-center hover:border-primary/40 transition-all cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => {
              const inp = document.createElement("input");
              inp.type = "file";
              inp.accept = ".xlsx,.xls,.csv";
              inp.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) handleFile(f);
              };
              inp.click();
            }}
          >
            <div className="w-24 h-24 bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
              <Upload size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">
              Drop your Excel file here
            </h3>
            <p className="text-sm text-slate-400 font-medium">
              Supports .xlsx, .xls, .csv — up to 10k rows.
            </p>
          </div>
        )}

        {/* ── STEP: SHEET SELECT ─────────────────────────── */}
        {step === "sheet" && workbook && (
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-12 space-y-6">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={24} className="text-primary" />
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                Select a sheet from <span className="text-primary">{fileName}</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sheetNames.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    selectSheet(workbook, name);
                    setStep("map");
                  }}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left transition-all hover:border-primary/40 hover:bg-primary/5",
                    selectedSheet === name
                      ? "border-primary bg-primary/5"
                      : "border-slate-100"
                  )}
                >
                  <Layers size={20} className="text-primary mb-2" />
                  <p className="font-black text-sm text-slate-900">{name}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    Click to select
                  </p>
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setStep("upload");
                  setWorkbook(null);
                }}
                className="px-6 py-3 bg-slate-100 rounded-xl font-black text-xs text-slate-500 uppercase tracking-widest"
              >
                <ArrowLeft size={16} className="inline mr-1" /> Back
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: MAP COLUMNS ──────────────────────────── */}
        {step === "map" && (
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-12 space-y-8">
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-primary" />
                Map Columns
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                Found {rawData.length} rows and {columns.length} columns in{" "}
                <span className="font-bold text-primary">{selectedSheet || fileName}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TARGET_FIELDS.map((tf) => (
                <div key={tf.key} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    {tf.label}
                    {tf.required && <span className="text-red-400">*</span>}
                  </label>
                  <select
                    value={mapping[tf.key] ?? ""}
                    onChange={(e) =>
                      setMapping((prev) => ({
                        ...prev,
                        [tf.key]: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                  >
                    <option value="">— skip —</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Defaults */}
            <div className="border-t border-slate-100 pt-8 space-y-6">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Default Values (used when column is skipped)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Default Customer
                  </label>
                  <select
                    value={defaultCustomer}
                    onChange={(e) => setDefaultCustomer(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                  >
                    <option value="">— None —</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Default Machine
                  </label>
                  <select
                    value={defaultMachine}
                    onChange={(e) => setDefaultMachine(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                  >
                    <option value="">— None —</option>
                    {machines.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Billing Status
                  </label>
                  <select
                    value={defaultBillingStatus}
                    onChange={(e) =>
                      setDefaultBillingStatus(
                        e.target.value as ProductionBillingStatus
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="APPROVED">Approved</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() =>
                  setStep(sheetNames.length > 1 ? "sheet" : "upload")
                }
                className="px-6 py-3 bg-slate-100 rounded-xl font-black text-xs text-slate-500 uppercase tracking-widest"
              >
                <ArrowLeft size={16} className="inline mr-1" /> Back
              </button>
              <button
                onClick={() => setStep("preview")}
                disabled={!isMapValid}
                className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 hover:opacity-90 transition-all flex items-center gap-2"
              >
                Preview <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: PREVIEW ──────────────────────────────── */}
        {step === "preview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Preview — first {Math.min(50, rawData.length)} of {rawData.length}{" "}
                  rows
                </h4>
                <span className="text-xs font-bold text-primary">
                  {rawData.filter((row) => {
                    const m = mapping.metersPrinted ? row[mapping.metersPrinted] : 0;
                    return (typeof m === "number" ? m : parseFloat(String(m)) || 0) > 0;
                  }).length}{" "}
                  valid rows to import
                </span>
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr>
                      {TARGET_FIELDS.filter(
                        (tf) => mapping[tf.key]
                      ).map((tf) => (
                        <th
                          key={tf.key}
                          className="px-4 py-3 font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap"
                        >
                          {tf.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        {TARGET_FIELDS.filter(
                          (tf) => mapping[tf.key]
                        ).map((tf) => (
                          <td
                            key={tf.key}
                            className="px-4 py-2 font-bold text-slate-700 whitespace-nowrap"
                          >
                            {String(row[tf.key] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("map")}
                className="px-6 py-3 bg-slate-100 rounded-xl font-black text-xs text-slate-500 uppercase tracking-widest"
              >
                <ArrowLeft size={16} className="inline mr-1" /> Adjust Mapping
              </button>
              <button
                onClick={handleImport}
                className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Check size={16} /> Import {rawData.length} rows
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: DONE ─────────────────────────────────── */}
        {step === "done" && (
          <div className="bg-white rounded-[40px] border border-emerald-100 shadow-sm p-16 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <Check size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Import Complete
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              Successfully imported <span className="text-primary font-black">{importedCount}</span>{" "}
              production runs into the system.
            </p>
            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={() => {
                  setStep("upload");
                  setWorkbook(null);
                  setRawData([]);
                  setColumns([]);
                  setMapping({} as Record<TargetKey, string>);
                }}
                className="px-8 py-3 bg-slate-100 rounded-xl font-black text-xs text-slate-500 uppercase tracking-widest"
              >
                Import Another
              </button>
              <a
                href="/management/production"
                className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                View Production Log <ArrowRight size={16} />
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </ManagementLayout>
  );
};

export default ImportWizard;
