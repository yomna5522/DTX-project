import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { Search, UploadCloud, RefreshCcw, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi } from "@/api/orders";
import type { DesignChoice, FabricChoice, DesignSource, FabricType, FabricSource, PaymentMethod } from "@/types/order";
import heroPrinting from "@/assets/hero-printing.jpg";

const emptyDesignChoice: DesignChoice = { source: "preset" };
const emptyFabricChoice: FabricChoice = { fabricType: "artificial", fabricSource: "factory" };

const Shop = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const STEPS = [
    { id: 1, titleKey: "design", subtitleKey: "design" },
    { id: 2, titleKey: "fabric", subtitleKey: "fabric" },
    { id: 3, titleKey: "quantityNotes", subtitleKey: "quantityNotes" },
    { id: 4, titleKey: "review", subtitleKey: "review" },
    { id: 5, titleKey: "payment", subtitleKey: "payment" },
  ];
  const [step, setStep] = useState(1);
  const [designChoice, setDesignChoice] = useState<DesignChoice>(emptyDesignChoice);
  const [designPresetId, setDesignPresetId] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [repeatOrderId, setRepeatOrderId] = useState<string | null>(null);
  const [fabricChoice, setFabricChoice] = useState<FabricChoice>(emptyFabricChoice);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState("");

  const presets = useMemo(() => ordersApi.getPresetDesigns(), []);
  const userOrders = useMemo(() => (user ? ordersApi.getOrdersByUserId(user.id) : []), [user]);

  const resolvedDesignChoice: DesignChoice = useMemo(() => {
    if (designChoice.source === "preset" && designPresetId) return { source: "preset", presetId: designPresetId };
    if (designChoice.source === "upload") return { source: "upload", uploadFileName: uploadFileName || "uploaded-file" };
    if (designChoice.source === "repeat" && repeatOrderId) return { source: "repeat", repeatOrderId };
    return designChoice;
  }, [designChoice, designPresetId, uploadFileName, repeatOrderId]);

  const unitPrice = useMemo(() => {
    if (designChoice.source === "preset" && !designPresetId) return 0;
    if (designChoice.source === "upload" && !uploadFileName) return 0;
    if (designChoice.source === "repeat" && !repeatOrderId) return 0;
    return ordersApi.computeUnitPrice(resolvedDesignChoice, fabricChoice);
  }, [resolvedDesignChoice, fabricChoice, designChoice.source, designPresetId, uploadFileName, repeatOrderId]);

  const totalPrice = unitPrice * quantity;
  const canProceedFromStep1 =
    (designChoice.source === "preset" && designPresetId) ||
    (designChoice.source === "upload" && uploadFileName) ||
    (designChoice.source === "repeat" && repeatOrderId);
  const canProceedFromStep3 = quantity >= 1;

  const handleSubmitOrder = () => {
    setSubmitError("");
    if (!user) return;
    const finalChoice: DesignChoice =
      designChoice.source === "preset" && designPresetId
        ? { source: "preset", presetId: designPresetId }
        : designChoice.source === "upload"
          ? { source: "upload", uploadFileName: uploadFileName || "uploaded" }
          : designChoice.source === "repeat" && repeatOrderId
            ? { source: "repeat", repeatOrderId }
            : resolvedDesignChoice;
    try {
      const order = ordersApi.createOrder({
        userId: user.id,
        customerType: user.customerType,
        designChoice: finalChoice,
        fabricChoice,
        quantity,
        notes,
        paymentMethod,
        paymentProofFileName: paymentProofFile?.name,
      });
      navigate(`/orders/${order.id}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : t("pages.shop.submitError"));
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <TopBar />
      <Navbar />

      <section className="bg-primary relative min-h-[200px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 py-12">
          <h1 className="font-heading text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">
            {t("pages.shop.title")}
          </h1>
          <p className="text-white/80 font-body text-sm mt-2">
            {t("pages.shop.step", { current: step, total: STEPS.length })}: {t(`pages.shop.${STEPS[step - 1].subtitleKey}`)}
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent z-10" />
          <img src={heroPrinting} alt="Shop" className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="relative py-12 z-10 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-10">
            {STEPS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`w-10 h-10 rounded-full font-bold text-sm transition-colors ${
                    step === s.id ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:bg-accent/20"
                  }`}
                >
                  {s.id}
                </button>
            ))}
          </div>

          {/* Step 1: Design */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <button
                  type="button"
                  onClick={() => setDesignChoice({ source: "preset" })}
                  className={`p-6 border-2 text-left rounded-lg transition-all ${
                    designChoice.source === "preset" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                  }`}
                >
                  <Search className="w-10 h-10 text-primary mb-3" />
                  <h3 className="font-heading text-lg font-black text-primary">{t("pages.shop.browseDesigns")}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{t("pages.shop.browseDesignsDesc")}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDesignChoice({ source: "upload" })}
                  className={`p-6 border-2 text-left rounded-lg transition-all ${
                    designChoice.source === "upload" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                  }`}
                >
                  <UploadCloud className="w-10 h-10 text-primary mb-3" />
                  <h3 className="font-heading text-lg font-black text-primary">{t("pages.shop.uploadYours")}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{t("pages.shop.uploadYoursDesc")}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDesignChoice({ source: "repeat" })}
                  className={`p-6 border-2 text-left rounded-lg transition-all ${
                    designChoice.source === "repeat" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                  }`}
                >
                  <RefreshCcw className="w-10 h-10 text-primary mb-3" />
                  <h3 className="font-heading text-lg font-black text-primary">{t("pages.shop.repeatDesign")}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{t("pages.shop.repeatDesignDesc")}</p>
                </button>
              </div>

              {designChoice.source === "preset" && (
                <div>
                  <p className="font-bold text-primary mb-3">{t("pages.shop.selectDesign")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setDesignPresetId(p.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          designPresetId === p.id ? "border-accent bg-accent/5" : "border-border"
                        }`}
                      >
                        <div className="aspect-square bg-muted rounded mb-2" />
                        <p className="font-heading font-bold text-primary">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                        <p className="text-sm font-bold text-accent mt-1">{p.basePricePerUnit} EGP/unit</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {designChoice.source === "upload" && (
                <div>
                  <label className="block font-bold text-primary mb-2">{t("pages.shop.designFile")}</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.ai,.eps"
                    onChange={(e) => setUploadFileName(e.target.files?.[0]?.name ?? "")}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-accent file:text-white"
                  />
                  {uploadFileName && <p className="text-sm text-muted-foreground mt-1">{t("pages.shop.selected")}: {uploadFileName}</p>}
                </div>
              )}

              {designChoice.source === "repeat" && userOrders.length > 0 && (
                <div>
                  <p className="font-bold text-primary mb-3">{t("pages.shop.selectOrderToRepeat")}</p>
                  <div className="space-y-2">
                    {userOrders.slice(0, 10).map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setRepeatOrderId(o.id)}
                        className={`w-full p-3 border-2 rounded-lg text-left flex justify-between items-center ${
                          repeatOrderId === o.id ? "border-accent bg-accent/5" : "border-border"
                        }`}
                      >
                        <span className="font-medium text-primary">{t("pages.orders.order")} {o.id}</span>
                        <span className="text-sm text-muted-foreground">{o.totalAmount} EGP</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {designChoice.source === "repeat" && userOrders.length === 0 && (
                <p className="text-muted-foreground">{t("pages.shop.noOrdersToRepeat")}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceedFromStep1}
                  className="group bg-accent text-white pl-6 pr-2 py-2 flex items-center gap-2 font-bold text-xs tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("pages.shop.nextFabric")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Fabric */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <p className="font-bold text-primary mb-3">{t("pages.shop.fabricType")}</p>
                <div className="flex gap-6">
                  {(["artificial", "natural"] as FabricType[]).map((ft) => (
                    <label key={ft} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fabricType"
                        checked={fabricChoice.fabricType === ft}
                        onChange={() => setFabricChoice((prev) => ({ ...prev, fabricType: ft }))}
                        className="text-accent"
                      />
                      <span className="font-medium">{t(`pages.shop.${ft}`)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-bold text-primary mb-3">{t("pages.shop.fabricSource")}</p>
                <div className="flex gap-6">
                  {(["customer", "factory"] as FabricSource[]).map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fabricSource"
                        checked={fabricChoice.fabricSource === s}
                        onChange={() => setFabricChoice((prev) => ({ ...prev, fabricSource: s }))}
                        className="text-accent"
                      />
                      <span className="font-medium">{s === "customer" ? t("pages.shop.iProvideFabric") : t("pages.shop.factoryProvides")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-primary font-bold text-sm"
                >
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("pages.shop.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="group bg-accent text-white pl-6 pr-2 py-2 flex items-center gap-2 font-bold text-xs tracking-widest uppercase"
                >
                  {t("pages.shop.nextQuantityNotes")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Quantity & Notes */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <label className="block font-bold text-primary mb-2">{t("pages.shop.quantity")}</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full max-w-[120px] bg-[#F5F7F9] border-none py-3 px-4 rounded-lg text-sm focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block font-bold text-primary mb-2">{t("pages.shop.notes")}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder={t("pages.shop.notesPlaceholder")}
                  className="w-full bg-[#F5F7F9] border-none py-3 px-4 rounded-lg text-sm focus:ring-1 focus:ring-accent resize-none"
                />
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 text-primary font-bold text-sm">
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("pages.shop.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!canProceedFromStep3}
                  className="group bg-accent text-white pl-6 pr-2 py-2 flex items-center gap-2 font-bold text-xs tracking-widest uppercase disabled:opacity-50"
                >
                  {t("pages.shop.nextReview")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Pricing */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 space-y-2">
                <p className="text-sm text-muted-foreground">{t("pages.shop.designLabel")}: {designChoice.source}</p>
                <p className="text-sm text-muted-foreground">{t("pages.shop.fabricLabel")}: {fabricChoice.fabricType}, {fabricChoice.fabricSource}</p>
                <p className="text-sm text-muted-foreground">{t("pages.shop.quantityLabel")}: {quantity}</p>
                {notes && <p className="text-sm text-muted-foreground">{t("pages.shop.notes")}: {notes}</p>}
                <p className="font-heading text-2xl font-black text-primary mt-4">
                  {t("pages.shop.unitPrice")}: {unitPrice} EGP · {t("pages.shop.total")}: {totalPrice} EGP
                </p>
                {user?.customerType === "NEW" && (
                  <p className="text-sm text-accent font-medium">{t("pages.shop.digitalInvoice")}</p>
                )}
                {user?.customerType === "EXISTING" && (
                  <p className="text-sm text-amber-600 font-medium">{t("pages.shop.waitingForInvoice")}</p>
                )}
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 text-primary font-bold text-sm">
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("pages.shop.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="group bg-accent text-white pl-6 pr-2 py-2 flex items-center gap-2 font-bold text-xs tracking-widest uppercase"
                >
                  {t("pages.shop.nextPayment")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {step === 5 && (
            <div className="space-y-8">
              <div>
                <p className="font-bold text-primary mb-3">{t("pages.shop.paymentMethod")}</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border-2 rounded-lg border-border hover:border-accent/50">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="text-accent"
                    />
                    <span className="font-medium">{t("pages.shop.cod")}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 border-2 rounded-lg border-border hover:border-accent/50">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "BANK_TRANSFER"}
                      onChange={() => setPaymentMethod("BANK_TRANSFER")}
                      className="text-accent"
                    />
                    <span className="font-medium">{t("pages.shop.bankTransfer")}</span>
                  </label>
                </div>
              </div>
              {paymentMethod === "BANK_TRANSFER" && (
                <div>
                  <label className="block font-bold text-primary mb-2">{t("pages.shop.paymentProof")}</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setPaymentProofFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-accent file:text-white"
                  />
                </div>
              )}
              {submitError && <p className="text-destructive text-sm font-medium">{submitError}</p>}
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(4)} className="flex items-center gap-2 text-primary font-bold text-sm">
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("pages.shop.back")}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  className="group bg-accent text-white pl-8 pr-3 py-3 flex items-center gap-2 font-bold text-xs tracking-widest uppercase hover:bg-accent/90"
                >
                  {t("pages.shop.submitOrder")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
};

export default Shop;
