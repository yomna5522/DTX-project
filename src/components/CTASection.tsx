import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroFabrics from "@/assets/hero-fabrics.jpg";

const CTASection = () => {
  const { t } = useTranslation();
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroFabrics} 
          alt="Fabric rolls background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/90"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <h2 className="font-heading text-5xl md:text-7xl font-black text-white mb-10 leading-[1.1] tracking-tighter">
            {t("cta.heading")}
          </h2>
          <div className="w-24 h-1.5 bg-secondary mb-10"></div>
          <p className="text-white/70 max-w-2xl mb-12 text-lg md:text-xl leading-relaxed font-medium">
            {t("cta.body")}
          </p>
          <Link to="/contact" className="group flex items-center bg-secondary text-primary font-black text-[11px] tracking-[0.2em] transition-all hover:bg-secondary/90 w-fit">
            <span className="px-10 py-5">{t("cta.contactUs")}</span>
            <div className="bg-white/20 px-5 py-5 transition-colors group-hover:bg-white/30">
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
