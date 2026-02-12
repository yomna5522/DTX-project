/* Diagnostic refresh 2 */
import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/assets/Logo.png";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Shop", href: "/shop" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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
                  key={link.label}
                  to={link.href}
                  className={`font-body text-[15px] font-bold transition-all relative py-2 ${
                    isActive ? "text-accent" : "text-foreground hover:text-accent"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent animate-in fade-in slide-in-from-left-2 duration-300"></span>
                  )}
                </Link>
              );
            })}
            <Link
              to="/login"
              className={`font-body text-[15px] font-bold transition-all relative py-2 ${
                location.pathname === "/login" ? "text-accent" : "text-foreground hover:text-accent"
              }`}
            >
              Login
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
              Register
              {location.pathname === "/register" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent animate-in fade-in slide-in-from-left-2 duration-300"></span>
              )}
            </Link>
          </div>
          
          <button className="text-accent p-1">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
            </div>
          </button>
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
                key={link.label}
                to={link.href}
                className={`block py-3 text-sm font-bold transition-colors border-l-4 pl-3 mt-1 ${
                  isActive ? "text-accent border-accent bg-accent/5" : "text-foreground border-transparent hover:text-accent"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/login"
            className={`block py-3 text-sm font-bold transition-colors border-l-4 pl-3 mt-1 ${
              location.pathname === "/login" ? "text-accent border-accent bg-accent/5" : "text-foreground border-transparent hover:text-accent"
            }`}
            onClick={() => setMobileOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`block py-3 text-sm font-bold transition-colors border-l-4 pl-3 mt-1 ${
              location.pathname === "/register" ? "text-accent border-accent bg-accent/5" : "text-foreground border-transparent hover:text-accent"
            }`}
            onClick={() => setMobileOpen(false)}
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
