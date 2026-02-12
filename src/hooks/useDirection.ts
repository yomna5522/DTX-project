import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const RTL_LOCALES = ["ar"];

export function useDirection() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language;
    const isRtl = RTL_LOCALES.some((locale) => lang.startsWith(locale));
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang.startsWith("ar") ? "ar" : "en";
  }, [i18n.language]);
}

