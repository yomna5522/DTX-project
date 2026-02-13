import React, { useState, useRef, useCallback } from "react";
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
import heroPrinting from "@/assets/hero-printing.jpg";

const DEFAULT_TILE_SIZE = 120;
const MIN_TILE = 40;
const MAX_TILE = 400;

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
    reader.onload = () => setTileImageUrl(reader.result as string);
    reader.readAsDataURL(file);
    setDesignName(file.name.replace(/\.[^.]+$/, "") || "My pattern");
    setSaved(false);
    e.target.value = "";
  };

  const handleSaveToLibrary = () => {
    if (!user || !tileImageUrl) return;
    const name = designName.trim() || "My pattern";
    userDesignsApi.saveDesign(user.id, { name, imageDataUrl: tileImageUrl });
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

      {/* Hero – same as Services / Shop */}
      <section className="bg-primary relative min-h-[300px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 py-16">
          <h1 className="font-heading text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
            {t("pages.patternStudio.title")}
          </h1>
          <p className="text-white/90 font-body text-sm mt-3 max-w-xl">
            {t("pages.patternStudio.subtitle")}
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent z-10" />
          <img src={heroPrinting} alt="" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* First section – same structure as Services / About */}
      <section className="relative pt-16 pb-24 z-10 px-4 bg-white">
        {/* Background watermark like Services/About */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
          <span className="text-[120px] md:text-[200px] font-heading font-black text-gray-100 uppercase tracking-tighter opacity-80 scale-x-110">
            Pattern
          </span>
        </div>
        <div className="container mx-auto relative">
          <div className="text-center mb-12">
            <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-2">
              Design Studio
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary relative z-10">
              {t("pages.patternStudio.createPattern")}
            </h2>
          </div>

          {/* Create pattern card – same card style as other pages */}
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden relative z-20">
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 md:px-8 py-5 border-b border-slate-100">
              <h3 className="font-heading text-xl md:text-2xl font-black text-primary flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-primary" />
                </span>
                {t("pages.patternStudio.createPattern")}
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                {t("pages.patternStudio.createDesc")}
              </p>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Left: Upload & controls */}
                <div className="space-y-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 overflow-hidden transition-colors hover:border-primary/40 hover:bg-slate-50">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full min-h-[200px] md:min-h-[240px] flex flex-col items-center justify-center gap-4 py-10 px-6 text-slate-500 hover:text-primary transition-colors"
                    >
                      <span className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
                        <UploadCloud className="w-10 h-10" />
                      </span>
                      <span className="font-bold text-base">{t("pages.patternStudio.uploadTile")}</span>
                      <span className="text-xs text-slate-400">PNG, JPG or WebP</span>
                    </button>
                  </div>
                  {tileImageUrl && (
                    <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                          {t("pages.patternStudio.designName")}
                        </label>
                        <input
                          type="text"
                          value={designName}
                          onChange={(e) => setDesignName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder={t("pages.patternStudio.designNamePlaceholder")}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          {t("pages.patternStudio.tileSize")} — <span className="text-primary">{tileSize}px</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <ZoomOut className="w-5 h-5 text-slate-400 shrink-0" />
                          <input
                            type="range"
                            min={MIN_TILE}
                            max={MAX_TILE}
                            value={tileSize}
                            onChange={(e) => setTileSize(Number(e.target.value))}
                            className="flex-1 h-3 rounded-full appearance-none bg-slate-200 accent-primary cursor-pointer"
                          />
                          <ZoomIn className="w-5 h-5 text-slate-400 shrink-0" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{t("pages.patternStudio.tileSizeHint")}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveToLibrary}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20"
                      >
                        <Save className="w-5 h-5" /> {t("pages.patternStudio.saveToLibrary")}
                      </button>
                      {saved && (
                        <p className="text-sm font-bold text-green-600 text-center">{t("pages.patternStudio.saved")}</p>
                      )}
                    </div>
                  )}
                </div>
                {/* Right: Seamless repeat preview */}
                <div className="md:sticky md:top-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" /> {t("pages.patternStudio.repeatPreview")}
                  </p>
                  <div
                    className="w-full aspect-square max-h-[320px] md:max-h-[400px] rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100 shadow-inner"
                    style={
                      tileImageUrl
                        ? {
                            backgroundImage: `url(${tileImageUrl})`,
                            backgroundRepeat: "repeat",
                            backgroundSize: `${tileSize}px`,
                          }
                        : {}
                    }
                  />
                  {!tileImageUrl && (
                    <p className="text-center text-slate-400 text-sm mt-3 py-6 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                      {t("pages.patternStudio.uploadToSeePreview")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* My library – same card style */}
          <div className="max-w-6xl mx-auto mt-12 bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-6 md:p-8 relative z-20">
            <h2 className="font-heading text-2xl font-black text-primary mb-2 flex items-center gap-2">
              <Palette className="w-7 h-7" /> {t("pages.patternStudio.myLibrary")}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">{t("pages.patternStudio.myLibraryDesc")}</p>
            {savedDesigns.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">{t("pages.patternStudio.noDesignsYet")}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {savedDesigns.map((d) => (
                  <div
                    key={d.id}
                    className="group rounded-xl border-2 border-slate-100 overflow-hidden hover:border-primary/30 transition-all"
                  >
                    <div
                      className="aspect-square bg-slate-100 bg-repeat bg-center"
                      style={{
                        backgroundImage: `url(${d.imageDataUrl})`,
                        backgroundSize: "80px",
                      }}
                    />
                    <div className="p-3">
                      <p className="font-bold text-slate-900 text-sm truncate">{d.name}</p>
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
                ))}
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
