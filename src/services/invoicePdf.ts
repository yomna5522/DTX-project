import { jsPDF } from "jspdf";
import type { InvoiceDocument } from "@/types/billing";

/**
 * Generate and download a branded PDF invoice.
 * Uses jsPDF for pure client-side rendering — no server needed.
 */
export function downloadInvoicePdf(invoice: InvoiceDocument): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = w - margin * 2;
  let y = 0;

  // ── Colors ──────────────────────────────────────────
  const primary: [number, number, number] = [59, 130, 246]; // blue-500
  const dark: [number, number, number] = [15, 23, 42]; // slate-900
  const muted: [number, number, number] = [100, 116, 139]; // slate-500
  const lightBg: [number, number, number] = [248, 250, 252]; // slate-50
  const red: [number, number, number] = [239, 68, 68];

  // ── Header bar ──────────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(0, 0, w, 8, "F");

  // ── Company info ────────────────────────────────────
  y = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...dark);
  doc.text("DTX PRINTING Center", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  y += 7;
  doc.text("Industrial Zone A, 4th Industrial City", margin, y);
  y += 4;
  doc.text("Cairo, Egypt  |  Tax ID: 990-221-440", margin, y);

  // ── Invoice title ───────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(230, 230, 230);
  doc.text("INVOICE", w - margin, 22, { align: "right" });

  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text(
    `${invoice.customerName}.${invoice.billNumber}`,
    w - margin,
    32,
    { align: "right" }
  );

  // ── Divider ─────────────────────────────────────────
  y = 44;
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.8);
  doc.line(margin, y, w - margin, y);

  // ── Bill to + meta ──────────────────────────────────
  y = 52;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...primary);
  doc.text("BILL RECIPIENT", margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...dark);
  y += 7;
  doc.text(invoice.customerName, margin, y);

  // Right side: dates
  const metaX = w - margin;
  let metaY = 52;
  const metaLine = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(label, metaX - 40, metaY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text(value, metaX, metaY, { align: "right" });
    metaY += 6;
  };
  metaLine("Period", `${invoice.periodStart} — ${invoice.periodEnd}`);
  metaLine("Issued", new Date(invoice.createdAt).toLocaleDateString());
  metaLine("Status", invoice.status);

  // ── Line items table ────────────────────────────────
  y = 80;
  // Header
  doc.setFillColor(...lightBg);
  doc.rect(margin, y - 5, contentW, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...dark);

  const colDesign = margin + 2;
  const colFabric = margin + 60;
  const colMeters = margin + 105;
  const colRate = margin + 130;
  const colTotal = w - margin - 2;

  doc.text("DESIGN", colDesign, y);
  doc.text("FABRIC", colFabric, y);
  doc.text("METERS (LM)", colMeters, y);
  doc.text("RATE", colRate, y);
  doc.text("TOTAL", colTotal, y, { align: "right" });

  y += 8;
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);

  for (const line of invoice.lines) {
    // Check for page break
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(line.designRef, colDesign, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(line.fabric, colFabric, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(String(line.totalMeters), colMeters, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`${line.pricePerMeter} EGP`, colRate, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(`${line.lineTotal.toLocaleString()} EGP`, colTotal, y, {
      align: "right",
    });

    y += 4;
    doc.line(margin, y, w - margin, y);
    y += 6;
  }

  // ── Totals section ──────────────────────────────────
  y += 6;
  const totalsX = w - margin;
  const labelX = totalsX - 80;

  const totalsLine = (
    label: string,
    value: string,
    bold = false,
    color: [number, number, number] = dark
  ) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(label, labelX, y);
    doc.setTextColor(...color);
    doc.setFont("helvetica", "bold");
    doc.text(value, totalsX, y, { align: "right" });
    y += 7;
  };

  totalsLine("Subtotal", `${invoice.subtotal.toLocaleString()} EGP`);
  totalsLine(
    `Discount (${invoice.discountPct}%)`,
    `-${invoice.discountAmount.toLocaleString()} EGP`,
    false,
    red
  );
  totalsLine("After Discount", `${invoice.afterDiscount.toLocaleString()} EGP`);
  totalsLine(
    `VAT (${invoice.vatPct}%)`,
    `+${invoice.vatAmount.toLocaleString()} EGP`
  );

  // Grand total box
  y += 4;
  doc.setFillColor(...dark);
  doc.roundedRect(labelX - 5, y - 6, totalsX - labelX + 10, 16, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("GRAND TOTAL", labelX, y + 2);
  doc.setFontSize(14);
  doc.text(`${invoice.total.toLocaleString()} EGP`, totalsX, y + 3, {
    align: "right",
  });

  // ── Footer ──────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text("Thank you for choosing DTX Group Egypt", margin, footerY);
  doc.setTextColor(200, 200, 200);
  doc.text("Validated Ledger Copy", w - margin, footerY, { align: "right" });

  // Bottom bar
  doc.setFillColor(...primary);
  doc.rect(
    0,
    doc.internal.pageSize.getHeight() - 4,
    w,
    4,
    "F"
  );

  // ── Save ────────────────────────────────────────────
  const filename = `Invoice_${invoice.customerName}_${invoice.billNumber}_${invoice.periodEnd}.pdf`;
  doc.save(filename);
}
