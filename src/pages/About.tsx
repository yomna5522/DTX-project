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
      {/* About page: company history, achievements, years */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-2">{t("pages.about.ourStory")}</p>
            <h2 className="font-heading text-3xl md:text-4xl font-black text-primary">{t("pages.about.historyAchievements")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <p className="font-heading text-4xl font-black text-accent">10+</p>
              <p className="text-primary font-bold mt-1">{t("pages.about.yearsInOperation")}</p>
              <p className="text-muted-foreground text-sm mt-2">{t("pages.about.yearsDesc")}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <p className="font-heading text-4xl font-black text-accent">1000+</p>
              <p className="text-primary font-bold mt-1">{t("pages.about.projectsCompleted")}</p>
              <p className="text-muted-foreground text-sm mt-2">{t("pages.about.projectsDesc")}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <p className="font-heading text-4xl font-black text-accent">100%</p>
              <p className="text-primary font-bold mt-1">{t("pages.about.customerFocus")}</p>
              <p className="text-muted-foreground text-sm mt-2">{t("pages.about.customerFocusDesc")}</p>
            </div>
          </div>
          <p className="text-muted-foreground text-center mt-10 max-w-2xl mx-auto text-sm leading-relaxed">
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
