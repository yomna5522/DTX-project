import type { Order } from "@/types/order";
import { ordersApi } from "@/api/orders";
import { authApi } from "@/api/auth";
import { userDesignsApi } from "@/api/userDesigns";

/**
 * Builds the email content to send to the factory on every new order or quotation request.
 * Use this payload with your email API or backend (e.g. POST to a webhook that sends email).
 */
export function buildFactoryNotificationEmail(payload: {
  order: Order;
  customerName: string;
  customerEmail: string;
  isQuotationRequest: boolean;
}): { subject: string; body: string; json: Record<string, unknown> } {
  const { order, customerName, customerEmail, isQuotationRequest } = payload;
  const item = order.items[0];
  const orderType = item?.fabricChoice?.orderType ?? "order";
  const designSource = item?.designChoice?.source ?? "—";
  const designAttachment =
    item?.designChoice?.uploadFileName ??
    (item?.designChoice?.presetId ? ordersApi.getPresetById(item.designChoice.presetId)?.name : null) ??
    (item?.designChoice?.myLibraryDesignId && order.userId
      ? userDesignsApi.getDesignById(order.userId, item.designChoice.myLibraryDesignId)?.name ?? item.designChoice.myLibraryDesignId
      : null) ??
    "—";
  const fabricType = item?.fabricChoice?.fabricType ?? "—";
  const fabricSource = item?.fabricChoice?.fabricSource === "customer" ? "I Provide" : item?.fabricChoice?.fabricSource === "factory" ? "Factory Provides" : item?.fabricChoice?.fabricSource === "not_sure" ? "Not Sure" : "—";
  const factoryFabric = item?.fabricChoice?.factoryFabricId ? ordersApi.getFactoryFabricById(item.fabricChoice.factoryFabricId) : null;
  const quantity = item?.quantity ?? 0;
  const unitPrice = item?.unitPrice ?? 0;
  const totalPrice = item?.totalPrice ?? order.totalAmount;
  const paymentMethod = order.paymentMethod ?? (isQuotationRequest ? "N/A (quotation)" : "—");
  const notes = item?.notes ?? "—";
  const timestamp = new Date(order.createdAt).toISOString();

  const subject = isQuotationRequest
    ? `[Quotation Request] ${order.id} – ${customerName}`
    : `[New Order] ${order.id} – ${customerName}`;

  const body = [
    "--- New submission ---",
    "",
    "Customer & contact:",
    `  Name: ${customerName}`,
    `  Email: ${customerEmail}`,
    "",
    "Order type: " + (orderType === "sample" ? "Sample" : "Order"),
    "Design source: " + designSource,
    "Design attachment / preset: " + designAttachment,
    "",
    "Fabric type: " + fabricType,
    "Fabric source: " + fabricSource,
    ...(factoryFabric
      ? [
          "",
          "Selected factory fabric: " + factoryFabric.name,
          "Quantity: " + quantity + " m",
          "Price per meter: " + unitPrice + " EGP",
          "Total: " + totalPrice + " EGP",
        ]
      : []),
    "",
    "Payment method: " + paymentMethod,
    "Notes: " + notes,
    "Timestamp: " + timestamp,
    "",
    isQuotationRequest ? "→ Customer is waiting for a quotation." : "",
  ]
    .filter(Boolean)
    .join("\n");

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  const json = {
    subject,
    toEmail: adminEmail ?? undefined,
    customerName,
    customerEmail,
    orderId: order.id,
    orderType: orderType === "sample" ? "Sample" : "Order",
    designSource,
    designAttachment,
    fabricType,
    fabricSource,
    factoryFabric: factoryFabric ? { name: factoryFabric.name, quantity, unitPrice, totalPrice } : null,
    paymentMethod,
    notes,
    timestamp,
    isQuotationRequest,
  };

  return { subject, body, json };
}

/**
 * Default handler: log the email payload. Replace or extend with a real send (e.g. fetch to your backend).
 */
export function defaultEmailHandler(payload: {
  order: Order;
  customerName: string;
  customerEmail: string;
  isQuotationRequest: boolean;
}) {
  let { customerName, customerEmail } = payload;
  if (!customerName || !customerEmail) {
    const user = authApi.getUserById(payload.order.userId);
    if (user) {
      customerName = customerName || user.name;
      customerEmail = customerEmail || user.email;
    }
  }
  const resolved = { ...payload, customerName, customerEmail };
  const { subject, body, json } = buildFactoryNotificationEmail(resolved);
  if (import.meta.env.DEV) {
    console.log("[Email notification]", subject, "\n", body, "\n", json);
  }
  const webhookUrl = import.meta.env.VITE_EMAIL_WEBHOOK_URL as string | undefined;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, ...json }),
    }).catch((err) => console.warn("Email webhook failed:", err));
  }
}
