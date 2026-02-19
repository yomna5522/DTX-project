import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";
import "./index.css";
import { setOnOrderCreated } from "@/api/orders";
import { productionApi } from "@/api/production";
import { defaultEmailHandler } from "@/services/emailNotification";

// On every new order or quotation: notify factory and add to Production Forge sheet.
setOnOrderCreated((payload) => {
  defaultEmailHandler(payload);
  productionApi.addRunFromOrder(payload.order);
});

createRoot(document.getElementById("root")!).render(<App />);
