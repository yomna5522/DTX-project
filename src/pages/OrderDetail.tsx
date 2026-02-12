import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi } from "@/api/orders";
import heroPrinting from "@/assets/hero-printing.jpg";
import { RefreshCcw } from "lucide-react";

const OrderDetail = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const order = orderId ? ordersApi.getOrderById(orderId) : null;
  const isOwner = user && order && order.userId === user.id;

  const handleRepeatOrder = () => {
    if (!orderId || !user || !order || order.userId !== user.id) return;
    const newOrder = ordersApi.repeatOrder(orderId, user.id, user.customerType);
    if (newOrder) navigate(`/orders/${newOrder.id}`);
  };

  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar />
        <Navbar />
        <section className="py-24 px-4">
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground mb-6">{t("pages.orderDetail.notFound")}</p>
            <Link to="/orders" className="text-accent font-bold hover:underline">{t("pages.orderDetail.backToOrders")}</Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar />
        <Navbar />
        <section className="py-24 px-4">
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground mb-6">{t("pages.orderDetail.noAccess")}</p>
            <Link to="/orders" className="text-accent font-bold hover:underline">{t("pages.orderDetail.backToOrders")}</Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const item = order.items[0];

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      <section className="bg-primary relative min-h-[280px] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 py-12">
          <h1 className="font-heading text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">
            {t("pages.orderDetail.order")} {order.id}
          </h1>
          <p className="text-white/80 font-body text-sm mt-2">
            {t("pages.orderDetail.status")}: {order.status.replace(/_/g, " ")}
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent z-10" />
          <img src={heroPrinting} alt="Order" className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl space-y-8">
          {/* Status */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h2 className="font-heading text-lg font-black text-primary mb-2">{t("pages.orderDetail.status")}</h2>
            <p className="font-medium text-primary">{order.status.replace(/_/g, " ")}</p>
            {order.estimatedCompletion && (
              <p className="text-sm text-muted-foreground mt-1">{t("pages.orderDetail.estimatedCompletion")}: {order.estimatedCompletion}</p>
            )}
          </div>

          {/* Items */}
          {item && (
            <div className="p-4 border-2 border-border rounded-lg">
              <h2 className="font-heading text-lg font-black text-primary mb-3">{t("pages.orderDetail.orderDetails")}</h2>
              <p className="text-sm text-muted-foreground">Design: {item.designChoice.source}</p>
              <p className="text-sm text-muted-foreground">Fabric: {item.fabricChoice.fabricType}, {item.fabricChoice.fabricSource}</p>
              <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
              {item.notes && <p className="text-sm text-muted-foreground">Notes: {item.notes}</p>}
              <p className="font-bold text-primary mt-2">Unit: {item.unitPrice} EGP · Total: {item.totalPrice} EGP</p>
            </div>
          )}

          {/* Invoice */}
          {order.invoice && (
            <div className="p-4 border-2 border-border rounded-lg">
              <h2 className="font-heading text-lg font-black text-primary mb-2">{t("pages.orderDetail.invoice")}</h2>
              <p className="text-sm text-muted-foreground">Invoice {order.invoice.id}</p>
              <p className="font-bold text-primary">{t("pages.orderDetail.amount")}: {order.invoice.amount} EGP</p>
              <p className="text-sm text-muted-foreground">Status: {order.invoice.status}</p>
            </div>
          )}

          {/* Payment */}
          <div className="p-4 border-2 border-border rounded-lg">
            <h2 className="font-heading text-lg font-black text-primary mb-2">{t("pages.orderDetail.payment")}</h2>
            <p className="text-sm text-muted-foreground">{t("pages.orderDetail.method")}: {order.paymentMethod ?? "—"}</p>
            {order.paymentProofFileName && (
              <p className="text-sm text-muted-foreground">{t("pages.orderDetail.proof")}: {order.paymentProofFileName}</p>
            )}
            <p className="font-bold text-primary mt-2">{t("pages.orderDetail.total")}: {order.totalAmount} EGP</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link to="/orders" className="text-accent font-bold hover:underline">
              {t("pages.orderDetail.backToOrders")}
            </Link>
            <button
              type="button"
              onClick={handleRepeatOrder}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-accent/90"
            >
              <RefreshCcw className="h-4 w-4" /> {t("pages.orderDetail.repeatOrder")}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderDetail;
