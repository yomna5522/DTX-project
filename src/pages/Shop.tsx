import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { Search, UploadCloud, RefreshCcw, ArrowRight, ArrowLeft, FileText, Package, HelpCircle, CheckCircle2, Image, File, Eye, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi } from "@/api/orders";
import type { DesignChoice, FabricChoice, DesignSource, FabricType, FabricSource, PaymentMethod, OrderType } from "@/types/order";
import heroPrinting from "@/assets/hero-printing.jpg";
import aestheticWallpaper from "@/assets/𝘈𝘦𝘴𝘵𝘩𝘦𝘵𝘪𝘤 𝘞𝘢𝘭𝘭𝘱𝘢𝘱𝘦𝘳.jpg";
import cherryRedWallpaper from "@/assets/Cherry red wallpaper.jpg";
import ginghamPattern from "@/assets/Free digital gingham scrapbooking paper - ausdruckbares Geschenkpapier - freebie.jpg";
import fabricScrapProject from "@/assets/15 Easy Scrap Fabric Project Ideas to Use Up Leftover Material _ Mummy Time.jpg";
import beautyOfCulture from "@/assets/Beauty of the Culture_.jpg";
import downloadFabric from "@/assets/download.jpg";

const emptyDesignChoice: DesignChoice = { source: "existing" };
// No default selections - customer must choose
const emptyFabricChoice: Partial<FabricChoice> = {};

