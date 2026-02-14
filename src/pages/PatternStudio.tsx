import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { useAuth } from "@/contexts/AuthContext";
import { userDesignsApi, type UserDesign } from "@/api/userDesigns";
import {
  UploadCloud,
  Save,
  Trash2,
  ShoppingBag,
  Palette,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Info,
} from "lucide-react";
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
import { PatternThumbnail } from "@/components/PatternThumbnail";
import heroPrinting from "@/assets/hero-printing.jpg";

const DEFAULT_TILE_SIZE = 120;
const MIN_TILE = 40;
const MAX_TILE = 400;

type RepeatType = "full_drop" | "half_drop" | "centre" | "mirror";

const FABRIC_OPTIONS = [
  { id: "aerocorp", name: "Aerocorp" },
  { id: "atlas", name: "Atlas" },
  { id: "canvas", name: "Canvas" },
  { id: "chevy", name: "Chevy" },
  { id: "chiffon", name: "Chiffon" },
  { id: "cooper", name: "Cooper" },
  { id: "cotton_drill", name: "Cotton Drill" },
  { id: "cotton_linen", name: "Cotton Linen" },
  { id: "cotton_poplin", name: "Cotton Poplin" },
  { id: "cotton_voile", name: "Cotton Voile" },
  { id: "dilly", name: "Dilly" },
  { id: "london", name: "London" },
  { id: "luna", name: "Luna" },
  { id: "oxford", name: "Oxford" },
  { id: "poppy", name: "Poppy" },
  { id: "pure_linen", name: "Pure Linen" },
  { id: "vesna", name: "Vesna" },
  { id: "waratah", name: "Waratah" },
];

