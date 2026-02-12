import { Paintbrush, Shirt, Printer } from "lucide-react";

const services = [
  {
    icon: Paintbrush,
    label: "Bring your designs to life.",
    title: "Your Design",
    description:
      "Supply your own design in appropriate formats or browse our list of ready to print designs.",
  },
  {
    icon: Shirt,
    label: "All synthetic and natural fabrics",
    title: "Your Fabric",
    description:
      "Supply your own fabric or shop from our wide range of synthetic and natural fabrics.",
  },
  {
    icon: Printer,
    label: "Cutting Edge Technology",
    title: "Best Quality Print",
    description:
      "We deliver vibrant, long-lasting colors and sharp details that elevate your designs.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-16 bg-[#F8F9FA]">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          {services.map((service, i) => (
            <div
              key={i}
              className="flex items-start gap-6 group translate-y-0 transition-transform hover:-translate-y-1"
            >
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                <service.icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-accent text-[11px] font-bold uppercase tracking-[0.2em] mb-2">
                  {service.label}
                </p>
                <h3 className="font-heading text-2xl font-black text-primary mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
