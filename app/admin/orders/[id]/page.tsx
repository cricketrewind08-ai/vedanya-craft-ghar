import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  MapPin,
  Clock,
  History,
  ShieldAlert,
} from "lucide-react";
import { getAdminOrderById } from "@/lib/services/admin-orders";
import { OrderDetailActions } from "@/components/admin/order-detail-actions";
import { PDFDownloadButton } from "@/components/storefront/pdf-download-button";
import { formatINR } from "@/lib/utils/currency";
import { formatDateIST, formatDateTimeIST } from "@/lib/utils/format";

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  const addr = order.shipping_address as any;
  const snapshot = order.business_snapshot as any;

  const pdfData = {
    orderNumber: order.order_number,
    createdAt: order.created_at,
    status: order.status,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerEmail: order.customer_email,
    shippingAddress: addr,
    orderNotes: order.order_notes,
    customerVisibleNote: order.customer_visible_note,
    items: order.items.map((i) => ({
      title: i.product_title_snapshot,
      variantLabel: i.variant_snapshot,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      lineTotal: i.line_total,
    })),
    subtotal: order.subtotal,
    shippingCharge: order.shipping_charge,
    adjustmentAmount: order.adjustment_amount,
    adjustmentReason: order.adjustment_reason,
    discountAmount: order.discount_amount,
    finalTotal: order.final_total,
    businessSnapshot: snapshot,
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              {order.order_number}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                order.status === "PENDING_APPROVAL"
                  ? "bg-amber-100 text-amber-800"
                  : order.status === "CONFIRMED"
                  ? "bg-blue-100 text-blue-800"
                  : order.status === "DELIVERED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Submitted on {formatDateIST(order.created_at)} · Source: {order.order_source}
          </p>
        </div>

        <div>
          <PDFDownloadButton
            orderData={pdfData}
            label="Download Order Summary PDF"
            variant="secondary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 cols: Customer & Order Items Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Shipping */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <User className="w-4 h-4 text-[#B97968]" />
              Customer & Delivery Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                  Customer Name
                </span>
                <span className="font-medium text-gray-900">{order.customer_name}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                  Contact Mobile
                </span>
                <span className="font-mono text-gray-900">+91 {order.customer_phone}</span>
              </div>

              {order.customer_email && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                    Email
                  </span>
                  <span className="text-gray-900">{order.customer_email}</span>
                </div>
              )}
            </div>

            <div className="pt-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                Shipping Address
              </span>
              <p className="text-gray-800 leading-relaxed mt-0.5">
                {addr?.houseBuilding}, {addr?.streetLocality}
                {addr?.landmark ? `, Near ${addr.landmark}` : ""}, {addr?.city},{" "}
                {addr?.district}, {addr?.state} - {addr?.pinCode}
              </p>
            </div>

            {order.order_notes && (
              <div className="p-3 bg-amber-50/70 rounded-lg text-xs text-amber-900">
                <strong>Customer Note:</strong> {order.order_notes}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-serif text-base font-bold text-gray-900">
                Order Items ({order.items.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 uppercase text-[10px] text-gray-400 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Item</th>
                    <th className="px-5 py-3 text-center">Qty</th>
                    <th className="px-5 py-3 text-right">Unit Price</th>
                    <th className="px-5 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-900 block">
                          {item.product_title_snapshot}
                        </span>
                        {item.variant_snapshot && (
                          <span className="text-[11px] text-gray-500">
                            {item.variant_snapshot}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center font-medium">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium">
                        {formatINR(item.unit_price)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-gray-900">
                        {formatINR(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="p-5 bg-gray-50/70 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span>{formatINR(order.shipping_charge)}</span>
              </div>
              {order.adjustment_amount !== 0 && (
                <div className="flex justify-between text-[#B97968]">
                  <span>Adjustment ({order.adjustment_reason || "Custom fee"})</span>
                  <span>{formatINR(order.adjustment_amount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                <span>Final Total Amount</span>
                <span className="text-[#B97968]">{formatINR(order.final_total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Order Actions & Audit History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Panel */}
          <OrderDetailActions order={order} />

          {/* Audit History Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-1.5">
              <History className="w-4 h-4 text-gray-500" />
              <span>Status Activity Timeline</span>
            </h3>

            <div className="space-y-3">
              {order.history.map((h, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200/60 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center font-medium text-gray-900">
                    <span>{h.new_status.replace(/_/g, " ")}</span>
                    <span className="text-[10px] text-gray-400">
                      {formatDateTimeIST(h.created_at)}
                    </span>
                  </div>
                  {h.note && (
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {h.note}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 italic">
                    Updated by: {h.changed_by}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

