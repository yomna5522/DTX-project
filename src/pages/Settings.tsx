import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { profileApi } from "@/api/profile";
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!user) return;
    const profile = profileApi.getOrCreateProfile(user.id, { name: user.name, email: user.email });
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setShippingAddress(profile.shippingAddress);
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    profileApi.updateProfile(user.id, { name, email, phone, shippingAddress });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (!user) return;
    const result = authApi.changePassword(user.id, currentPassword, newPassword);
    if (result.success) {
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    } else {
      setPasswordError(result.error ?? "Failed to change password.");
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

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl space-y-12">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              {t("pages.settings.notice")}
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 p-6 border-2 border-border rounded-lg">
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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F5F7F9] border-none py-3 px-4 rounded-lg text-sm focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block font-bold text-primary text-sm mb-1">{t("pages.settings.phone")}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                className="w-full bg-[#F5F7F9] border-none py-3 px-4 rounded-lg text-sm focus:ring-1 focus:ring-accent"
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
              className="bg-accent text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-accent/90"
            >
              {t("pages.settings.saveProfile")}
            </button>
            {profileSaved && <p className="text-sm text-green-600 font-medium">{t("pages.settings.profileSaved")}</p>}
          </form>

          <form onSubmit={handleChangePassword} className="space-y-6 p-6 border-2 border-border rounded-lg">
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
              className="bg-accent text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-accent/90"
            >
              {t("pages.settings.updatePassword")}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Settings;