const PatternStudio = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tileImageUrl, setTileImageUrl] = useState<string | null>(null);
  const [tileSize, setTileSize] = useState(DEFAULT_TILE_SIZE);
  const [designName, setDesignName] = useState("");
  const [savedDesigns, setSavedDesigns] = useState<UserDesign[]>([]);
  const [saved, setSaved] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [repeatType, setRepeatType] = useState<RepeatType>("full_drop");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [fabricChoice, setFabricChoice] = useState("");
  const [fabricCutChoice, setFabricCutChoice] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const loadSavedDesigns = useCallback(() => {
    if (!user) return [];
    return userDesignsApi.getDesignsByUserId(user.id);
  }, [user]);

  const refreshLibrary = useCallback(() => {
    setSavedDesigns(loadSavedDesigns());
  }, [loadSavedDesigns]);

  React.useEffect(() => {
    if (user) setSavedDesigns(loadSavedDesigns());
  }, [user, loadSavedDesigns]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTileImageUrl(reader.result as string);
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
    setDesignName(file.name.replace(/\.[^.]+$/, "") || "My pattern");
    setSaved(false);
    e.target.value = "";
  };

  const handleSaveToLibrary = () => {
    if (!user || !tileImageUrl) return;
    const name = designName.trim() || "My pattern";
    userDesignsApi.saveDesign(user.id, {
      name,
      imageDataUrl: tileImageUrl,
      repeatType,
      fabricChoice: fabricChoice || undefined,
      fabricCutChoice: fabricCutChoice || undefined,
      widthCm: widthCm || undefined,
      heightCm: heightCm || undefined,
      tileSize,
    });
    setSaved(true);
    refreshLibrary();
  };

  const handleDeleteClick = (id: string) => {
    if (user) setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!user || !deleteConfirmId) return;
    userDesignsApi.deleteDesign(user.id, deleteConfirmId);
    refreshLibrary();
    setDeleteConfirmId(null);
  };

  const handleUseInOrder = (design: UserDesign) => {
    navigate("/shop", { state: { useMyDesignId: design.id } });
  };

  // Draw canvas for half_drop / mirror repeat preview (mirror = kaleidoscope: original + H flip + V flip + HV flip per 2x2 block)
  useEffect(() => {
    if (!tileImageUrl || (repeatType !== "half_drop" && repeatType !== "mirror")) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : 400;
      const h = parent ? parent.clientHeight : 400;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      const ts = tileSize;
      if (repeatType === "half_drop") {
        for (let row = -1; row <= Math.ceil(h / ts) + 1; row++) {
          for (let col = -1; col <= Math.ceil(w / ts) + 1; col++) {
            const x = col * ts + (row % 2 === 0 ? 0 : ts / 2);
            const y = row * ts;
            ctx.drawImage(img, x, y, ts, ts);
          }
        }
      } else {
        // Mirror like reference: 2x2 block with axes of symmetry between tiles (kaleidoscope style)
        // Top-left: original. Top-right: H-flip. Bottom-left: V-flip. Bottom-right: H+V flip.
        // Use translate so each flipped tile sits in its correct cell (not overlapping original).
        const tw = ts * 2;
        const th = ts * 2;
        for (let row = -1; row <= Math.ceil(h / th) + 1; row++) {
          for (let col = -1; col <= Math.ceil(w / tw) + 1; col++) {
            const bx = col * tw;
            const by = row * th;
            ctx.drawImage(img, bx, by, ts, ts);
            ctx.save();
            ctx.translate(bx + 2 * ts, by);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0, ts, ts);
            ctx.restore();
            ctx.save();
            ctx.translate(bx, by + 2 * ts);
            ctx.scale(1, -1);
            ctx.drawImage(img, 0, 0, ts, ts);
            ctx.restore();
            ctx.save();
            ctx.translate(bx + 2 * ts, by + 2 * ts);
            ctx.scale(-1, -1);
            ctx.drawImage(img, 0, 0, ts, ts);
            ctx.restore();
          }
        }
      }
    };
    img.src = tileImageUrl;
    imageRef.current = img;
  }, [tileImageUrl, repeatType, tileSize]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar />
        <Navbar />
        <section className="py-24 px-4">
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground mb-6">{t("pages.patternStudio.loginRequired")}</p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold uppercase"
            >
              {t("nav.login")}
            </button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      {/* Hero – match Portfolio */}
      <section className="bg-primary relative min-h-[300px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 py-16">
          <h1 className="font-heading text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">
            {t("pages.patternStudio.title")}
          </h1>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent z-10" />
          <img src={heroPrinting} alt="" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Content section – match Portfolio (faded word, red overline, title, then grid/card) */}
      <section className="relative pt-16 pb-24 z-10 px-4">
        {/* Decorative lines – match Portfolio */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg className="absolute top-0 right-0 w-[500px] h-[500px]" viewBox="0 0 500 500" fill="none">
            <path d="M480 20C400 150 550 300 350 450" stroke="#004A99" strokeWidth="2" fill="none" className="opacity-50" />
            <path d="M500 100C420 230 570 380 370 530" stroke="#004A99" strokeWidth="1" fill="none" className="opacity-30" />
          </svg>
        </div>

        <div className="container mx-auto relative cursor-default">
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
              <span className="text-[120px] md:text-[200px] font-heading font-black text-gray-100 uppercase tracking-tighter opacity-80 scale-x-110">
                Design
              </span>
            </div>
            <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-4 relative z-10">
              {t("pages.patternStudio.title")}
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary relative z-10">
              {t("pages.patternStudio.createPattern")}
            </h2>
          </div>

          {/* Digital Fabrics style: left options, right preview with rulers */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-10 relative z-20">
            {/* Left panel – options */}
            <div className="space-y-4 sm:space-y-6 bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm">
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={handleFileChange} />
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-wider hover:opacity-90"
                >
                  <UploadCloud className="w-5 h-5" /> {t("pages.patternStudio.uploadYourFile")}
                </button>
                <p className="text-xs text-slate-500 mt-2">{t("pages.patternStudio.acceptedFormats")}</p>
                {uploadedFileName && <p className="text-xs text-slate-700 mt-1 truncate font-medium" title={uploadedFileName}>{uploadedFileName}</p>}
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  {t("pages.patternStudio.checkFileSize")} <Info className="w-3.5 h-3.5 text-slate-400" />
                </h4>
                <p className="text-[11px] text-red-600 font-medium mb-2">{t("pages.patternStudio.dpiWarning")}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t("pages.patternStudio.widthCm")}</label>
                    <input type="number" min={1} step={0.1} value={widthCm} onChange={(e) => setWidthCm(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" placeholder="—" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t("pages.patternStudio.heightCm")}</label>
                    <input type="number" min={1} step={0.1} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" placeholder="—" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t("pages.patternStudio.fabric")}</label>
                <select value={fabricChoice} onChange={(e) => setFabricChoice(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white">
                  <option value="">{t("pages.patternStudio.chooseOption")}</option>
                  {FABRIC_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t("pages.patternStudio.fabricCut")}</label>
                <select value={fabricCutChoice} onChange={(e) => setFabricCutChoice(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white">
                  <option value="">{t("pages.patternStudio.chooseOption")}</option>
                  <option value="linear">{t("pages.patternStudio.linearMetre")}</option>
                  <option value="strike">{t("pages.patternStudio.strikeOff")}</option>
                </select>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">{t("pages.patternStudio.chooseRepeat")}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "full_drop" as const, label: t("pages.patternStudio.fullDrop"), visual: <span className="text-[10px] font-mono leading-tight inline-block text-center">dd<br />dd</span> },
                    { id: "half_drop" as const, label: t("pages.patternStudio.halfDrop"), visual: <span className="text-[10px] font-mono leading-tight inline-block text-center">d d<br /> d d</span> },
                    { id: "centre" as const, label: t("pages.patternStudio.centre"), visual: <span className="text-[10px] font-mono leading-tight inline-block"> d </span> },
                    { id: "mirror" as const, label: t("pages.patternStudio.mirror"), visual: <span className="text-[10px] font-mono leading-tight inline-block text-center">d b<br />q p</span> },
                  ].map(({ id, label, visual }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRepeatType(id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 text-xs font-bold uppercase transition-all min-h-[44px] sm:min-h-[72px] touch-manipulation",
                        repeatType === id ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      <span className="w-8 h-8 flex items-center justify-center rounded bg-white/80 border border-slate-100">{visual}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {tileImageUrl && (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t("pages.patternStudio.designName")}</label>
                    <input type="text" value={designName} onChange={(e) => setDesignName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" placeholder={t("pages.patternStudio.designNamePlaceholder")} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t("pages.patternStudio.tileSize")} — <span className="text-primary">{tileSize}px</span></label>
                    <div className="flex items-center gap-2">
                      <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
                      <input type="range" min={MIN_TILE} max={MAX_TILE} value={tileSize} onChange={(e) => setTileSize(Number(e.target.value))} className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-primary cursor-pointer" />
                      <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </div>
                  <button type="button" onClick={handleSaveToLibrary} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90">
                    <Save className="w-4 h-4" /> {t("pages.patternStudio.saveToLibrary")}
                  </button>
                  {saved && <p className="text-xs font-bold text-green-600 text-center">{t("pages.patternStudio.saved")}</p>}
                </>
              )}
            </div>

            {/* Right panel – See your design with rulers (like reference: Fabric Width 10–150 cm, Fabric/roll Length 10–100 cm) */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 shrink-0" /> {t("pages.patternStudio.seeYourDesign")}
              </p>
              <div className="p-3 sm:p-4">
                <div className="flex flex-col flex-1 min-h-[280px] sm:min-h-[360px]">
                  {/* Top ruler: Fabric Width, CM 10 to 150 (like reference) */}
                  <div className="flex items-end mb-0.5">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase w-14 sm:w-24 shrink-0 pr-1 sm:pr-2">{t("pages.patternStudio.fabricWidth")}</span>
                    <div className="flex-1 relative border-b-2 border-slate-200 pb-1 min-h-[22px] sm:min-h-[26px]">
                      {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150].map((n) => (
                        <span key={n} className="absolute text-[8px] sm:text-[9px] font-bold text-slate-600" style={{ left: `${((n - 10) / 140) * 100}%`, transform: "translateX(-50%)" }}>{n}</span>
                      ))}
                      <span className="absolute right-0 top-0 text-[8px] sm:text-[9px] font-bold text-slate-400">CM</span>
                    </div>
                  </div>
                  <div className="flex flex-1 gap-0 min-h-[280px] sm:min-h-[360px] lg:min-h-[440px]">
                    {/* Left ruler: Fabric/roll Length, CM 10 to 100 (like reference) */}
                    <div className="flex flex-col w-14 sm:w-24 shrink-0 pr-1 sm:pr-2 border-r-2 border-slate-200">
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase whitespace-nowrap mb-1">{t("pages.patternStudio.fabricRollLength")}</span>
                      <div className="flex-1 flex flex-col justify-between py-0.5 min-h-[260px] sm:min-h-[340px] lg:min-h-[420px]">
                        {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => (
                          <span key={n} className="text-[8px] sm:text-[9px] font-bold text-slate-600">{n}</span>
                        ))}
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400">CM</span>
                    </div>
                    {/* Preview area – pattern with mirror/full drop etc. (taller) */}
                    <div className="flex-1 rounded-r-xl border-2 border-slate-200 border-l-0 overflow-hidden bg-slate-50 relative min-h-[260px] sm:min-h-[340px] lg:min-h-[420px]">
                      {!tileImageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
                          {t("pages.patternStudio.uploadToSeePreview")}
                        </div>
                      )}
                      {tileImageUrl && repeatType === "full_drop" && (
                        <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: `url(${tileImageUrl})`, backgroundSize: `${tileSize}px` }} />
                      )}
                      {tileImageUrl && repeatType === "centre" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-no-repeat bg-center" style={{ backgroundImage: `url(${tileImageUrl})`, backgroundSize: `${tileSize}px` }} />
                      )}
                      {tileImageUrl && (repeatType === "half_drop" || repeatType === "mirror") && (
                        <canvas ref={previewCanvasRef} className="absolute inset-0 w-full h-full" />
                      )}
                    </div>
                  </div>

                  {/* Product information – directly under the place that reflects the design */}
                  <div className="flex gap-0 mt-4 sm:mt-6">
                    <div className="w-14 sm:w-24 shrink-0" aria-hidden />
                    <div className="flex-1 pt-3 sm:pt-4 border-t border-slate-200 min-w-0">
                      <h3 className="font-heading text-base sm:text-lg font-black text-primary mb-2">{t("pages.patternStudio.productInfoTitle")}</h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3 break-words">{t("pages.patternStudio.productInfoIntro")}</p>
                      <ul className="list-disc list-inside text-slate-600 text-xs sm:text-sm space-y-1.5 mb-3 break-words">
                        <li>{t("pages.patternStudio.productInfoBullet1")}</li>
                        <li>{t("pages.patternStudio.productInfoBullet2")}</li>
                        <li>{t("pages.patternStudio.productInfoBullet3")}</li>
                        <li>{t("pages.patternStudio.productInfoBullet4")}</li>
                        <li>{t("pages.patternStudio.productInfoBullet5")}</li>
                      </ul>
                      <p className="text-slate-500 text-xs border-l-4 border-primary/30 pl-3 py-1 break-words">{t("pages.patternStudio.productInfoNote")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My library – designs with repeat & fabric reflected */}
          <div className="max-w-6xl mx-auto mt-12 bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-6 md:p-8 relative z-20">
            <h2 className="font-heading text-2xl font-black text-primary mb-2 flex items-center gap-2">
              <Palette className="w-7 h-7" /> {t("pages.patternStudio.myLibrary")}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">{t("pages.patternStudio.myLibraryDesc")}</p>
            {savedDesigns.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">{t("pages.patternStudio.noDesignsYet")}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {savedDesigns.map((d) => {
                  const fabricName = d.fabricChoice ? FABRIC_OPTIONS.find((f) => f.id === d.fabricChoice)?.name ?? d.fabricChoice : null;
                  const repeatLabel = d.repeatType === "full_drop" ? t("pages.patternStudio.fullDrop") : d.repeatType === "half_drop" ? t("pages.patternStudio.halfDrop") : d.repeatType === "centre" ? t("pages.patternStudio.centre") : d.repeatType === "mirror" ? t("pages.patternStudio.mirror") : null;
                  return (
                    <div
                      key={d.id}
                      className="group rounded-xl border-2 border-slate-100 overflow-hidden hover:border-primary/30 transition-all"
                    >
                      <div className="aspect-square bg-slate-100 overflow-hidden">
                        <PatternThumbnail imageDataUrl={d.imageDataUrl} repeatType={d.repeatType} tileSize={d.tileSize ?? 80} className="min-w-full min-h-full" />
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-slate-900 text-sm truncate">{d.name}</p>
                        {(fabricName || repeatLabel) && (
                          <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5 truncate">
                            {[repeatLabel, fabricName].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => handleUseInOrder(d)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> {t("pages.patternStudio.useInOrder")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(d.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                            title={t("pages.patternStudio.delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("pages.patternStudio.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>This design will be removed from your library.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PatternStudio;
