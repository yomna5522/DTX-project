import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";
import "./index.css";
import { setOnOrderCreated } from "@/api/orders";
import { defaultEmailHandler } from "@/services/emailNotification";

// Auto-send email notification to factory on every new order or quotation request.
// Set VITE_EMAIL_WEBHOOK_URL to your backend URL to POST the payload; otherwise it logs in dev.
setOnOrderCreated(defaultEmailHandler);

createRoot(document.getElementById("root")!).render(<App />);
