import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { ShoppingSearch, UploadCloud, RefreshCcw, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import heroPrinting from "@/assets/hero-printing.jpg";

const designChoices = [
  {
    id: "browse",
    label: "Designs Option 1",
    title: "Browse Designs",
    desc: "Browse our list of creative designs.",
    icon: Search,
    color: "text-primary",
  },
  {
    id: "upload",
    label: "Designs Option 2",
    title: "Upload Yours",
    desc: "Upload your own design.",
    icon: UploadCloud,
    color: "text-primary",
  },
  {
    id: "repeat",
    label: "Designs Option 3",
    title: "Repeat Design",
    desc: "Repeat one of your previous designs.",
    icon: RefreshCcw,
    color: "text-primary",
  },
];

const Shop = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <TopBar />
      <Navbar />

      {/* Page Hero */}
      <section className="bg-primary relative min-h-[300px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 py-16">
          <h1 className="font-heading text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">
            SHOP
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

      {/* Design Choice Section */}
      <section className="relative pt-16 pb-24 z-10 px-4">
        {/* Background Decorative Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg className="absolute top-0 right-0 w-[500px] h-[500px]" viewBox="0 0 500 500" fill="none">
            <path d="M480 20C400 150 550 300 350 450" stroke="#004A99" strokeWidth="2" fill="none" className="opacity-50" />
            <path d="M500 100C420 230 570 380 370 530" stroke="#004A99" strokeWidth="1" fill="none" className="opacity-30" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-[400px] h-[400px] -rotate-12" viewBox="0 0 400 400" fill="none">
            <path d="M20 380C100 250 -50 100 150 -50" stroke="#EC1C24" strokeWidth="2" fill="none" className="opacity-20" />
            <circle cx="50" cy="350" r="15" stroke="#EC1C24" strokeWidth="2" fill="none" className="opacity-30" />
          </svg>
        </div>

        <div className="container mx-auto relative">
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
              <span className="text-[120px] md:text-[200px] font-heading font-black text-gray-100 uppercase tracking-tighter opacity-80 scale-x-110">
                Design
              </span>
            </div>
            <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-4 relative z-10">
              1- Design
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary relative z-10">
              Your Design Choice
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative z-20">
            {designChoices.map((choice) => (
              <div key={choice.id} className="bg-white border-[12px] border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] p-12 flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)]">
                <p className="text-accent text-[11px] font-bold tracking-[0.2em] mb-4 uppercase">
                  {choice.label}
                </p>
                <h3 className="font-heading text-2xl font-black text-primary mb-10 tracking-tight">
                  {choice.title}
                </h3>
                
                <div className="mb-12 w-24 h-24 flex items-center justify-center relative group-hover:scale-110 transition-transform">
                  <choice.icon className="w-20 h-20 text-primary stroke-[1.2]" />
                </div>
                
                <p className="text-muted-foreground text-[13px] mb-12 h-6 font-medium">
                  {choice.desc}
                </p>
                
                <button className="group bg-accent text-white pl-6 pr-1.5 py-1.5 flex items-center gap-5 font-bold text-[10px] tracking-[0.2em] transition-all hover:bg-accent/90 shadow-lg shadow-accent/20">
                  <span>PROCEED</span>
                  <div className="bg-white/20 p-2 rounded-sm group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
};

export default Shop;
