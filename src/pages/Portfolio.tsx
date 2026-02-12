/* Diagnostic refresh */
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import heroPrinting from "@/assets/hero-printing.jpg";
import heroFabrics from "@/assets/hero-fabrics.jpg";
import aboutPrinting from "@/assets/about-printing.jpg";

const portfolioItems = [
  { id: 1, image: heroFabrics },
  { id: 2, image: aboutPrinting },
  { id: 3, image: "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&h=800&fit=crop" }, // Textile workshop
  { id: 4, image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=800&fit=crop" }, // Digital printer
  { id: 5, image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&h=800&fit=crop" }, // Colorful pattern
  { id: 6, image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&h=800&fit=crop" }, // Fabric rolls
  { id: 7, image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800&h=800&fit=crop" }, // Pattern design
  { id: 8, image: heroPrinting },
];

const Portfolio = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % portfolioItems.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + portfolioItems.length) % portfolioItems.length);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <TopBar />
      <Navbar />

      {/* Page Hero */}
      <section className="bg-primary relative min-h-[300px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 py-16">
          <h1 className="font-heading text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">
            PORTFOLIO
          </h1>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent z-10"></div>
          <img 
            src={heroPrinting} 
            alt="Textile machine" 
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Gallery Header Section */}
      <section className="relative pt-16 pb-24 z-10 px-4">
        {/* Background Decorative Lines (Match Shop) */}
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
                Portfolio
              </span>
            </div>
            <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-4 relative z-10">
              2- Our Works
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary relative z-10">
              Showcasing Our Excellence
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-20">
            {portfolioItems.map((item, index) => (
              <div 
                key={item.id} 
                onClick={() => openLightbox(index)}
                className="aspect-square relative group overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 rounded-sm"
              >
                <img 
                  src={item.image} 
                  alt={`Portfolio item ${item.id}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 border-2 border-white rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
                    <ChevronRight className="text-white h-7 w-7" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            onClick={closeLightbox}
          >
            <X className="h-10 w-10" />
          </button>
          
          <button 
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"
            onClick={prevImage}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <img 
            src={portfolioItems[selectedIndex].image} 
            className="max-w-full max-h-[85vh] object-contain shadow-2xl animate-fade-in"
            alt="Enlarged view"
          />

          <button 
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"
            onClick={nextImage}
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 font-bold tracking-widest text-sm bg-white/5 px-4 py-1 rounded-full">
            {selectedIndex + 1} / {portfolioItems.length}
          </div>
        </div>
      )}

      <CTASection />
      <Footer />
    </div>
  );
};

export default Portfolio;
