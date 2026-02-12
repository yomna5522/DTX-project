import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Mail, Phone, User, ArrowRight } from "lucide-react";
import { useState } from "react";
import heroPrinting from "@/assets/hero-printing.jpg";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you! Your message has been sent.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      {/* Page Hero */}
      <section className="bg-primary relative min-h-[300px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 py-16">
          <h1 className="font-heading text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">
            CONTACT US
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

      {/* Contact Content Section */}
      <section className="relative pt-16 pb-24 z-10 px-4 bg-white">
        <div className="container mx-auto relative cursor-default">
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
              <span className="text-[120px] md:text-[200px] font-heading font-black text-gray-100 uppercase tracking-tighter opacity-80 scale-x-110">
                Contact
              </span>
            </div>
            <p className="text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-4 relative z-10">
              Get In Touch
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary relative z-10">
              Question in Mind?
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            {/* Left Side: Info */}
            <div className="relative pt-12">
              <p className="text-muted-foreground leading-relaxed mb-12 max-w-md">
                Our team is ready to assist you with all your fabric printing inquiries. Reach out 
                to us using the contact information below, and we'll be happy to answer your 
                questions and discuss your project requirements.
              </p>

              <div className="space-y-10">
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white shadow-xl shadow-accent/20 group-hover:scale-110 transition-transform">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xl font-bold text-primary mb-1">Location</h4>
                    <p className="text-muted-foreground text-sm">871 Industrial Area, New Cairo</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-primary shadow-xl shadow-secondary/20 group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xl font-bold text-primary mb-1">Email</h4>
                    <p className="text-muted-foreground text-sm">support@dtxegypt.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-full bg-[#4A90DA] flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xl font-bold text-primary mb-1">Phone</h4>
                    <p className="text-muted-foreground text-sm">+20 108 062 5987</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="bg-white pt-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-primary font-bold text-sm ml-1">Name</label>
                  <div className="relative">
                    <input 
                      type="text" required placeholder="Your Full Name"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[#F5F7F9] border-none py-4 px-6 rounded-sm text-sm focus:ring-1 focus:ring-accent transition-all pl-6"
                    />
                    <User className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-accent opacity-50" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-primary font-bold text-sm ml-1">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" required placeholder="Your Email"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#F5F7F9] border-none py-4 px-6 rounded-sm text-sm focus:ring-1 focus:ring-accent transition-all pl-6"
                    />
                    <Mail className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-accent opacity-50" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-primary font-bold text-sm ml-1">Phone Number</label>
                  <div className="relative">
                    <input 
                      type="tel" required placeholder="Your Mobile Number"
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-[#F5F7F9] border-none py-4 px-6 rounded-sm text-sm focus:ring-1 focus:ring-accent transition-all pl-6"
                    />
                    <Phone className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-accent opacity-50" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-primary font-bold text-sm ml-1">Your Inquiry</label>
                  <textarea 
                    required placeholder="Write Your Message" rows={5}
                    value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-[#F5F7F9] border-none py-4 px-6 rounded-sm text-sm focus:ring-1 focus:ring-accent transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="group bg-accent text-white pl-8 pr-2 py-2 flex items-center gap-6 font-bold text-xs tracking-[0.2em] transition-all hover:bg-accent/90 shadow-xl shadow-accent/20"
                >
                  <span>SEND MESSAGE</span>
                  <div className="bg-white/20 p-2.5 rounded-sm group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[600px] w-full bg-gray-100 grayscale hover:grayscale-0 transition-all duration-700">
        <iframe 
          title="DTX Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110532.89539316045!2d31.303291843359374!3d30.032422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583c4779601d3f%3A0xc6ad54898fc8066b!2sNew%20Cairo%20City%2C%20Cairo%20Governorate!5e0!3m2!1sen!2seg!4v1707681534567!5m2!1sen!2seg" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
