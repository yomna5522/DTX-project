import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroPrinting from "@/assets/hero-printing.jpg";
import heroFabrics from "@/assets/hero-fabrics.jpg";

const slides = [
  {
    image: heroPrinting,
    subtitle: "Welcome to DTX",
    title: "VIBRANT",
    description: "Experience the Brilliance of Digital Printing on Textiles both on Natural & Synthetic fabrics. Achieve vibrant colors bringing your designs to life.",
  },
  {
    image: heroFabrics,
    subtitle: "Welcome to DTX",
    title: "BEST FABRICS",
    description: "We offer a wide selection of high-quality synthetic and natural fabrics to suit your specific needs. Discover the ideal material for your next printing masterpiece.",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[700px] md:min-h-[850px] flex items-center bg-primary overflow-hidden">
      {/* Background Pattern - Diagonal Lines */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonal-stripe" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-stripe)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div key={current} className="max-w-xl transition-all duration-700 ease-in-out transform animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-0.5 bg-secondary rounded-full"></span>
              <p className="text-white font-bold tracking-[0.3em] text-[10px] uppercase">
                {slides[current].subtitle}
              </p>
            </div>
            <h1 className="font-heading text-7xl md:text-[110px] font-black text-white leading-[0.9] mb-8 tracking-tighter uppercase">
              {slides[current].title}
            </h1>
            <p className="text-white/80 font-body text-base md:text-lg leading-relaxed mb-12 max-w-lg font-medium">
              We transform your ideas into reality with precision and care. Explore the endless possibilities of sublimation printing.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link to="/shop" className="group flex items-center bg-accent text-white font-black text-[10px] tracking-[0.2em] transition-all hover:bg-accent/90 shadow-xl shadow-accent/20 overflow-hidden">
                <span className="px-8 py-4">SHOP NOW</span>
                <div className="bg-white/10 px-4 py-4 transition-colors group-hover:bg-white/20">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
              <Link to="/contact" className="group flex items-center bg-secondary text-primary font-black text-[10px] tracking-[0.2em] transition-all hover:bg-secondary/90 shadow-xl shadow-secondary/20 overflow-hidden">
                <span className="px-8 py-4 uppercase">Contact Us</span>
                <div className="bg-white/20 px-4 py-4 transition-colors group-hover:bg-white/30">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block h-[550px] w-full">
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl metallic-shine transform hover:scale-[1.02] transition-transform duration-700">
                  <img 
                    src={slides[current].image} 
                    alt={slides[current].title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent"></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {slides.map((_, index) => (
          <button 
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === current ? "w-4 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
