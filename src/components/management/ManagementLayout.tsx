import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Package,
  TrendingUp,
  AlertTriangle,
  Building2,
  Layers,
  Receipt,
  Wallet,
  Banknote,
  Cpu,
  FileText,
  Briefcase,
  ShieldCheck,
  Activity,
  Percent,
  Mail,
  Menu,
  Palette,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-slate-500 hover:bg-slate-100 hover:text-primary"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const ManagementLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const groups = [
    {
      title: "Core Operations",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/management" },
        { icon: Users, label: "Customers", href: "/management/customers" },
        { icon: Building2, label: "Suppliers", href: "/management/suppliers" },
      ]
    },
    {
      title: "Production Chain",
      items: [
        { icon: ShoppingBag, label: "Orders & Quotations", href: "/management/orders" },
        { icon: Layers, label: "Fabric Inventory", href: "/management/fabric-inventory" },
        { icon: Palette, label: "Design Library", href: "/management/design-library" },
        { icon: Cpu, label: "Production Forge", href: "/management/production" },
        { icon: FileText, label: "Templates", href: "/management/production/templates" },
        { icon: Layers, label: "Products Catalog", href: "/management/products" },
      ]
    },
    {
      title: "Logistics & Stock",
      items: [
        { icon: Package, label: "Warehouse", href: "/management/inventory" },
        { icon: Receipt, label: "Sourcing (PO)", href: "/management/purchases" },
      ]
    },
    {
      title: "Financial Vault",
      items: [
        { icon: Banknote, label: "Expenses", href: "/management/expenses" },
        { icon: Wallet, label: "Master Ledger", href: "/management/financials" },
        { icon: FileText, label: "Billing Vault", href: "/management/invoices" },
        { icon: Upload, label: "Import Wizard", href: "/management/import" },
      ]
    },
    {
      title: "Administration",
      items: [
        { icon: Briefcase, label: "Human Resources", href: "/management/hrm" },
        { icon: ShieldCheck, label: "Control Center", href: "/management/settings" },
      ]
    }
  ];

  const SidebarContent = () => (
    <>
      <div className="w-full p-4 flex items-center justify-center border-b border-slate-100">
        <Link to="/" className="block w-full" aria-label="DTX Home">
          <img src="/src/assets/Logo.png" alt="DTX Logo" className="w-full h-auto max-h-12 object-contain object-center filter drop-shadow-sm" />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h5 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{group.title}</h5>
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem 
                  key={item.href} 
                  {...item} 
                  active={location.pathname === item.href} 
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col fixed inset-y-0 z-50 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 overflow-x-hidden">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-primary transition-colors">
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-0 flex flex-col bg-white">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {groups.flatMap(g => g.items).find(n => n.href === location.pathname)?.label || "Management"}
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">DTX Industrial Command Console</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-bold text-slate-900 text-sm">Admin Name</span>
              <span className="text-slate-500 text-xs">Super Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="Admin" />
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default ManagementLayout;
