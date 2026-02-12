import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { Paintbrush, Shirt, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroPrinting from "@/assets/hero-printing.jpg";

const Services = () => {
  const { t } = useTranslation();
  const services = [
    { icon: Paintbrush, labelKey: "designLabel", titleKey: "designTitle", descKey: "designDesc" },
    { icon: Shirt, labelKey: "fabricLabel", titleKey: "fabricTitle", descKey: "fabricDesc" },
    { icon: Printer, labelKey: "printLabel", titleKey: "printTitle", descKey: "printDesc" },
  ].map((s) => ({ ...s, label: t(`services.${s.labelKey}`), title: t(`services.${s.titleKey}`), description: t(`services.${s.descKey}`) }));

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      <section className="bg-primary relative min-h-[300px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 py-16">
          <h1 className="font-heading text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">
            {t("pages.services.title")}
          </h1>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent z-10" />
          <img
            src={heroPrinting}
            alt="Textile printing"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="py-16 bg-[#F8F9FA]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-4">
              {t("pages.services.whatWeOffer")}
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary">
              {t("pages.services.detailedServices")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {services.map((service, i) => (
              <div
                key={i}
                className="flex flex-col items-start gap-6 bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-accent text-[11px] font-bold uppercase tracking-[0.2em]">
                  {service.label}
                </p>
                <h3 className="font-heading text-2xl font-black text-primary">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-accent text-white font-bold text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-accent/90 transition-colors"
            >
              {t("pages.services.startOrder")}
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
};

export default Services;
