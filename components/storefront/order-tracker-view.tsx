"use client";

import { useState } from "react";
import {
  Search,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Sparkles,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { trackOrderAction, type TrackOrderResult } from "@/app/actions/track-order";
import { formatINR } from "@/lib/utils/currency";
import { formatDateIST, formatDateTimeIST } from "@/lib/utils/format";
import { PDFDownloadButton } from "@/components/storefront/pdf-download-button";

const ORDER_STEPS = [
  { key: "PENDING_APPROVAL", label: "Request Received", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PREPARING", label: "Handcrafting", icon: Sparkles },
  { key: "READY_TO_SHIP", label: "Packed", icon: Package },
  { key: "SHIPPED", label: "Dispatched", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

export function OrderTrackerView() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackOrderResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await trackOrderAction(orderNumber.trim(), phone.trim());
    setResult(res);
    setLoading(false);
  };

  const order = result?.order;

  // Calculate current active step index
  const stepIndex = order
    ? ORDER_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  const isTerminalNegative =
    order && ["REJECTED", "CANCELLED"].includes(order.status);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Lookup Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 p-6 sm:p-8 rounded-2xl border border-[#D8CCBE] shadow-warm space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
              Order Reference Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. VCG-2026-1001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs font-mono text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
              10-Digit Mobile Number *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-[#7D726A] font-medium">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-12 pr-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !orderNumber || phone.length !== 10}
          className="w-full py-3 px-6 rounded-md bg-[#B97968] hover:bg-[#A66757] text-white text-xs font-semibold tracking-wider uppercase shadow-warm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? "Searching..." : "Track Handcrafted Order"}</span>
        </button>
      </form>

      {/* Error Message */}
      {result && !result.success && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
          {result.error}
        </div>
      )}

      {/* Order Status Display */}
      {order && (
        <div className="bg-white/80 rounded-2xl border border-[#D8CCBE] shadow-warm p-6 sm:p-10 space-y-8 animate-fadeIn">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8CCBE]">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#7D726A] block">
                Order Tracking
              </span>
              <h2 className="font-serif text-2xl font-semibold text-[#453C35]">
                {order.orderNumber}
              </h2>
              <p className="text-xs text-[#7D726A] mt-0.5">
                Placed on {formatDateIST(order.createdAt)} · Contact: +91 {order.maskedPhone}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Payment Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  order.paymentStatus === "PAID"
                    ? "bg-[#A3AA8C]/30 text-[#453C35] border border-[#A3AA8C]"
                    : "bg-[#E9DCCB] text-[#7D726A]"
                }`}
              >
                Payment: {order.paymentStatus}
              </span>

              {/* Status Badge */}
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#B97968] text-white">
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Stepper Timeline (if not rejected/cancelled) */}
          {!isTerminalNegative ? (
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {ORDER_STEPS.map((step, idx) => {
                  const isCurrent = step.key === order.status;
                  const isPassed = stepIndex >= idx;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                        isCurrent
                          ? "bg-[#B97968]/15 border-[#B97968] text-[#B97968] shadow-sm"
                          : isPassed
                          ? "bg-[#A3AA8C]/15 border-[#A3AA8C]/40 text-[#453C35]"
                          : "bg-white/50 border-[#D8CCBE] text-[#7D726A] opacity-60"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          isPassed
                            ? "bg-[#B97968] text-white"
                            : "bg-[#E9DCCB] text-[#7D726A]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-semibold">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold uppercase tracking-wider">
                  Order {order.status}
                </p>
                <p className="mt-0.5">
                  {order.customerVisibleNote ||
                    "This order request could not be fulfilled by the artisan."}
                </p>
              </div>
            </div>
          )}

          {/* Owner Note / Payment Instructions */}
          {order.customerVisibleNote && !isTerminalNegative && (
            <div className="p-4 rounded-xl bg-[#E9DCCB]/50 border border-[#D8CCBE] space-y-1.5 text-xs text-[#453C35]">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#B97968] block">
                Artisan Instructions & Payment Info
              </span>
              <p className="leading-relaxed whitespace-pre-line">
                {order.customerVisibleNote}
              </p>
            </div>
          )}

          {/* Items & Financial Breakdown */}
          <div className="space-y-3 pt-2">
            <h3 className="font-serif text-base font-semibold text-[#453C35]">
              Requested Items
            </h3>
            <div className="divide-y divide-[#D8CCBE]/70 border border-[#D8CCBE] rounded-xl overflow-hidden bg-white/50">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-medium text-[#453C35]">
                      {item.title}
                    </span>
                    {item.variantLabel && (
                      <span className="text-[11px] text-[#7D726A] block">
                        {item.variantLabel}
                      </span>
                    )}
                    <span className="text-[11px] text-[#7D726A]">
                      Qty: {item.quantity} × {formatINR(item.unitPrice)}
                    </span>
                  </div>
                  <span className="font-semibold text-[#453C35]">
                    {formatINR(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#F8F4EC] rounded-xl border border-[#D8CCBE] space-y-1 text-xs">
              <div className="flex justify-between text-[#7D726A]">
                <span>Items Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#7D726A]">
                <span>Shipping Fee</span>
                <span>{formatINR(order.shippingCharge)}</span>
              </div>
              {order.adjustmentAmount !== 0 && (
                <div className="flex justify-between text-[#B97968]">
                  <span>Adjustment ({order.adjustmentReason || "Custom"})</span>
                  <span>{formatINR(order.adjustmentAmount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#D8CCBE]/60 flex justify-between font-semibold text-sm text-[#453C35]">
                <span>Total Amount</span>
                <span className="text-[#B97968]">{formatINR(order.finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Timeline History */}
          {order.history && order.history.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#D8CCBE]">
              <h3 className="font-serif text-base font-semibold text-[#453C35]">
                Order Activity Log
              </h3>
              <div className="space-y-2">
                {order.history.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#F8F4EC] border border-[#D8CCBE]/60 text-xs flex justify-between items-start"
                  >
                    <div>
                      <span className="font-semibold text-[#453C35]">
                        {h.status.replace(/_/g, " ")}
                      </span>
                      {h.note && (
                        <p className="text-[11px] text-[#7D726A] mt-0.5">
                          {h.note}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-[#7D726A]">
                      {formatDateTimeIST(h.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-[#D8CCBE] flex flex-col sm:flex-row items-center justify-between gap-4">
            <PDFDownloadButton
              orderData={{
                orderNumber: order.orderNumber,
                createdAt: order.createdAt,
                status: order.status,
                customerName: order.customerName,
                customerPhone: order.maskedPhone,
                shippingAddress: order.shippingAddress as any,
                items: order.items,
                subtotal: order.subtotal,
                shippingCharge: order.shippingCharge,
                adjustmentAmount: order.adjustmentAmount,
                adjustmentReason: order.adjustmentReason,
                finalTotal: order.finalTotal,
                customerVisibleNote: order.customerVisibleNote,
                businessSnapshot: order.businessSnapshot,
              }}
              variant="secondary"
            />

            {order.businessSnapshot?.whatsapp_number && (
              <a
                href={`https://wa.me/91${order.businessSnapshot.whatsapp_number}?text=Hello%20Vedanya%20Craft%20Ghar!%20I%20have%20a%20question%20about%20order%20${order.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#25D366] font-semibold hover:underline"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Need help? Message studio on WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

