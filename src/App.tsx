import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDirection } from "@/hooks/useDirection";
import Index from "./pages/Index";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Login from "./pages/Login";
import Register from "./pages/Register";

// User-facing pages (from zeyad-br)
import UserOrders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import UserSettings from "./pages/Settings";

// Management pages (from HEAD)
import Dashboard from "./pages/management/Dashboard";
import ManagementLogin from "./pages/management/Login";
import Customers from "./pages/management/Customers";
import Suppliers from "./pages/management/Suppliers";
import Inventory from "./pages/management/Inventory";
import Products from "./pages/management/Products";
import Purchases from "./pages/management/Purchases";
import Expenses from "./pages/management/Expenses";
import ManagementOrders from "./pages/management/Orders";
import OrderTracking from "./pages/management/OrderTracking";
import ProductionTemplates from "./pages/management/ProductionTemplates";
import ProductionForge from "./pages/management/ProductionForge";
import Financials from "./pages/management/Financials";
import Invoices from "./pages/management/Invoices";
import HRM from "./pages/management/HRM";
import ControlCenter from "./pages/management/Settings";

import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => {
  useDirection();
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Public / User Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/orders" element={<ProtectedRoute><UserOrders /></ProtectedRoute>} />
            <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />

            {/* Management System Routes */}
            <Route path="/management/login" element={<ManagementLogin />} />
            <Route path="/management" element={<Dashboard />} />
            <Route path="/management/customers" element={<Customers />} />
            <Route path="/management/suppliers" element={<Suppliers />} />
            <Route path="/management/products" element={<Products />} />
            <Route path="/management/inventory" element={<Inventory />} />
            <Route path="/management/purchases" element={<Purchases />} />
            <Route path="/management/expenses" element={<Expenses />} />
            <Route path="/management/orders" element={<ManagementOrders />} />
            <Route path="/management/orders/tracking" element={<OrderTracking />} />
            <Route path="/management/production" element={<ProductionForge />} />
            <Route path="/management/production/templates" element={<ProductionTemplates />} />
            <Route path="/management/financials" element={<Financials />} />
            <Route path="/management/invoices" element={<Invoices />} />
            <Route path="/management/hrm" element={<HRM />} />
            <Route path="/management/settings" element={<ControlCenter />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
