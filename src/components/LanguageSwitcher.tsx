import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n: i18nHook } = useTranslation();
  const isAr = i18nHook.language.startsWith("ar");

  const toggle = () => {
    const next = isAr ? "en" : "ar";
    localStorage.setItem("dtx_lang", next);
    i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-foreground hover:text-accent transition-colors",
        className
      )}
      title={isAr ? "English" : "العربية"}
      aria-label={isAr ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Languages className="h-4 w-4" />
      <span>{isAr ? "EN" : "ع"}</span>
    </button>
  );
}
