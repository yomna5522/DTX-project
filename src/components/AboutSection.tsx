import { Sparkles, Eye, Layers, Heart, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import aboutImage from "@/assets/about-printing.jpg";

const features = [
  { icon: Sparkles, titleKey: "lastingBrilliance", descKey: "lastingBrillianceDesc", color: "bg-[#F5BB00]" },
  { icon: Eye, titleKey: "sharpDetails", descKey: "sharpDetailsDesc", color: "bg-[#EC1C24]" },
  { icon: Layers, titleKey: "diverseSelection", descKey: "diverseSelectionDesc", color: "bg-[#002B5B]" },
  { icon: Heart, titleKey: "yourVision", descKey: "yourVisionDesc", color: "bg-[#D63384]" },
];

const AboutSection = () => {
  const { t } = useTranslation();
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
            <span className="text-[140px] md:text-[240px] font-heading font-black text-gray-50 uppercase tracking-tighter opacity-80 scale-x-110">
              About
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-accent text-[11px] font-bold uppercase tracking-[0.4em] mb-4">
              {t("about.aboutCompany")}
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary tracking-tight">
              {t("about.heading")}
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative group">
            <div className="relative overflow-hidden rounded-lg shadow-2xl">
              <img
                src={aboutImage}
                alt="Printed fabric close-up"
                className="w-full object-cover h-[500px] transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl ring-8 ring-white/20 transition-transform group-hover:scale-110 cursor-pointer">
                  <Play className="h-6 w-6 text-accent fill-accent ml-1 rtl:mr-1 rtl:ml-0" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-gray-500 leading-relaxed mb-6 text-sm">
              {t("about.intro")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {features.map((f, i) => (
                <div key={i} className="flex flex-col items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${f.color} flex items-center justify-center shadow-lg`}>
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg font-black text-primary mb-2 tracking-tight">
                      {t(`about.${f.titleKey}`)}
                    </h4>
                    <p className="text-gray-500 text-[13px] leading-relaxed">
                      {t(`about.${f.descKey}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
