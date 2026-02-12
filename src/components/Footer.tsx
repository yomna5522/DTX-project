import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white py-6 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground text-[13px] font-medium text-center md:text-left">
            Copyright © 2024 DTX Factory. All Rights Reserved. 
            <span className="text-accent ml-1">Powered by Floki Systems</span>
          </p>
          
          <div className="flex items-center gap-3">
            {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
              <a 
                key={i} 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white transition-all hover:bg-accent hover:-translate-y-1"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
