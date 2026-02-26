import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/api/auth";
import heroPrinting from "@/assets/hero-printing.jpg";
import { AlertCircle } from "lucide-react";

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setProfileLoading(true);
    setProfileError("");
    authApi.getProfile().then((profile) => {
      if (cancelled || !profile) return;
      setName(profile.fullname ?? "");
      setEmail(profile.email);
      setPhone(profile.phone ?? "");
      setShippingAddress(profile.address ?? "");
    }).catch(() => {
      if (!cancelled) setProfileError("Failed to load profile.");
    }).finally(() => {
      if (!cancelled) setProfileLoading(false);
    });
    return () => { cancelled = true; };
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileError("");
    const result = await authApi.updateProfile({ fullname: name, address: shippingAddress });
    if (result.success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } else {
      setProfileError(result.error ?? "Failed to save profile.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (!user) return;
    setPasswordSubmitting(true);
    try {
      const result = await authApi.changePassword(currentPassword, newPassword, confirmPassword);
      if (result.success) {
        setPasswordSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSaved(false), 3000);
      } else {
        setPasswordError(result.error ?? "Failed to change password.");
      }
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      <section className="bg-primary relative min-h-[280px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 py-12">
          <h1 className="font-heading text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">
            {t("pages.settings.title")}
          </h1>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent z-10" />
          <img src={heroPrinting} alt="Settings" className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="py-16 md:px-4 relative">
        {/* Background decorative container */}
        <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto w-full relative z-10">
          {/* First Container - Notice */}
          <div className="mb-8">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                {t("pages.settings.notice")}
              </p>
            </div>
          </div>

          {/* Second Container - Forms */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact & Shipping Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6 p-6 bg-white border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="font-heading text-xl font-black text-primary">{t("pages.settings.contactShipping")}</h2>
            <div>
              <label className="block font-bold text-primary text-sm mb-1">{t("pages.settings.fullName")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F5F7F9] border-none py-3 px-4 rounded-lg text-sm focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block font-bold text-primary text-sm mb-1">{t("pages.contact.email")}</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full bg-[#F5F7F9] border-none py-3 px-4 rounded-lg text-sm text-muted-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-primary text-sm mb-1">{t("pages.settings.phone")}</label>
              <input
                type="tel"
                value={phone}
                readOnly
                className="w-full bg-[#F5F7F9] border-none py-3 px-4 rounded-lg text-sm text-muted-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-primary text-sm mb-1">{t("pages.settings.shippingAddress")}</label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                placeholder={t("pages.settings.shippingPlaceholder")}
                className="w-full bg-[#F5F7F9] border-none py-3 px-4 rounded-lg text-sm focus:ring-1 focus:ring-accent resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="bg-accent text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-accent/90 disabled:opacity-70"
            >
              {profileLoading ? t("common.loading") : t("pages.settings.saveProfile")}
            </button>
            {profileError && <p className="text-sm text-destructive font-medium">{profileError}</p>}
            {profileSaved && <p className="text-sm text-green-600 font-medium">{t("pages.settings.profileSaved")}</p>}
            </form>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="space-y-6 p-6 bg-white border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="font-heading text-xl font-black text-primary">{t("pages.settings.changePassword")}</h2>
            <div>
              <label className="block font-bold text-primary text-sm mb-1">{t("pages.settings.currentPassword")}</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#F5F7F9] border-none py-3 px-4 rounded-lg text-sm focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block font-bold text-primary text-sm mb-1">{t("pages.settings.newPassword")}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#F5F7F9] border-none py-3 px-4 rounded-lg text-sm focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block font-bold text-primary text-sm mb-1">{t("pages.settings.confirmNewPassword")}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#F5F7F9] border-none py-3 px-4 rounded-lg text-sm focus:ring-1 focus:ring-accent"
              />
            </div>
            {passwordError && <p className="text-sm text-destructive font-medium">{passwordError}</p>}
            {passwordSaved && <p className="text-sm text-green-600 font-medium">{t("pages.settings.passwordUpdated")}</p>}
            <button
              type="submit"
              disabled={passwordSubmitting}
              className="bg-accent text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-accent/90 disabled:opacity-70"
            >
              {passwordSubmitting ? t("common.loading") : t("pages.settings.updatePassword")}
            </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Settings;
