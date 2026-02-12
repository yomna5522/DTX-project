import { PenTool, Box, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesGrid = () => {
  const { t } = useTranslation();
  const features = [
    { icon: PenTool, titleKey: "designTitle", descKey: "designDesc" },
    { icon: Box, titleKey: "fabricTitle", descKey: "fabricDesc" },
    { icon: Zap, titleKey: "printTitle", descKey: "printDesc" },
  ];

  return (
    <section className="py-20 bg-[#FBFBFB]">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group flex items-start gap-6 p-8 bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-accent flex-shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-accent text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                  {t("services.designLabel")}
                </p>
                <h3 className="font-heading text-xl font-bold text-primary mb-3">
                  {t(`services.${feature.titleKey}`)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t(`services.${feature.descKey}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
