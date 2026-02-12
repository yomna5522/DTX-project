import { PenTool, Box, Zap } from "lucide-react";

const features = [
  {
    icon: PenTool,
    title: "Your Design",
    desc: "Supply your own design in appropriate formats or select from our list of ready to print designs.",
  },
  {
    icon: Box,
    title: "Your Fabric",
    desc: "Supply your own fabric or shop from our wide range of synthetic and natural fabrics.",
  },
  {
    icon: Zap,
    title: "Best Quality Print",
    desc: "We deliver vibrant, long-lasting colors and sharp details that elevate your designs.",
  },
];

const FeaturesGrid = () => {
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
                  Bring your designs to life
                </p>
                <h3 className="font-heading text-xl font-bold text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
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
