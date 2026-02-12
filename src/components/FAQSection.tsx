import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroFabrics from "@/assets/hero-fabrics.jpg";

const faqs = [
  {
    q: "What types of fabrics do you print on?",
    a: "We offer sublimation printing on a wide variety of both Natural Fabrics like Cotton, Gabardine & Linen and also Synthetic fabrics including Chiffon, Satin, Voile & Polyester.",
  },
  {
    q: "What is the minimum order quantity?",
    a: "Our minimum order quantity varies depending on the specific project requirements. Please contact us for more information.",
  },
  {
    q: "How long does it take to receive my order?",
    a: "Turnaround times depend on the size and complexity of your order. We will provide you with an estimated delivery timeframe upon receiving your project details.",
  },
  {
    q: "Do you provide free samples?",
    a: "Yes, we can provide sample prints so you can evaluate our quality before placing a larger order. Contact us for details.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-0 bg-primary overflow-hidden border-t border-white/5">
      <div className="flex flex-col lg:flex-row">
        {/* Left Side: Image */}
        <div className="w-full lg:w-1/2 min-h-[500px] md:min-h-[700px] relative overflow-hidden group">
          <img 
            src={heroFabrics} 
            alt="Fabric manufacturing" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/30 transition-all duration-700"></div>
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent"></div>
        </div>

        {/* Right Side: Accordion */}
        <div className="w-full lg:w-1/2 py-24 px-8 md:px-24 flex flex-col justify-center relative bg-primary">
          <div className="absolute top-1/2 left-24 -translate-y-1/2 select-none opacity-[0.03] -z-0 pointer-events-none">
            <span className="text-[120px] md:text-[280px] font-heading font-black text-white uppercase tracking-tighter">
              FAQ
            </span>
          </div>

          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-0.5 bg-secondary rounded-full"></span>
              <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.3em]">
                FAQ
              </p>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-white mb-12 tracking-tight leading-tight">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem 
                  key={i} 
                  value={`faq-${i}`} 
                  className="border-b border-white/10 px-0"
                >
                  <AccordionTrigger className="text-left font-heading text-lg font-bold text-white hover:text-secondary hover:no-underline py-5 transition-colors group">
                    <span className="flex-1">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-white/60 text-sm md:text-base leading-relaxed pb-8 pl-0">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
