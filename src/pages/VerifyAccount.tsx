import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authApi } from "@/api/auth";

const VerifyAccount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { phone?: string } | undefined;
  const [phone, setPhoneState] = useState(state?.phone ?? "");
  const [phoneInput, setPhoneInput] = useState("");
  const [step, setStep] = useState<"phone" | "otp">(state?.phone ? "otp" : "phone");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (state?.phone) {
      setPhoneState(state.phone);
      setStep("otp");
    }
  }, [state?.phone]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone || !otp.trim()) {
      setError(t("pages.verifyAccount.enterOtp"));
      return;
    }
    setSubmitting(true);
    try {
      const result = await authApi.verifyOtp(phone, otp.trim(), false);
      if (result.success) {
        navigate("/login", { state: { message: t("pages.verifyAccount.verifiedSignIn") }, replace: true });
      } else {
        setError(result.error ?? t("pages.verifyAccount.verifyFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const p = phoneInput.trim();
    if (!p) {
      setError(t("pages.verifyAccount.phoneRequired"));
      return;
    }
    // Don't send a new OTP here — one was already sent at register. Just go to OTP step so they can enter it.
    // They can use "Resend" if the code expired.
    setPhoneState(p);
    setStep("otp");
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    const result = await authApi.resendOtp(phone, false);
    if (result.success) {
      setResendCooldown(120);
    } else {
      if (result.error?.includes("retry") || result.error?.includes("already sent")) {
        setResendCooldown(120);
      }
      setError(result.error ?? t("pages.verifyAccount.resendFailed"));
    }
  };

  const maskedPhone = phone.length > 4 ? `***${phone.slice(-4)}` : "***";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Navbar />

      <main className="flex-grow bg-primary relative flex items-center justify-center px-4 overflow-hidden py-24">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid-verify" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid-verify)" />
          </svg>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl font-black text-white tracking-tight">
              {t("pages.verifyAccount.title")}
            </h1>
            <p className="text-white/60 text-sm mt-2 font-medium">
              {step === "otp" ? `${t("pages.verifyAccount.subtitle")} ${maskedPhone}` : t("pages.verifyAccount.enterPhoneSubtitle")}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            {step === "phone" ? (
              <form onSubmit={handleSendCode} className="space-y-5">
                {error && (
                  <p className="text-destructive text-sm font-medium bg-destructive/10 py-2 px-3 rounded-lg">{error}</p>
                )}
                <div className="space-y-2">
                  <label className="text-primary font-bold text-xs uppercase tracking-widest ml-1 rtl:mr-1 rtl:ml-0">
                    {t("pages.verifyAccount.phoneLabel")}
                  </label>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full bg-[#F5F7F9] border-none py-4 px-6 rounded-lg text-sm focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent text-white py-4 rounded-lg font-black text-xs tracking-[0.2em] uppercase hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3"
                >
                  <ShieldCheck className="h-4 w-4" /> {t("pages.verifyAccount.continueToOtp")}
                </button>
                <div className="pt-4 text-center">
                  <Link to="/login" className="text-accent font-bold hover:underline text-sm">
                    ← {t("pages.verifyAccount.backToLogin")}
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <p className="text-destructive text-sm font-medium bg-destructive/10 py-2 px-3 rounded-lg">
                    {error}
                  </p>
                )}
                <div className="space-y-2">
                  <label className="text-primary font-bold text-xs uppercase tracking-widest ml-1 rtl:mr-1 rtl:ml-0">
                    {t("pages.verifyAccount.otpLabel")}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-[#F5F7F9] border-none py-4 px-6 rounded-lg text-sm focus:ring-1 focus:ring-accent transition-all text-center tracking-[0.4em] font-mono text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || otp.length < 6}
                  className="w-full bg-accent text-white py-4 rounded-lg font-black text-xs tracking-[0.2em] uppercase hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  <ShieldCheck className="h-4 w-4" />{" "}
                  {submitting ? t("common.loading") : t("pages.verifyAccount.verify")}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="text-sm text-white/80 hover:text-white font-medium disabled:opacity-50"
                  >
                    {resendCooldown > 0
                      ? t("pages.verifyAccount.resendIn", { seconds: resendCooldown })
                      : t("pages.verifyAccount.resend")}
                  </button>
                </div>
                <div className="pt-4 text-center">
                  <Link to="/login" className="text-accent font-bold hover:underline text-sm">
                    ← {t("pages.verifyAccount.backToLogin")}
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyAccount;
