import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  Search,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { getAdminClient } from "@/lib/supabase/admin";
import { PDFDownloadButton } from "@/components/storefront/pdf-download-button";
import { formatINR } from "@/lib/utils/currency";
import { formatDateIST } from "@/lib/utils/format";
import type { PDFOrderData } from "@/lib/pdf/order-summary-pdf";

interface OrderConfirmationPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
  searchParams: Promise<{
    key?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Order Request Received | Vedanya Craft Ghar",
  description: "Your handcrafted order request has been received by Vedanya Craft Ghar.",
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderConfirmationPageProps) {
  const { orderNumber } = await params;
  const { key: lookupKey } = await searchParams;

  const supabase = getAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .single();

  if (error || !order) {
    notFound();
  }

  // Security check: If lookup key is provided, verify match
  if (lookupKey && order.tracking_hash !== lookupKey) {
    notFound();
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  const snapshot = order.business_snapshot as any;
  const whatsappNumber = snapshot?.whatsapp_number;
  const items = (orderItems || []).map((i) => ({
    title: i.product_title_snapshot,
    variantLabel: i.variant_snapshot,
    quantity: i.quantity,
    unitPrice: i.unit_price,
    lineTotal: i.line_total,
  }));

  const pdfData: PDFOrderData = {
    orderNumber: order.order_number,
    createdAt: order.created_at,
    status: order.status,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerEmail: order.customer_email,
    shippingAddress: order.shipping_address as any,
    orderNotes: order.order_notes,
    customerVisibleNote: order.customer_visible_note,
    items,
    subtotal: order.subtotal,
    shippingCharge: order.shipping_charge,
    adjustmentAmount: order.adjustment_amount,
    adjustmentReason: order.adjustment_reason,
    discountAmount: order.discount_amount,
    finalTotal: order.final_total,
    businessSnapshot: snapshot,
  };

  // WhatsApp Pre-filled text
  const itemListSummary = items
    .map((i: any) => `${i.quantity}x ${i.title}${i.variantLabel ? ` (${i.variantLabel})` : ""}`)
    .join(", ");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vedanyacraftghar.com";
  const trackingUrl = `${siteUrl}/track-order`;
  const waMessage = encodeURIComponent(
    `Hello Vedanya Craft Ghar! I submitted an order request (${order.order_number}).\n\nItems: ${itemListSummary}\nEstimated Total: Rs. ${order.final_total}\n\nCould you please review and confirm feasibility? Thank you!`
  );

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StorefrontNavbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="bg-white/80 rounded-2xl border border-[#D8CCBE] shadow-warm p-8 sm:p-12 text-center space-y-6">
          {/* Header Icon */}
          <div className="w-16 h-16 rounded-full bg-[#A3AA8C]/20 text-[#A3AA8C] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-[#B97968] font-semibold">
              Stage 1 Completed
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#453C35] mt-1">
              Order Request Received!
            </h1>
            <p className="text-sm text-[#7D726A] mt-2">
              Thank you, {order.customer_name}! Your request has been sent directly to the artisan.
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-5 rounded-xl bg-[#F8F4EC] border border-[#D8CCBE] max-w-md mx-auto space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#7D726A]">Order Reference</span>
              <span className="font-mono font-bold text-sm text-[#453C35]">
                {order.order_number}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#7D726A]">Submission Date</span>
              <span className="font-medium text-[#453C35]">
                {formatDateIST(order.created_at)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#7D726A]">Estimated Amount</span>
              <span className="font-semibold text-[#453C35]">
                {formatINR(order.final_total)}
              </span>
            </div>
            <div className="pt-2 border-t border-[#D8CCBE]/60 flex justify-between items-center text-xs">
              <span className="text-[#7D726A]">Current Status</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-[#E9DCCB] text-[#453C35] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#B97968]" />
                Awaiting Owner Confirmation
              </span>
            </div>
          </div>

          {/* Actions: PDF Download & WhatsApp Share */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PDFDownloadButton
              orderData={pdfData}
              label="Download Provisional Order PDF"
              variant="secondary"
            />

            {whatsappNumber && (
              <a
                href={`https://wa.me/91${whatsappNumber}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#25D366] hover:bg-[#20BE5C] text-white text-xs font-semibold tracking-wider uppercase shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Send Order to Owner on WhatsApp</span>
              </a>
            )}
          </div>

          {/* Explainer Box */}
          <div className="p-5 rounded-xl bg-[#E9DCCB]/40 border border-[#D8CCBE] text-left text-xs space-y-2 text-[#453C35]">
            <p className="font-semibold flex items-center gap-1.5 text-[#B97968]">
              <ShieldCheck className="w-4 h-4" />
              What happens next?
            </p>
            <p className="text-[#7D726A] leading-relaxed">
              1. <strong>Verification:</strong> The artisan reviews your requested pieces, selected colors, and delivery location.
              <br />
              2. <strong>Payment Instructions:</strong> Once approved, the artisan will share official payment instructions (UPI / Bank transfer) and your order will move into preparation.
              <br />
              3. <strong>Tracking:</strong> You can track your order status anytime using your Order Number and Mobile Number.
            </p>
          </div>

          <div className="pt-4 border-t border-[#D8CCBE]/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7D726A]">
            <Link
              href="/track-order"
              className="inline-flex items-center gap-1.5 text-[#B97968] font-medium hover:underline"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track this order on our tracking portal</span>
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-[#453C35] font-medium hover:text-[#B97968]"
            >
              <span>Back to Storefront</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
