import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateIST } from "@/lib/utils/format";
import { formatINR } from "@/lib/utils/currency";

export interface PDFOrderData {
  orderNumber: string;
  createdAt: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: {
    houseBuilding: string;
    streetLocality: string;
    landmark?: string;
    city: string;
    district: string;
    state: string;
    pinCode: string;
  };
  orderNotes?: string | null;
  customerVisibleNote?: string | null;
  items: Array<{
    title: string;
    variantLabel?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  shippingCharge: number;
  adjustmentAmount?: number;
  adjustmentReason?: string | null;
  discountAmount?: number;
  finalTotal: number;
  businessSnapshot?: {
    business_name?: string;
    tagline?: string;
    phone?: string | null;
    whatsapp_number?: string | null;
    email?: string | null;
    address?: string | null;
  };
}

/**
 * Generates an artisan order summary PDF for either provisional requests or confirmed orders.
 * Follows Section 10 specs (never called a tax/GST invoice; uses snapshot; correct currency).
 */
export function generateOrderSummaryPDF(order: PDFOrderData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const isConfirmed = [
    "CONFIRMED",
    "PREPARING",
    "READY_TO_SHIP",
    "SHIPPED",
    "DELIVERED",
  ].includes(order.status);

  const documentTitle = isConfirmed
    ? "CONFIRMED ORDER SUMMARY"
    : "PROVISIONAL ORDER REQUEST SUMMARY";

  const statusSubtitle = isConfirmed
    ? `Status: ${order.status.replace(/_/g, " ")}`
    : "Status: Awaiting Owner Confirmation (Not a paid invoice)";

  const business = order.businessSnapshot || {};
  const bizName = business.business_name || "Vedanya Craft Ghar";
  const bizTagline = business.tagline || "Handmade with love";

  // Brand Palette: Deep Espresso (69, 60, 53), Terracotta (185, 121, 104), Sand (233, 220, 203)
  const espresso = [69, 60, 53] as const;
  const terracotta = [185, 121, 104] as const;

  // Header Background Bar
  doc.setFillColor(248, 244, 236); // Warm Ivory
  doc.rect(0, 0, 210, 42, "F");

  // Business Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(espresso[0], espresso[1], espresso[2]);
  doc.text(bizName, 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(terracotta[0], terracotta[1], terracotta[2]);
  doc.text(bizTagline, 14, 25);

  // Business Contacts (if configured in snapshot)
  const contactLines: string[] = [];
  if (business.whatsapp_number) contactLines.push(`WA: +91 ${business.whatsapp_number}`);
  if (business.email) contactLines.push(`Email: ${business.email}`);
  if (business.address) contactLines.push(business.address);

  if (contactLines.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(110, 100, 95);
    doc.text(contactLines.slice(0, 2).join(" | "), 14, 32);
  }

  // Document Title & Reference (Right side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(espresso[0], espresso[1], espresso[2]);
  doc.text(documentTitle, 196, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 105);
  doc.text(`Order Ref: ${order.orderNumber}`, 196, 24, { align: "right" });
  doc.text(`Date: ${formatDateIST(order.createdAt)}`, 196, 29, { align: "right" });
  doc.text(statusSubtitle, 196, 34, { align: "right" });

  // Divider Line
  doc.setDrawColor(216, 204, 190);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);

  // Customer & Shipping Details Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(espresso[0], espresso[1], espresso[2]);
  doc.text("DELIVERY & CUSTOMER DETAILS", 14, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Customer Name: ${order.customerName}`, 14, 58);
  doc.text(`Contact Mobile: +91 ${order.customerPhone}`, 14, 63);
  if (order.customerEmail) {
    doc.text(`Email: ${order.customerEmail}`, 14, 68);
  }

  const addr = order.shippingAddress;
  const addressText = `${addr.houseBuilding}, ${addr.streetLocality}${addr.landmark ? `, Near ${addr.landmark}` : ""}, ${addr.city}, ${addr.district}, ${addr.state} - ${addr.pinCode}`;
  doc.text(`Shipping Address: ${doc.splitTextToSize(addressText, 100).join("\n")}`, 14, order.customerEmail ? 73 : 68);

  if (order.orderNotes) {
    doc.setTextColor(terracotta[0], terracotta[1], terracotta[2]);
    doc.text(`Customer Note: ${order.orderNotes}`, 14, 86);
    doc.setTextColor(espresso[0], espresso[1], espresso[2]);
  }

  // Item Table
  const tableRows = order.items.map((item, idx) => {
    const itemTitle = item.variantLabel
      ? `${item.title}\n(${item.variantLabel})`
      : item.title;
    return [
      String(idx + 1),
      itemTitle,
      String(item.quantity),
      `Rs. ${item.unitPrice.toFixed(2)}`,
      `Rs. ${item.lineTotal.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: order.orderNotes ? 92 : 84,
    head: [["#", "Item Description", "Qty", "Unit Price", "Total"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [233, 220, 203], // Sand
      textColor: [69, 60, 53],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [69, 60, 53],
      fontSize: 8.5,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 96 },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
  });

  // Financial Totals Summary
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const rightAlign = 196;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Subtotal: Rs. ${order.subtotal.toFixed(2)}`, rightAlign, finalY, { align: "right" });
  doc.text(`Shipping: Rs. ${order.shippingCharge.toFixed(2)}`, rightAlign, finalY + 5, { align: "right" });

  let offset = 10;
  if (order.adjustmentAmount && order.adjustmentAmount !== 0) {
    doc.text(
      `Adjustment (${order.adjustmentReason || "Owner adjusted"}): Rs. ${order.adjustmentAmount.toFixed(2)}`,
      rightAlign,
      finalY + offset,
      { align: "right" }
    );
    offset += 5;
  }

  if (order.discountAmount && order.discountAmount > 0) {
    doc.text(`Discount: -Rs. ${order.discountAmount.toFixed(2)}`, rightAlign, finalY + offset, { align: "right" });
    offset += 5;
  }

  // Grand Total Highlight
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(terracotta[0], terracotta[1], terracotta[2]);
  doc.text(`Final Total: Rs. ${order.finalTotal.toFixed(2)}`, rightAlign, finalY + offset + 2, { align: "right" });

  // Owner Note / Payment Instructions (if present)
  if (order.customerVisibleNote) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(espresso[0], espresso[1], espresso[2]);
    doc.text("Artisan Owner Instructions / Payment Details:", 14, finalY + offset + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(doc.splitTextToSize(order.customerVisibleNote, 180), 14, finalY + offset + 13);
  }

  // Footer Disclaimer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(130, 120, 115);
  const footerText = isConfirmed
    ? "This document reflects an artisan-confirmed order summary from Vedanya Craft Ghar. Thank you for supporting authentic handmade slow craftsmanship."
    : "This is a provisional order request summary subject to artisan verification of handcrafting feasibility and delivery scheduling. This is NOT a tax invoice.";
  doc.text(doc.splitTextToSize(footerText, 182), 14, 280);

  return doc;
}
