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
    <section id="services" className="relative py-20 bg-white z-10 px-4">
      {/* Background Decorative Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <svg className="absolute top-0 right-0 w-[500px] h-[500px]" viewBox="0 0 500 500" fill="none">
          <path d="M480 20C400 150 550 300 350 450" stroke="#004A99" strokeWidth="2" fill="none" className="opacity-50" />
          <path d="M500 100C420 230 570 380 370 530" stroke="#004A99" strokeWidth="1" fill="none" className="opacity-30" />
        </svg>
      </div>

      <div className="container mx-auto relative cursor-default">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
            <span className="text-[120px] md:text-[200px] font-heading font-black text-gray-100 uppercase tracking-tighter opacity-80 scale-x-110">
              Services
            </span>
          </div>
          <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-4 relative z-10">
            {t("services.whatWeOffer")}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-primary relative z-10">
            {t("services.ourServices")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative z-20">
          {services.map((service, i) => (
            <div
              key={i}
              className="flex flex-col items-start gap-6 bg-white p-10 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
            >
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                <service.icon className="h-8 w-8 text-white" />
              </div>
              <p className="text-accent text-[11px] font-bold uppercase tracking-[0.2em]">
                {t(`services.${service.labelKey}`)}
              </p>
              <h3 className="font-heading text-2xl font-black text-primary">
                {t(`services.${service.titleKey}`)}
              </h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                {t(`services.${service.descKey}`)}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 flex flex-wrap items-center justify-center gap-6 relative z-20">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 bg-accent text-white font-black text-sm uppercase tracking-widest px-10 py-5 rounded-sm shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:scale-105 active:scale-100 transition-all duration-200"
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
