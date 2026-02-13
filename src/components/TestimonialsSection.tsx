import { useState, useEffect, useMemo } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import aboutImage from "@/assets/about-printing.jpg";

interface Testimonial {
  text: string;
  name: string;
  company: string;
  initials: string;
}

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  const testimonials: Testimonial[] = useMemo(() => [
    {
      text: t("testimonials.testimonial1.text"),
      name: t("testimonials.testimonial1.name"),
      company: t("testimonials.testimonial1.company"),
      initials: "YA"
    },
    {
      text: t("testimonials.testimonial2.text"),
      name: t("testimonials.testimonial2.name"),
      company: t("testimonials.testimonial2.company"),
      initials: "MA"
    },
    {
      text: t("testimonials.testimonial3.text"),
      name: t("testimonials.testimonial3.name"),
      company: t("testimonials.testimonial3.company"),
      initials: "SH"
    },
    {
      text: t("testimonials.testimonial4.text"),
      name: t("testimonials.testimonial4.name"),
      company: t("testimonials.testimonial4.company"),
      initials: "AM"
    }
  ], [t]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="bg-white overflow-hidden py-0 border-y border-border/50">
      <div className="flex flex-col lg:flex-row">
        {/* Left Side: Content */}
        <div className="w-full lg:w-1/2 py-24 px-8 md:px-24 flex flex-col justify-center relative bg-white">
          <div className="absolute top-1/2 left-24 -translate-y-1/2 select-none pointer-events-none opacity-80">
            <span className="text-[120px] md:text-[220px] font-heading font-black text-gray-50 uppercase tracking-tighter scale-y-125">
              Say
            </span>
          </div>
          
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-0.5 bg-accent rounded-full"></span>
              <p className="text-accent text-[10px] font-bold uppercase tracking-[0.3em]">
                {t("testimonials.label")}
              </p>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary mb-12 tracking-tight">
              {t("testimonials.heading")}
            </h2>
            
            <div className="relative">
              <div 
                key={current}
                className="bg-white p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative group transition-opacity duration-500"
              >
                <div className="absolute -top-6 -left-0 w-12 h-12 bg-accent flex items-center justify-center text-white shadow-lg">
                  <Quote className="h-6 w-6" />
                </div>
                <p className="text-gray-500 text-lg leading-relaxed mb-10 font-medium italic">
                  "{testimonials[current].text}"
                </p>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                    <span className="text-accent font-black text-lg">{testimonials[current].initials}</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-lg text-primary tracking-tight">{testimonials[current].name}</h4>
                    <p className="text-[10px] text-accent font-black uppercase tracking-widest">{testimonials[current].company}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={goToPrevious}
                  className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-accent hover:bg-accent/5 transition-all"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrent(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === current 
                          ? "w-8 bg-accent" 
                          : "w-1.5 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={goToNext}
                  className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-accent hover:bg-accent/5 transition-all"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="w-full lg:w-1/2 min-h-[600px] relative overflow-hidden group">
          <img 
            src={aboutImage} 
            alt="Client happy testimonial fabric" 
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-primary/10"></div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
