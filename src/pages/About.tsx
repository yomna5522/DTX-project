import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      <TopBar />
      <Navbar />
      <HeroSection />
      {/* About page: company history, achievements, years - Enhanced */}
      <section className="relative py-20 bg-white z-10 px-4">
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
                About
              </span>
            </div>
            <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-4 relative z-10">
              {t("pages.about.ourStory")}
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary relative z-10">
              {t("pages.about.historyAchievements")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-20">
            <div className="text-center p-10 bg-white rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <p className="font-heading text-5xl md:text-6xl font-black text-primary mb-3 group-hover:scale-110 transition-transform duration-500">10+</p>
              <p className="text-primary font-bold text-lg mt-2">{t("pages.about.yearsInOperation")}</p>
              <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{t("pages.about.yearsDesc")}</p>
            </div>
            <div className="text-center p-10 bg-white rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <p className="font-heading text-5xl md:text-6xl font-black text-primary mb-3 group-hover:scale-110 transition-transform duration-500">1000+</p>
              <p className="text-primary font-bold text-lg mt-2">{t("pages.about.projectsCompleted")}</p>
              <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{t("pages.about.projectsDesc")}</p>
            </div>
            <div className="text-center p-10 bg-white rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <p className="font-heading text-5xl md:text-6xl font-black text-primary mb-3 group-hover:scale-110 transition-transform duration-500">100%</p>
              <p className="text-primary font-bold text-lg mt-2">{t("pages.about.customerFocus")}</p>
              <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{t("pages.about.customerFocusDesc")}</p>
            </div>
          </div>
          
          <p className="text-muted-foreground text-center mt-12 max-w-3xl mx-auto text-base leading-relaxed relative z-20">
            {t("pages.about.historyParagraph")}
          </p>
        </div>
      </section>
      <FeaturesGrid />
      <AboutSection />
      <CTASection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default About;
