import { MapPin, Mail, Clock } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-topbar text-topbar-foreground py-2 text-sm border-b border-border hidden md:block">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            871 Industrial Area, New Cairo, Egypt
          </span>
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-accent" />
            support@dtxegypt.com
          </span>
        </div>
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          Sunday-Thursday, 09:00 AM - 05:00 PM
        </span>
      </div>
    </div>
  );
};

export default TopBar;
