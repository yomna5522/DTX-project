import { Paintbrush, Shirt, Printer, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ServicesSection = () => {
  const { t } = useTranslation();
  const services = [
    { icon: Paintbrush, labelKey: "designLabel", titleKey: "designTitle", descKey: "designDesc" },
    { icon: Shirt, labelKey: "fabricLabel", titleKey: "fabricTitle", descKey: "fabricDesc" },
    { icon: Printer, labelKey: "printLabel", titleKey: "printTitle", descKey: "printDesc" },
  ];

  return (
    <section id="services" className="py-16 bg-[#F8F9FA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-2">{t("services.whatWeOffer")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-black text-primary">{t("services.ourServices")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {services.map((service, i) => (
            <div
              key={i}
              className="flex items-start gap-6 group translate-y-0 transition-transform hover:-translate-y-1"
            >
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                <service.icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-accent text-[11px] font-bold uppercase tracking-[0.2em] mb-2">
                  {t(`services.${service.labelKey}`)}
                </p>
                <h3 className="font-heading text-2xl font-black text-primary mb-3">
                  {t(`services.${service.titleKey}`)}
                </h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">
                  {t(`services.${service.descKey}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12 flex flex-wrap items-center justify-center gap-6">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 bg-accent text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-sm shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:scale-105 active:scale-100 transition-all duration-200"
          >
            {t("services.startOrder")}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
          </Link>
          <Link
            to="/services"
            className="inline-block font-bold text-accent text-sm uppercase tracking-widest hover:underline"
          >
            {t("services.viewAllServices")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
