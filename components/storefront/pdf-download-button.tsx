"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { generateOrderSummaryPDF, type PDFOrderData } from "@/lib/pdf/order-summary-pdf";

interface PDFDownloadButtonProps {
  orderData: PDFOrderData;
  label?: string;
  variant?: "primary" | "secondary";
}

export function PDFDownloadButton({
  orderData,
  label,
  variant = "primary",
}: PDFDownloadButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setGenerating(true);
      const doc = generateOrderSummaryPDF(orderData);
      const filename = `${orderData.orderNumber}-summary.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const defaultLabel =
    orderData.status === "PENDING_APPROVAL"
      ? "Download Provisional PDF Summary"
      : "Download Confirmed Order Summary";

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-xs font-semibold tracking-wider uppercase transition-all shadow-sm ${
        variant === "primary"
          ? "bg-[#B97968] hover:bg-[#A66757] text-white"
          : "bg-[#E9DCCB] hover:bg-[#D7C3AA] text-[#453C35] border border-[#D8CCBE]"
      }`}
    >
      {generating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>{label || defaultLabel}</span>
        </>
      )}
    </button>
  );
}