const Shop = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const formSectionRef = useRef<HTMLElement>(null);
  
  // Step 1: Design Source
  const [designChoice, setDesignChoice] = useState<DesignChoice>(emptyDesignChoice);
  const [designPresetId, setDesignPresetId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadPreviewUrls, setUploadPreviewUrls] = useState<Map<string, string>>(new Map());
  const [repeatOrderId, setRepeatOrderId] = useState<string | null>(null);
  
  // Step 2: Fabric & Order Type
  const [fabricChoice, setFabricChoice] = useState<Partial<FabricChoice>>(emptyFabricChoice);
  const [factoryFabricId, setFactoryFabricId] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState("");
  const [notSureInquiry, setNotSureInquiry] = useState("");
  
  // Step 3: Quantity (only for factory provides)
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  
  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState("");

  const presets = useMemo(() => ordersApi.getPresetDesigns(), []);
  const userOrders = useMemo(() => (user ? ordersApi.getOrdersByUserId(user.id) : []), [user]);
  const factoryFabrics = useMemo(() => ordersApi.getFactoryFabrics(), []);
  
  // Filter factory fabrics by selected fabric type
  const availableFabrics = useMemo(() => {
    if (!fabricChoice.fabricType) return [];
    return factoryFabrics.filter(f => f.type === fabricChoice.fabricType);
  }, [factoryFabrics, fabricChoice.fabricType]);

  const resolvedDesignChoice: DesignChoice = useMemo(() => {
    if (designChoice.source === "existing" && designPresetId) return { source: "existing", presetId: designPresetId };
    if (designChoice.source === "upload") return { source: "upload", uploadFileName: uploadedFiles.map(f => f.name).join(", ") || "uploaded-file" };
    if (designChoice.source === "repeat" && repeatOrderId) return { source: "repeat", repeatOrderId };
    return designChoice;
  }, [designChoice, designPresetId, uploadedFiles, repeatOrderId]);

  const resolvedFabricChoice: Partial<FabricChoice> = useMemo(() => {
    const base = { ...fabricChoice };
    if (fabricChoice.fabricSource === "factory" && factoryFabricId) {
      base.factoryFabricId = factoryFabricId;
    } else if (fabricChoice.fabricSource === "customer") {
      base.customerNotes = customerNotes;
    } else if (fabricChoice.fabricSource === "not_sure") {
      base.inquiry = notSureInquiry;
    }
    return base;
  }, [fabricChoice, factoryFabricId, customerNotes, notSureInquiry]);

  const unitPrice = useMemo(() => {
    if (designChoice.source === "existing" && !designPresetId) return 0;
    if (designChoice.source === "upload" && uploadedFiles.length === 0) return 0;
    if (designChoice.source === "repeat" && !repeatOrderId) return 0;
    if (fabricChoice.fabricSource === "factory" && !factoryFabricId) return 0;
    if (!fabricChoice.fabricType || !fabricChoice.orderType || !fabricChoice.fabricSource) return 0;
    return ordersApi.computeUnitPrice(resolvedDesignChoice, resolvedFabricChoice as FabricChoice);
  }, [resolvedDesignChoice, resolvedFabricChoice, designChoice.source, designPresetId, uploadedFiles, repeatOrderId, fabricChoice.fabricSource, factoryFabricId, fabricChoice.fabricType, fabricChoice.orderType]);

  const minimumQuantity = useMemo(() => {
    if (!fabricChoice.fabricType || !fabricChoice.orderType || !fabricChoice.fabricSource) return 1;
    return ordersApi.getMinimumQuantity(resolvedFabricChoice as FabricChoice);
  }, [resolvedFabricChoice, fabricChoice.fabricType, fabricChoice.orderType, fabricChoice.fabricSource]);

  const totalPrice = unitPrice * quantity;

  // Cleanup preview URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      uploadPreviewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [uploadPreviewUrls]);

  // Scroll to form section when step changes
  useEffect(() => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  // Validation for each step
  const canProceedFromStep1 =
    (designChoice.source === "existing" && designPresetId) ||
    (designChoice.source === "upload" && uploadedFiles.length > 0) ||
    (designChoice.source === "repeat" && repeatOrderId);

  const canProceedFromStep2 = 
    fabricChoice.fabricType && 
    fabricChoice.orderType && 
    fabricChoice.fabricSource &&
    ((fabricChoice.fabricSource === "customer" && customerNotes.trim().length > 0) ||
    (fabricChoice.fabricSource === "factory" && factoryFabricId) ||
    (fabricChoice.fabricSource === "not_sure" && notSureInquiry.trim().length > 0));

  const canProceedFromStep3 = quantity >= minimumQuantity;

  const handleSubmitQuotationRequest = () => {
    setSubmitError("");
    if (!user) return;
    
    const finalChoice: DesignChoice =
      designChoice.source === "existing" && designPresetId
        ? { source: "existing", presetId: designPresetId }
        : designChoice.source === "upload"
          ? { source: "upload", uploadFileName: uploadedFiles.map(f => f.name).join(", ") || "uploaded" }
          : designChoice.source === "repeat" && repeatOrderId
            ? { source: "repeat", repeatOrderId }
            : resolvedDesignChoice;
    
    try {
      if (!fabricChoice.fabricType || !fabricChoice.orderType || !fabricChoice.fabricSource) {
        throw new Error(t("pages.shop.pleaseCompleteSelections"));
      }
      // For quotation requests, use default quantity of 1 if not specified
      const requestQuantity = quantity || 1;
      const order = ordersApi.createQuotationRequest({
        userId: user.id,
        designChoice: finalChoice,
        fabricChoice: resolvedFabricChoice as FabricChoice,
        quantity: requestQuantity,
        notes: notes || (fabricChoice.fabricSource === "customer" ? customerNotes : notSureInquiry) || "",
      });
      navigate(`/orders/${order.id}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : t("pages.shop.submitError"));
    }
  };

  const handleSubmitOrder = () => {
    setSubmitError("");
    if (!user) return;
    
    const finalChoice: DesignChoice =
      designChoice.source === "existing" && designPresetId
        ? { source: "existing", presetId: designPresetId }
        : designChoice.source === "upload"
          ? { source: "upload", uploadFileName: uploadedFiles.map(f => f.name).join(", ") || "uploaded" }
          : designChoice.source === "repeat" && repeatOrderId
            ? { source: "repeat", repeatOrderId }
            : resolvedDesignChoice;
    
    try {
      if (!fabricChoice.fabricType || !fabricChoice.orderType || !fabricChoice.fabricSource) {
        throw new Error(t("pages.shop.pleaseCompleteSelections"));
      }
      const order = ordersApi.createOrder({
        userId: user.id,
        customerType: user.customerType,
        designChoice: finalChoice,
        fabricChoice: resolvedFabricChoice as FabricChoice,
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

  // Determine which steps to show based on fabric source
  const shouldShowStep3 = fabricChoice.fabricSource === "factory";
  const shouldShowStep4 = fabricChoice.fabricSource === "factory";
  const isQuotationRequest = fabricChoice.fabricSource === "customer" || fabricChoice.fabricSource === "not_sure";

  const goToNextStep = () => {
    if (step === 2 && !shouldShowStep3) {
      // For quotation requests (customer/not_sure), submit directly instead of going to payment
      if (isQuotationRequest) {
        handleSubmitQuotationRequest();
        return;
      }
      setStep(5); // Skip to payment if not factory provides (shouldn't happen now, but keep for safety)
    } else if (step === 3 && !shouldShowStep4) {
      setStep(5); // Skip pricing if not applicable
    } else if (step === 4) {
      setStep(5); // Pricing to payment
    } else {
      setStep(step + 1);
    }
  };

  const goToPreviousStep = () => {
    if (step === 5 && !shouldShowStep4) {
      setStep(2); // Skip back to fabric if no pricing
    } else if (step === 4 && !shouldShowStep3) {
      setStep(2); // Skip back to fabric if no quantity
    } else {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <TopBar />
      <Navbar />

      {/* Hero Section with Gradient */}
      <section className="bg-primary relative min-h-[280px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6bTAtNWg3djFoLTd6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto md:px-4 relative z-10 py-16">
          <h1 className="font-heading text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
            {t("pages.shop.title")}
          </h1>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-white font-bold text-sm">
                Step {step} of {
                  shouldShowStep3 && shouldShowStep4 ? "5" : 
                  isQuotationRequest ? "2" : "3"
                }
              </p>
            </div>
            <p className="text-white/90 font-medium text-sm">
              {step === 1 ? `🎨 ${t("pages.shop.stepDesignSource")}` : step === 2 ? `🧵 ${t("pages.shop.stepFabricOrder")}` : step === 3 ? `📊 ${t("pages.shop.stepQuantity")}` : step === 4 ? `💰 ${t("pages.shop.stepPricing")}` : `💳 ${t("pages.shop.stepPayment")}`}
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent z-10" />
          <img src={heroPrinting} alt="Shop" className="w-full h-full object-cover" />
        </div>
      </section>

      <section ref={formSectionRef} className="relative py-10 z-10 md:px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Enhanced Step Indicator */}
          <div className="flex justify-center items-center gap-3 mb-12">
            {(isQuotationRequest 
              ? [1, 2] 
              : [1, 2, shouldShowStep3 ? 3 : null, shouldShowStep4 ? 4 : null, 5].filter(Boolean)
            ).map((s, idx, arr) => (
              <div key={idx} className="flex items-center">
                <div
                  className={`relative w-12 h-12 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center ${
                    step === s 
                      ? "bg-gradient-to-br from-accent to-accent/80 text-white shadow-lg shadow-accent/30 scale-110" 
                      : step > (s as number)
                        ? "bg-green-500 text-white"
                        : "bg-white border-2 border-gray-200 text-gray-400"
                  }`}
                >
                  {step > (s as number) ? <CheckCircle2 className="w-6 h-6" /> : s}
                  {step === s && (
                    <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20"></div>
                  )}
                </div>
                {idx < arr.length - 1 && (
                  <div className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-all duration-300 ${
                    step > (s as number) ? "bg-green-500" : "bg-gray-200"
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Form Container with Card Style */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 p-4 md:p-8 border border-gray-100 max-w-4xl mx-auto">
            {/* STEP 1: Design Source */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center mb-8">
                  <h2 className="font-heading text-4xl font-black text-primary mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t("pages.shop.step1Title")}
                  </h2>
                  <p className="text-muted-foreground text-lg">{t("pages.shop.step1Subtitle")}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Existing Design */}
                  <button
                    type="button"
                    onClick={() => setDesignChoice({ source: "existing" })}
                    className={`group relative p-8 border-2 text-left rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      designChoice.source === "existing" 
                        ? "border-accent bg-gradient-to-br from-accent/5 to-accent/10 shadow-lg shadow-accent/20" 
                        : "border-gray-200 hover:border-accent/50 bg-white"
                    }`}
                  >
                    <div className="absolute top-4 right-4">
                      {designChoice.source === "existing" && (
                        <CheckCircle2 className="w-6 h-6 text-accent" />
                      )}
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-heading text-xl font-black text-primary mb-2">{t("pages.shop.existingDesign")}</h3>
                    <p className="text-muted-foreground text-sm">{t("pages.shop.existingDesignDesc")}</p>
                  </button>

                  {/* Repeat Design */}
                  <button
                    type="button"
                    onClick={() => setDesignChoice({ source: "repeat" })}
                    className={`group relative p-8 border-2 text-left rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      designChoice.source === "repeat" 
                        ? "border-accent bg-gradient-to-br from-accent/5 to-accent/10 shadow-lg shadow-accent/20" 
                        : "border-gray-200 hover:border-accent/50 bg-white"
                    }`}
                  >
                    <div className="absolute top-4 right-4">
                      {designChoice.source === "repeat" && (
                        <CheckCircle2 className="w-6 h-6 text-accent" />
                      )}
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <RefreshCcw className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-heading text-xl font-black text-primary mb-2">{t("pages.shop.repeatDesign")}</h3>
                    <p className="text-muted-foreground text-sm">{t("pages.shop.repeatDesignDesc")}</p>
                  </button>

                  {/* Upload Design */}
                  <button
                    type="button"
                    onClick={() => setDesignChoice({ source: "upload" })}
                    className={`group relative p-8 border-2 text-left rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      designChoice.source === "upload" 
                        ? "border-accent bg-gradient-to-br from-accent/5 to-accent/10 shadow-lg shadow-accent/20" 
                        : "border-gray-200 hover:border-accent/50 bg-white"
                    }`}
                  >
                    <div className="absolute top-4 right-4">
                      {designChoice.source === "upload" && (
                        <CheckCircle2 className="w-6 h-6 text-accent" />
                      )}
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-heading text-xl font-black text-primary mb-2">{t("pages.shop.uploadDesign")}</h3>
                    <p className="text-muted-foreground text-sm">{t("pages.shop.uploadDesignDesc")}</p>
                  </button>
                </div>

                {/* Existing Design Selection */}
                {designChoice.source === "existing" && (
                  <div className="animate-in slide-in-from-top duration-500 mt-8">
                    <p className="font-bold text-primary mb-4 text-lg">{t("pages.shop.selectDesign")}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {presets.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setDesignPresetId(p.id)}
                          className={`group p-5 border-2 rounded-xl text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                            designPresetId === p.id 
                              ? "border-accent bg-accent/5 shadow-md shadow-accent/20" 
                              : "border-gray-200 hover:border-accent/50"
                          }`}
                        >
                          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 overflow-hidden">
                            <img 
                              src={p.imageUrl} 
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <p className="font-heading font-bold text-primary mb-1">{p.name}</p>
                          <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
                          <p className="text-sm font-bold text-accent">{p.basePricePerUnit} EGP/unit</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repeat Design Selection */}
                {designChoice.source === "repeat" && userOrders.length > 0 && (
                  <div className="animate-in slide-in-from-top duration-500 mt-8">
                    <p className="font-bold text-primary mb-4 text-lg">{t("pages.shop.selectOrderToRepeat")}</p>
                    <div className="space-y-3">
                      {userOrders.slice(0, 10).map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setRepeatOrderId(o.id)}
                          className={`w-full p-4 border-2 rounded-xl text-left flex justify-between items-center transition-all duration-300 hover:shadow-md ${
                            repeatOrderId === o.id 
                              ? "border-accent bg-accent/5 shadow-md shadow-accent/20" 
                              : "border-gray-200 hover:border-accent/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                              <RefreshCcw className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-primary">Order #{o.id}</span>
                          </div>
                          <span className="text-sm font-bold text-accent">{o.totalAmount} EGP</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {designChoice.source === "repeat" && userOrders.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t("pages.shop.noPreviousOrders")}</p>
                  </div>
                )}

                {/* Upload Design */}
                {designChoice.source === "upload" && (
                  <div className="animate-in slide-in-from-top duration-500 mt-8">
                    <label className="block font-bold text-primary mb-3 text-lg">{t("pages.shop.uploadDesignFile")}</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-accent transition-colors bg-gray-50/50">
                      <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.ai,.eps"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            // Clean up previous preview URLs
                            uploadPreviewUrls.forEach((url) => {
                              URL.revokeObjectURL(url);
                            });
                            
                            setUploadedFiles(files);
                            
                            // Create preview URLs for images
                            const newPreviewUrls = new Map<string, string>();
                            files.forEach((file) => {
                              if (file.type.startsWith('image/')) {
                                const url = URL.createObjectURL(file);
                                newPreviewUrls.set(file.name, url);
                              }
                            });
                            setUploadPreviewUrls(newPreviewUrls);
                          } else {
                            // Clean up if no files selected
                            uploadPreviewUrls.forEach((url) => {
                              URL.revokeObjectURL(url);
                            });
                            setUploadedFiles([]);
                            setUploadPreviewUrls(new Map());
                          }
                        }}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-accent file:text-white file:font-bold file:cursor-pointer hover:file:bg-accent/90 file:transition-colors"
                      />
                      {uploadedFiles.length > 0 && (
                        <div className="mt-6 space-y-4">
                          <p className="text-sm text-accent font-medium flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> {t("pages.shop.selected")}: {uploadedFiles.length} {uploadedFiles.length === 1 ? "file" : "files"}
                          </p>
                          
                          {/* Preview Section - Grid of files */}
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {uploadedFiles.map((file, index) => {
                              const previewUrl = uploadPreviewUrls.get(file.name);
                              return (
                                <div key={index} className="border-2 border-gray-200 rounded-xl p-4 bg-white">
                                  {previewUrl ? (
                                    // Image Preview
                                    <div className="space-y-3">
                                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                                        <img 
                                          src={previewUrl} 
                                          alt={`Preview ${index + 1}`} 
                                          className="w-full h-full object-contain"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                          <a
                                            href={previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/90 hover:bg-white text-primary p-3 rounded-full shadow-lg transition-all hover:scale-110"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Eye className="w-5 h-5" />
                                          </a>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-600 font-medium truncate">{file.name}</p>
                                      <div className="flex items-center justify-center gap-2">
                                        <a
                                          href={previewUrl}
                                          download={file.name}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-xs font-medium"
                                        >
                                          <Download className="w-3 h-3" />
                                          {t("pages.shop.download")}
                                        </a>
                                        <a
                                          href={previewUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs font-medium"
                                        >
                                          <Eye className="w-3 h-3" />
                                          {t("pages.shop.openInNewTab")}
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    // File Icon for non-image files
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                          <File className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                          <p className="text-xs text-gray-600 font-medium truncate">{file.name}</p>
                                          <p className="text-xs text-gray-400 mt-1">
                                            {file.type || t("pages.shop.file")}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          onClick={() => {
                                            const url = URL.createObjectURL(file);
                                            window.open(url, '_blank');
                                          }}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs font-medium"
                                        >
                                          <Eye className="w-3 h-3" />
                                          {t("pages.shop.openFile")}
                                        </button>
                                        <a
                                          href={URL.createObjectURL(file)}
                                          download={file.name}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-xs font-medium"
                                        >
                                          <Download className="w-3 h-3" />
                                          {t("pages.shop.download")}
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedFromStep1}
                    className="group bg-gradient-to-r from-accent to-accent/90 text-white pl-8 pr-4 py-4 flex items-center gap-3 font-bold text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all hover:-translate-y-0.5"
                  >
                    {t("pages.shop.continue")} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Fabric & Order Type */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-500">
                <div className="text-center mb-6">
                  <h2 className="font-heading text-3xl font-black text-primary mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t("pages.shop.fabricOrderType")}
                  </h2>
                  <p className="text-muted-foreground text-sm">{t("pages.shop.configureDetails")}</p>
                </div>

                {/* A. Fabric Type */}
                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                  <p className="font-bold text-primary mb-3 text-base flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs">A</span>
                    {t("pages.shop.fabricType")}
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(["sublimation", "natural"] as FabricType[]).map((ft) => (
                      <label 
                        key={ft} 
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                          fabricChoice.fabricType === ft 
                            ? "border-accent bg-accent/5 shadow-md shadow-accent/20" 
                            : "border-gray-200 hover:border-accent/50 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="fabricType"
                          checked={fabricChoice.fabricType === ft}
                          onChange={() => {
                            setFabricChoice((prev) => ({ ...prev, fabricType: ft }));
                            setFactoryFabricId(null);
                          }}
                          className="w-4 h-4 text-accent focus:ring-accent"
                        />
                        <div className="flex-1">
                          <span className="font-bold text-primary capitalize block text-sm">
                            {ft === "sublimation" ? t("pages.shop.sublimation") : t("pages.shop.natural")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {ft === "sublimation" ? t("pages.shop.sublimationDesc") : t("pages.shop.naturalDesc")}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={ft === "sublimation" 
                              ? downloadFabric 
                              : beautyOfCulture
                            }
                            alt={ft}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* B. Order Type */}
                <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100">
                  <p className="font-bold text-primary mb-3 text-base flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs">B</span>
                    {t("pages.shop.orderType")}
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(["sample", "order"] as OrderType[]).map((ot) => (
                      <label 
                        key={ot} 
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                          fabricChoice.orderType === ot 
                            ? "border-accent bg-accent/5 shadow-md shadow-accent/20" 
                            : "border-gray-200 hover:border-accent/50 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="orderType"
                          checked={fabricChoice.orderType === ot}
                          onChange={() => setFabricChoice((prev) => ({ ...prev, orderType: ot }))}
                          className="w-4 h-4 text-accent focus:ring-accent"
                        />
                        <div className="flex-1">
                          <span className="font-bold text-primary capitalize block text-sm">
                            {ot === "sample" ? t("pages.shop.sample") : t("pages.shop.order")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {ot === "sample" ? t("pages.shop.sampleDesc") : t("pages.shop.orderDesc")}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={ot === "sample" 
                              ? fabricScrapProject 
                              : downloadFabric
                            }
                            alt={ot}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                  {fabricChoice.orderType === "sample" && fabricChoice.fabricType && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800 font-medium">
                        ℹ️ {t("pages.shop.minimum")}: {fabricChoice.fabricType === "sublimation" ? `1 ${t("pages.shop.meter")}` : `5 ${t("pages.shop.meters")}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* C. Fabric Source */}
                <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100">
                  <p className="font-bold text-primary mb-3 text-base flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs">C</span>
                    {t("pages.shop.fabricSource")}
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    {/* I Provide */}
                    <button
                      type="button"
                      onClick={() => {
                        setFabricChoice((prev) => ({ ...prev, fabricSource: "customer" }));
                        setFactoryFabricId(null);
                        setNotSureInquiry("");
                      }}
                      className={`group p-4 border-2 rounded-xl text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                        fabricChoice.fabricSource === "customer" 
                          ? "border-accent bg-accent/5 shadow-md shadow-accent/20" 
                          : "border-gray-200 hover:border-accent/50 bg-white"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-heading font-bold text-primary mb-1 text-sm">{t("pages.shop.iProvide")}</h4>
                      <p className="text-xs text-muted-foreground">{t("pages.shop.iProvideDesc")}</p>
                    </button>

                    {/* Factory Provides */}
                    <button
                      type="button"
                      onClick={() => {
                        setFabricChoice((prev) => ({ ...prev, fabricSource: "factory" }));
                        setCustomerNotes("");
                        setNotSureInquiry("");
                      }}
                      className={`group p-4 border-2 rounded-xl text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                        fabricChoice.fabricSource === "factory" 
                          ? "border-accent bg-accent/5 shadow-md shadow-accent/20" 
                          : "border-gray-200 hover:border-accent/50 bg-white"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-heading font-bold text-primary mb-1 text-sm">{t("pages.shop.factoryProvides")}</h4>
                      <p className="text-xs text-muted-foreground">{t("pages.shop.factoryProvidesDesc")}</p>
                    </button>

                    {/* Not Sure */}
                    <button
                      type="button"
                      onClick={() => {
                        setFabricChoice((prev) => ({ ...prev, fabricSource: "not_sure" }));
                        setCustomerNotes("");
                        setFactoryFabricId(null);
                      }}
                      className={`group p-4 border-2 rounded-xl text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                        fabricChoice.fabricSource === "not_sure" 
                          ? "border-accent bg-accent/5 shadow-md shadow-accent/20" 
                          : "border-gray-200 hover:border-accent/50 bg-white"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-heading font-bold text-primary mb-1 text-sm">{t("pages.shop.notSure")}</h4>
                      <p className="text-xs text-muted-foreground">{t("pages.shop.notSureDesc")}</p>
                    </button>
                  </div>
                </div>

                {/* Customer Provides - Notes Input */}
                {fabricChoice.fabricSource === "customer" && (
                  <div className="animate-in slide-in-from-top duration-500">
                    <label className="block font-bold text-primary mb-2 text-base">{t("pages.shop.fabricDetailsNotes")}</label>
                    <textarea
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      rows={4}
                      placeholder={t("pages.shop.fabricDetailsPlaceholder")}
                      className="w-full bg-gray-50 border-2 border-gray-200 focus:border-accent py-3 px-4 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 resize-none transition-all"
                    />
                  </div>
                )}

                {/* Factory Provides - Fabric Selection */}
                {fabricChoice.fabricSource === "factory" && (
                  <div className="animate-in slide-in-from-top duration-500">
                    <p className="font-bold text-primary mb-3 text-base">{t("pages.shop.selectFactoryFabric")}</p>
                    <div className="space-y-3">
                      {availableFabrics.map((fabric) => (
                        <button
                          key={fabric.id}
                          type="button"
                          onClick={() => setFactoryFabricId(fabric.id)}
                          className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-300 hover:shadow-lg ${
                            factoryFabricId === fabric.id 
                              ? "border-accent bg-accent/5 shadow-md shadow-accent/20" 
                              : "border-gray-200 hover:border-accent/50"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={fabric.type === "sublimation"
                                  ? downloadFabric
                                  : beautyOfCulture
                                }
                                alt={fabric.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-heading font-bold text-primary mb-1 text-sm">{fabric.name}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{fabric.description}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="px-2 py-1 bg-gray-100 rounded capitalize">{fabric.type}</span>
                                <span>{t("pages.shop.min")}: {fabric.minimumQuantity}m</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-heading text-xl font-black text-accent">{fabric.pricePerMeter}</p>
                              <p className="text-xs text-muted-foreground">{t("pages.shop.egpPerMeter")}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Not Sure - Inquiry Input */}
                {fabricChoice.fabricSource === "not_sure" && (
                  <div className="animate-in slide-in-from-top duration-500">
                    <label className="block font-bold text-primary mb-2 text-base">{t("pages.shop.yourQuestionsDetails")}</label>
                    <textarea
                      value={notSureInquiry}
                      onChange={(e) => setNotSureInquiry(e.target.value)}
                      rows={4}
                      placeholder={t("pages.shop.questionsPlaceholder")}
                      className="w-full bg-gray-50 border-2 border-gray-200 focus:border-accent py-3 px-4 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 resize-none transition-all"
                    />
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-primary font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("pages.shop.back")}
                  </button>
                  <button
                    type="button"
                    onClick={isQuotationRequest ? handleSubmitQuotationRequest : goToNextStep}
                    disabled={!canProceedFromStep2}
                    className="group bg-gradient-to-r from-accent to-accent/90 text-white pl-8 pr-4 py-4 flex items-center gap-3 font-bold text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all hover:-translate-y-0.5"
                  >
                    {fabricChoice.fabricSource === "factory" ? t("pages.shop.continue") : t("pages.shop.submitQuotationRequest")} 
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Quantity (only if Factory Provides) */}
            {step === 3 && shouldShowStep3 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center mb-8">
                  <h2 className="font-heading text-4xl font-black text-primary mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t("pages.shop.quantityTitle")}
                  </h2>
                  <p className="text-muted-foreground text-lg">{t("pages.shop.quantitySubtitle")}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100">
                  <label className="block font-bold text-primary mb-4 text-lg">{t("pages.shop.quantityMeters")}</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min={minimumQuantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(minimumQuantity, parseInt(e.target.value, 10) || minimumQuantity))}
                      className="w-full max-w-[250px] bg-white border-2 border-gray-200 focus:border-accent py-4 px-6 rounded-xl text-lg font-bold focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                    <span className="text-muted-foreground font-medium">{t("pages.shop.meters")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    {t("pages.shop.minimumQuantity")}: {minimumQuantity} {t("pages.shop.meters")}
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-primary mb-3 text-lg">{t("pages.shop.additionalNotes")}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    placeholder={t("pages.shop.notesPlaceholder")}
                    className="w-full bg-gray-50 border-2 border-gray-200 focus:border-accent py-4 px-5 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 resize-none transition-all"
                  />
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="flex items-center gap-2 text-primary font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("pages.shop.back")}
                  </button>
                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!canProceedFromStep3}
                    className="group bg-gradient-to-r from-accent to-accent/90 text-white pl-8 pr-4 py-4 flex items-center gap-3 font-bold text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all hover:-translate-y-0.5"
                  >
                    {t("pages.shop.continue")} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Pricing Summary (only if Factory Provides) */}
            {step === 4 && shouldShowStep4 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center mb-8">
                  <h2 className="font-heading text-4xl font-black text-primary mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t("pages.shop.pricingSummary")}
                  </h2>
                  <p className="text-muted-foreground text-lg">{t("pages.shop.reviewDetails")}</p>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
                  <div className="space-y-5">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-muted-foreground font-medium">{t("pages.shop.designSource")}</span>
                      <span className="font-bold text-primary capitalize px-4 py-2 bg-blue-50 rounded-lg">{designChoice.source}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-muted-foreground font-medium">{t("pages.shop.fabricTypeLabel")}</span>
                      <span className="font-bold text-primary capitalize px-4 py-2 bg-purple-50 rounded-lg">{fabricChoice.fabricType}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-muted-foreground font-medium">{t("pages.shop.orderTypeLabel")}</span>
                      <span className="font-bold text-primary capitalize px-4 py-2 bg-green-50 rounded-lg">{fabricChoice.orderType}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-muted-foreground font-medium">{t("pages.shop.quantityLabel")}</span>
                      <span className="font-bold text-primary px-4 py-2 bg-orange-50 rounded-lg">{quantity} {t("pages.shop.meters")}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-muted-foreground font-medium">{t("pages.shop.pricePerMeter")}</span>
                      <span className="font-bold text-primary px-4 py-2 bg-amber-50 rounded-lg">{unitPrice} EGP</span>
                    </div>
                    {notes && (
                      <div className="pt-2 pb-4 border-b border-gray-200">
                        <span className="text-muted-foreground font-medium block mb-2">{t("pages.shop.additionalNotesLabel")}</span>
                        <span className="text-sm text-primary bg-gray-50 p-3 rounded-lg block">{notes}</span>
                      </div>
                    )}
                    <div className="pt-6">
                      <div className="flex justify-between items-center bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-xl">
                        <span className="font-heading text-2xl font-black text-primary">{t("pages.shop.totalAmount")}</span>
                        <span className="font-heading text-4xl font-black text-accent">{totalPrice} EGP</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="flex items-center gap-2 text-primary font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("pages.shop.back")}
                  </button>
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="group bg-gradient-to-r from-accent to-accent/90 text-white pl-8 pr-4 py-4 flex items-center gap-3 font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all hover:-translate-y-0.5"
                  >
                    {t("pages.shop.proceedToPayment")} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Payment Method */}
            {step === 5 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center mb-8">
                  <h2 className="font-heading text-4xl font-black text-primary mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t("pages.shop.paymentMethod")}
                  </h2>
                  <p className="text-muted-foreground text-lg">{t("pages.shop.choosePayment")}</p>
                </div>

                <div>
                  <p className="font-bold text-primary mb-4 text-lg">{t("pages.shop.selectPaymentMethod")}</p>
                  <div className="space-y-4">
                    <label className={`flex items-center gap-4 cursor-pointer p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
                      paymentMethod === "instapay" 
                        ? "border-accent bg-accent/5 shadow-md shadow-accent/20" 
                        : "border-gray-200 hover:border-accent/50"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "instapay"}
                        onChange={() => setPaymentMethod("instapay")}
                        className="w-5 h-5 text-accent focus:ring-accent"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-primary block mb-1">{t("pages.shop.instapay")}</span>
                        <span className="text-sm text-muted-foreground">{t("pages.shop.instapayDesc")}</span>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">💳</span>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 cursor-pointer p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
                      paymentMethod === "COD" 
                        ? "border-accent bg-accent/5 shadow-md shadow-accent/20" 
                        : "border-gray-200 hover:border-accent/50"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="w-5 h-5 text-accent focus:ring-accent"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-primary block mb-1">{t("pages.shop.cashOnDelivery")}</span>
                        <span className="text-sm text-muted-foreground">{t("pages.shop.cashOnDeliveryDesc")}</span>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">💵</span>
                      </div>
                    </label>
                  </div>
                </div>

                {paymentMethod === "instapay" && (
                  <div className="animate-in slide-in-from-top duration-500">
                    <label className="block font-bold text-primary mb-3 text-lg">{t("pages.shop.paymentProof")}</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-accent transition-colors bg-gray-50/50">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setPaymentProofFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-accent file:text-white file:font-bold file:cursor-pointer hover:file:bg-accent/90 file:transition-colors"
                      />
                      {paymentProofFile && (
                        <p className="text-sm text-accent font-medium mt-3 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> {paymentProofFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm font-medium">{submitError}</p>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="flex items-center gap-2 text-primary font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("pages.shop.back")}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitOrder}
                    className="group bg-gradient-to-r from-green-500 to-green-600 text-white pl-10 pr-5 py-5 flex items-center gap-3 font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {t("pages.shop.submitOrder")} 
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
};

export default Shop;
