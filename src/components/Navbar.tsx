import { useState } from "react";
import { Menu, X, Settings, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

const navLinks = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "shop", href: "/shop" },
  { key: "portfolio", href: "/portfolio" },
  { key: "patternStudio", href: "/pattern-studio" },
  { key: "contact", href: "/contact" },
];

const Navbar = () => {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-background shadow-sm sticky top-0 z-50 py-1">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={Logo} alt="DTX Logo" className="h-16 w-auto object-contain" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6 border-r border-border pr-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.key}
                  to={link.href}
                  className={`font-body text-[15px] font-bold transition-all relative py-2 ${
                    isActive ? "text-accent" : "text-foreground hover:text-accent"
                  }`}
                >
                  {t(`nav.${link.key}`)}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent animate-in fade-in slide-in-from-left-2 duration-300"></span>
                  )}
                </Link>
              );
            })}
            {user ? (
              <>
                <Link
                  to="/orders"
                  className={`font-body text-[15px] font-bold transition-all relative py-2 ${
                    location.pathname === "/orders" || location.pathname.startsWith("/orders/") ? "text-accent" : "text-foreground hover:text-accent"
                  }`}
                >
                  {t("nav.orders")}
                  {(location.pathname === "/orders" || location.pathname.startsWith("/orders/")) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent animate-in fade-in slide-in-from-left-2 duration-300"></span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`font-body text-[15px] font-bold transition-all relative py-2 ${
                    location.pathname === "/login" ? "text-accent" : "text-foreground hover:text-accent"
                  }`}
                >
                  {t("nav.login")}
                  {location.pathname === "/login" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent animate-in fade-in slide-in-from-left-2 duration-300"></span>
                  )}
                </Link>
                <Link
                  to="/register"
                  className={`font-body text-[15px] font-bold transition-all relative py-2 ${
                    location.pathname === "/register" ? "text-accent" : "text-foreground hover:text-accent"
                  }`}
                >
                  {t("nav.register")}
                  {location.pathname === "/register" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent animate-in fade-in slide-in-from-left-2 duration-300"></span>
                  )}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <Link
                  to="/settings"
                  className={`transition-all relative p-2 ${
                    location.pathname === "/settings" ? "text-accent" : "text-foreground hover:text-accent"
                  }`}
                  title={t("nav.settings")}
                >
                  <Settings className="h-5 w-5" />
                  {location.pathname === "/settings" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent animate-in fade-in slide-in-from-left-2 duration-300"></span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="transition-all relative p-2 text-foreground hover:text-accent"
                  title={t("nav.logout")}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-4 pb-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.key}
                to={link.href}
                className={`block py-3 text-sm font-bold transition-colors border-l-4 pl-3 mt-1 ${
                  isActive ? "text-accent border-accent bg-accent/5" : "text-foreground border-transparent hover:text-accent"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {t(`nav.${link.key}`)}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-border mt-2">
            <LanguageSwitcher className="py-2" />
          </div>
          {user ? (
            <>
              <Link
                to="/orders"
                className={`block py-3 text-sm font-bold transition-colors border-l-4 pl-3 mt-1 ${
                  location.pathname === "/orders" || location.pathname.startsWith("/orders/") ? "text-accent border-accent bg-accent/5" : "text-foreground border-transparent hover:text-accent"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {t("nav.orders")}
              </Link>
              <Link
                to="/settings"
                className={cn(
                  "flex items-center gap-2 py-3 text-sm font-bold transition-colors border-l-4 pl-3 mt-1",
                  location.pathname === "/settings" ? "text-accent border-accent bg-accent/5" : "text-foreground border-transparent hover:text-accent"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Settings className="h-4 w-4" />
                {t("nav.settings")}
              </Link>
              <button
                type="button"
                className="block py-3 text-sm font-bold text-foreground border-transparent border-l-4 pl-3 mt-1 hover:text-accent w-full text-left"
                onClick={handleLogout}
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`block py-3 text-sm font-bold transition-colors border-l-4 pl-3 mt-1 ${
                  location.pathname === "/login" ? "text-accent border-accent bg-accent/5" : "text-foreground border-transparent hover:text-accent"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {t("nav.login")}
              </Link>
              <Link
                to="/register"
                className={`block py-3 text-sm font-bold transition-colors border-l-4 pl-3 mt-1 ${
                  location.pathname === "/register" ? "text-accent border-accent bg-accent/5" : "text-foreground border-transparent hover:text-accent"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
