import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { orderApi } from "@/api/orderApi";
import { ordersApi } from "@/api/orders";
import type { Order } from "@/types/order";
import heroPrinting from "@/assets/hero-printing.jpg";
import { RefreshCcw, Upload } from "lucide-react";

const OrderDetail = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }
    let cancelled = false;
    orderApi.getOrder(orderId).then((o) => {
      if (!cancelled) {
        if (o) {
          setOrder(o);
          return;
        }
        // Fallback: order may have been created locally (e.g. ord-xxx) and only exists in localStorage
        const local = ordersApi.getOrderById(orderId);
        setOrder(local ?? null);
      }
    });
    return () => { cancelled = true; };
  }, [orderId]);

  const isOwner = user && order && order.userId === user.id;
  const needsPayment =
    order &&
    order.items[0]?.fabricChoice.fabricSource === "factory" &&
    !order.paymentMethod &&
    !order.paymentProofFileName;

  const handleRepeatOrder = () => {
    navigate("/shop", { state: { repeatOrderId: orderId } });
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !order || !needsPayment) return;
    if (!paymentFile) {
      setPaymentError("Please select a payment proof file.");
      return;
    }
    setPaymentError("");
    setPaymentSubmitting(true);
    try {
      await orderApi.createPayment(orderId, "instant_pay", paymentFile);
      const updated = await orderApi.getOrder(orderId);
      if (updated) setOrder(updated);
    } catch (err: unknown) {
      setPaymentError(err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to submit payment.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (order === undefined) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar />
        <Navbar />
        <section className="py-24 px-4">
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

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
              <p className="text-sm text-muted-foreground">
                Fabric: {item.fabricChoice.fabricType},{" "}
                {item.fabricChoice.fabricSource === "factory"
                  ? t("pages.shop.factoryProvides")
                  : item.fabricChoice.fabricSource === "customer"
                    ? t("pages.shop.iProvide")
                    : t("pages.shop.notSure")}
              </p>
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
            {needsPayment ? (
              <form onSubmit={handleSubmitPayment} className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("pages.orderDetail.total")}: {order.totalAmount} EGP</p>
                <label className="block text-sm font-medium text-primary">
                  {t("pages.orderDetail.uploadProof")}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPaymentFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-accent file:text-white"
                />
                {paymentError && <p className="text-sm text-destructive">{paymentError}</p>}
                <button
                  type="submit"
                  disabled={paymentSubmitting || !paymentFile}
                  className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-accent/90 disabled:opacity-70"
                >
                  <Upload className="h-4 w-4" /> {paymentSubmitting ? t("common.loading") : t("pages.orderDetail.submitPayment")}
                </button>
              </form>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{t("pages.orderDetail.method")}: {order.paymentMethod ?? "—"}</p>
                {order.paymentProofFileName && (
                  <p className="text-sm text-muted-foreground">{t("pages.orderDetail.proof")}: {order.paymentProofFileName}</p>
                )}
                <p className="font-bold text-primary mt-2">{t("pages.orderDetail.total")}: {order.totalAmount} EGP</p>
              </>
            )}
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
