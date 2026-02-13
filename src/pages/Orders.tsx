import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi } from "@/api/orders";
import type { OrderStatus } from "@/types/order";
import heroPrinting from "@/assets/hero-printing.jpg";
import { ChevronRight } from "lucide-react";

const Orders = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const STATUS_OPTIONS: { value: OrderStatus | "ALL"; labelKey: string }[] = [
    { value: "ALL", labelKey: "all" },
    { value: "SUBMITTED", labelKey: "Submitted" },
    { value: "INVOICE_PENDING", labelKey: "Invoice pending" },
    { value: "INVOICED", labelKey: "Invoiced" },
    { value: "PAYMENT_PENDING", labelKey: "Payment pending" },
    { value: "PAID", labelKey: "Paid" },
    { value: "IN_PRODUCTION", labelKey: "In production" },
    { value: "READY", labelKey: "Ready" },
    { value: "COMPLETED", labelKey: "Completed" },
    { value: "CANCELLED", labelKey: "Cancelled" },
  ];

  const orders = useMemo(() => {
    if (!user) return [];
    return ordersApi.getOrdersByUserId(user.id);
  }, [user]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      <section className="bg-primary relative min-h-[300px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 py-16">
          <h1 className="font-heading text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">
            {t("pages.orders.title")}
          </h1>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent z-10" />
          <img src={heroPrinting} alt="Orders" className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="relative py-16 px-4 bg-white">
        {/* Background Decorative Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg className="absolute top-0 right-0 w-[500px] h-[500px]" viewBox="0 0 500 500" fill="none">
            <path d="M480 20C400 150 550 300 350 450" stroke="#004A99" strokeWidth="2" fill="none" className="opacity-50" />
            <path d="M500 100C420 230 570 380 370 530" stroke="#004A99" strokeWidth="1" fill="none" className="opacity-30" />
          </svg>
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          {/* Filter Section */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100">
              <label className="font-bold text-primary text-sm">{t("pages.orders.filterByStatus")}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "ALL")}
                className="flex-1 min-w-[200px] bg-gray-50 border-2 border-gray-200 py-3 px-4 rounded-lg text-sm font-medium text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value === "ALL" ? t("pages.orders.all") : opt.value.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <div className="text-sm text-muted-foreground">
                {filteredOrders.length} {filteredOrders.length === 1 ? t("pages.orders.order") : t("pages.orders.order")}s
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100">
              <p className="text-muted-foreground text-lg mb-4">
                {orders.length === 0 ? t("pages.orders.noOrders") : t("pages.orders.noMatch")}
              </p>
              {orders.length === 0 && (
                <Link 
                  to="/shop" 
                  className="inline-flex items-center gap-2 bg-accent text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                >
                  {t("pages.orders.createNew")}
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block group"
                >
                  <div className="bg-white p-6 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border-2 border-gray-100 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <p className="font-heading font-black text-primary text-lg mb-2 group-hover:text-primary/80 transition-colors">
                          {t("pages.orders.order")} {order.id}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </span>
                          <span>·</span>
                          <span>{order.items.length} {t("pages.orders.items")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-heading font-black text-primary text-xl mb-1">
                            {order.totalAmount} EGP
                          </p>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.status === "COMPLETED"
                              ? "bg-green-100 text-green-700 border-2 border-green-200"
                              : order.status === "CANCELLED"
                                ? "bg-gray-100 text-gray-600 border-2 border-gray-200"
                                : order.status === "PAID"
                                  ? "bg-blue-100 text-blue-700 border-2 border-blue-200"
                                  : order.status === "IN_PRODUCTION"
                                    ? "bg-amber-100 text-amber-700 border-2 border-amber-200"
                                    : order.status === "READY"
                                      ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-200"
                                      : "bg-accent/10 text-accent border-2 border-accent/20"
                          }`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                          <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 bg-accent text-white font-bold text-sm px-8 py-4 rounded-lg hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:scale-105"
            >
              {t("pages.orders.createNew")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Orders;
