"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Truck,
  IndianRupee,
  MessageCircle,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  approveOrderAction,
  rejectOrderAction,
  updateOrderStatusAction,
  updateOrderPaymentAction,
} from "@/app/actions/admin";
import type { OrderWithDetails } from "@/lib/services/admin-orders";
import type { OrderStatus, PaymentStatus } from "@/lib/types/database";

interface OrderDetailActionsProps {
  order: OrderWithDetails;
}

export function OrderDetailActions({ order }: OrderDetailActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Approval form state
  const [adjAmount, setAdjAmount] = useState<number>(order.adjustment_amount || 0);
  const [adjReason, setAdjReason] = useState<string>(order.adjustment_reason || "");
  const [ownerNote, setOwnerNote] = useState<string>(
    order.customer_visible_note || "UPI Payment Instructions: Send ₹... to UPI ID: ..."
  );

  // Reject form state
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    const res = await approveOrderAction(
      order.id,
      adjAmount,
      adjAmount !== 0 ? adjReason : undefined,
      ownerNote.trim() || undefined
    );
    if (!res.success) {
      setError(res.error || "Approval failed");
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await rejectOrderAction(order.id, rejectReason.trim());
    if (!res.success) {
      setError(res.error || "Rejection failed");
    } else {
      setShowRejectModal(false);
      router.refresh();
    }
    setLoading(false);
  };

  const handleAdvanceStatus = async (targetStatus: OrderStatus) => {
    setLoading(true);
    setError(null);
    const res = await updateOrderStatusAction(order.id, targetStatus);
    if (!res.success) {
      setError(res.error || "Status update failed");
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  const handlePaymentStatus = async (newStatus: PaymentStatus) => {
    setLoading(true);
    setError(null);
    const res = await updateOrderPaymentAction(order.id, newStatus);
    if (!res.success) {
      setError(res.error || "Payment status update failed");
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  const waCustomerMessage = encodeURIComponent(
    `Hello ${order.customer_name}! This is Vedanya Craft Ghar regarding your order ${order.order_number}.\n\nTotal: Rs. ${order.final_total}\n${order.customer_visible_note || ""}`
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STAGE 1 ACTION: Pending Approval Box */}
      {order.status === "PENDING_APPROVAL" && (
        <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 space-y-5">
          <div className="flex items-center gap-2 text-amber-800">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif text-base font-bold">
              Review & Approve Order Request
            </h3>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Approving this request will check and reserve stock for all tracked items. You can adjust the shipping fee or add custom craft charges with an explanation.
          </p>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Custom Adjustment (₹)
                </label>
                <input
                  type="number"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(Number(e.target.value))}
                  placeholder="e.g. 50 or -20"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Adjustment Reason (Required if adjusted)
                </label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Express courier charge"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Payment Instructions / Customer Note
              </label>
              <textarea
                rows={3}
                value={ownerNote}
                onChange={(e) => setOwnerNote(e.target.value)}
                placeholder="Share your UPI ID or bank transfer details here..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleApprove}
                className="w-full sm:flex-1 py-3 px-6 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? "Approving..." : "Approve & Reserve Stock"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="w-full sm:w-auto py-3 px-6 rounded-lg bg-white border border-red-300 hover:bg-red-50 text-red-700 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <XCircle className="w-4 h-4 inline mr-1.5" />
                <span>Reject Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Reject Order Request
            </h3>
            <p className="text-xs text-gray-500">
              Please enter a brief explanation for why this order cannot be fulfilled.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Yarn out of stock / Delivery location outside courier service area"
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={loading}
                className="px-5 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2 ACTION: Crafting, Dispatch & Payment Management */}
      {["CONFIRMED", "PREPARING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(order.status) && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <h3 className="font-serif text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center justify-between">
            <span>Order Fulfillment Controls</span>
            <span className="text-xs font-sans text-gray-500 font-normal">
              Current: <strong className="text-gray-900">{order.status.replace(/_/g, " ")}</strong>
            </span>
          </h3>

          {/* Status Stepper Progression Actions */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Advance Crafting & Shipping Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {order.status === "CONFIRMED" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAdvanceStatus("PREPARING")}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <span>Mark as "Preparing / Handcrafting"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {order.status === "PREPARING" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAdvanceStatus("READY_TO_SHIP")}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 flex items-center gap-1.5"
                >
                  <span>Mark as "Ready to Ship (Packed)"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {order.status === "READY_TO_SHIP" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAdvanceStatus("SHIPPED")}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Mark as "Dispatched / Shipped"</span>
                </button>
              )}

              {order.status === "SHIPPED" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAdvanceStatus("DELIVERED")}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as "Delivered to Customer"</span>
                </button>
              )}
            </div>
          </div>

          {/* Payment Toggle */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                Payment Verification
              </span>
              <p className="text-[11px] text-gray-500">
                Payment is arranged manually via UPI/Bank. Mark paid when verified.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loading || order.payment_status === "UNPAID"}
                onClick={() => handlePaymentStatus("UNPAID")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  order.payment_status === "UNPAID"
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                Unpaid
              </button>
              <button
                type="button"
                disabled={loading || order.payment_status === "PAID"}
                onClick={() => handlePaymentStatus("PAID")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  order.payment_status === "PAID"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-emerald-700 border-gray-300 hover:bg-emerald-50"
                }`}
              >
                Mark as Paid (₹ Received)
              </button>
            </div>
          </div>

          {/* Direct WhatsApp Customer Link */}
          <div className="pt-4 border-t border-gray-100">
            <a
              href={`https://wa.me/91${order.customer_phone}?text=${waCustomerMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20BE5C] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat with Customer on WhatsApp (+91 {order.customer_phone})</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

