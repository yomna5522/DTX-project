import { Quote } from "lucide-react";
import aboutImage from "@/assets/about-printing.jpg";

const TestimonialsSection = () => {
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
                Clients Reviews
              </p>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary mb-12 tracking-tight">
              What Our Clients Say About Us
            </h2>
            
            <div className="bg-white p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative group transition-all hover:-translate-y-1">
              <div className="absolute -top-6 -left-0 w-12 h-12 bg-accent flex items-center justify-center text-white shadow-lg">
                <Quote className="h-6 w-6" />
              </div>
              <p className="text-gray-500 text-lg leading-relaxed mb-10 font-medium italic">
                "Amazing print quality and vibrant colors! DTX brought my designs to life perfectly. Highly recommend their professional team for any high-end textile project."
              </p>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                  <span className="text-accent font-black text-lg">AE</span>
                </div>
                <div>
                  <h4 className="font-heading font-black text-lg text-primary tracking-tight">Amr ElSelimy</h4>
                  <p className="text-[10px] text-accent font-black uppercase tracking-widest">Floki Systems</p>
                </div>
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
