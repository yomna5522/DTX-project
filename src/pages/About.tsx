import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen">
      <TopBar />
      <Navbar />
      <HeroSection />
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
