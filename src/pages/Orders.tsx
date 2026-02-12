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

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <label className="font-bold text-primary">{t("pages.orders.filterByStatus")}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "ALL")}
              className="bg-[#F5F7F9] border-none py-2 px-4 rounded-lg text-sm focus:ring-1 focus:ring-accent"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value === "ALL" ? t("pages.orders.all") : opt.value.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {filteredOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              {orders.length === 0 ? t("pages.orders.noOrders") : t("pages.orders.noMatch")}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block p-4 md:p-6 border-2 border-border rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-heading font-bold text-primary">{t("pages.orders.order")} {order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} {t("pages.orders.items")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary">{order.totalAmount} EGP</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "CANCELLED"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-accent/10 text-accent"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/shop" className="text-accent font-bold hover:underline">
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
