"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MessageSquareQuote,
  MessageCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";
import { updateCustomOrderAction, convertCustomOrderToOrderAction } from "@/app/actions/admin";
import type { Database, CustomOrderStatus } from "@/lib/types/database";

type CustomRequest = Database["public"]["Tables"]["custom_order_requests"]["Row"];

interface CustomEnquiriesViewProps {
  initialRequests: CustomRequest[];
  storePhone?: string | null;
}

export function CustomEnquiriesView({
  initialRequests,
  storePhone,
}: CustomEnquiriesViewProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedReq, setSelectedReq] = useState<CustomRequest | null>(null);
  const [quotedAmount, setQuotedAmount] = useState<number>(0);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("active");

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "active") return ["NEW", "QUOTED"].includes(r.status);
    if (activeTab === "completed") return ["ACCEPTED", "DECLINED"].includes(r.status);
    return true;
  });

  const openQuoteModal = (r: CustomRequest) => {
    setSelectedReq(r);
    setQuotedAmount(r.quoted_amount || 0);
    setOwnerNotes(r.owner_notes || "");
  };

  const handleUpdateQuote = async (newStatus: CustomOrderStatus) => {
    if (!selectedReq) return;
    setBusy(true);

    const res = await updateCustomOrderAction({
      id: selectedReq.id,
      status: newStatus,
      quotedAmount: quotedAmount || null,
      ownerNotes: ownerNotes || null,
    });
    setBusy(false);

    if (res.success) {
      setRequests(
        requests.map((r) =>
          r.id === selectedReq.id
            ? {
                ...r,
                status: newStatus,
                quoted_amount: quotedAmount || null,
                owner_notes: ownerNotes || null,
              }
            : r
        )
      );
      setSelectedReq(null);
    } else {
      alert(res.error || "Failed to update custom order");
    }
  };

  const handleConvertToOrder = async () => {
    if (!selectedReq) return;
    if (!quotedAmount || quotedAmount <= 0) {
      alert("Please provide a valid quoted amount before converting to an order.");
      return;
    }

    if (
      !confirm(
        `Convert request ${selectedReq.request_number} into a confirmed order for ₹${quotedAmount}?`
      )
    ) {
      return;
    }

    setBusy(true);
    const res = await convertCustomOrderToOrderAction({
      requestId: selectedReq.id,
      quotedAmount,
    });
    setBusy(false);

    if (res.success) {
      alert(`Successfully converted to Order ${res.orderNumber}!`);
      window.location.reload();
    } else {
      alert(res.error || "Failed to convert to order");
    }
  };

  const getWhatsAppQuoteLink = (r: CustomRequest) => {
    const rawPhone = r.customer_phone.replace(/\D/g, "");
    const intlPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const quoteTxt = r.quoted_amount ? ` ₹${r.quoted_amount}` : "";
    const msg = `Hello ${r.customer_name}! Thank you for your custom craft enquiry (${r.request_number}) with Vedanya Craft Ghar. Regarding your request "${r.description.substring(0, 60)}...", we can handcraft this for you${quoteTxt ? ` for approx ${quoteTxt}` : ""}. Let's finalize the details!`;
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Custom Enquiries</h1>
          <p className="text-sm text-gray-500">
            Review custom handmade craft requests, share quotes on WhatsApp, and convert to orders.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "active" ? "bg-[#453C35] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Active Enquiries ({requests.filter((r) => ["NEW", "QUOTED"].includes(r.status)).length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "completed"
                ? "bg-[#453C35] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Completed ({requests.filter((r) => ["ACCEPTED", "DECLINED"].includes(r.status)).length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "all" ? "bg-[#453C35] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All ({requests.length})
          </button>
        </div>
      </div>

      {/* Quote / Action Modal */}
      {selectedReq && (
        <div className="bg-white p-5 rounded-2xl border border-[#B97968]/40 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-serif text-base font-bold text-gray-900">
                Manage Request: {selectedReq.request_number}
              </h3>
              <p className="text-xs text-gray-500">
                Customer: {selectedReq.customer_name} ({selectedReq.customer_phone})
              </p>
            </div>
            <button
              onClick={() => setSelectedReq(null)}
              className="text-gray-400 hover:text-gray-600 font-semibold"
            >
              ✕
            </button>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 text-xs">
            <p className="font-semibold text-gray-800">Description:</p>
            <p className="text-gray-600 whitespace-pre-wrap">{selectedReq.description}</p>
            {selectedReq.preferred_colors && (
              <p className="text-gray-500 pt-1">
                <span className="font-medium text-gray-700">Preferred Colors:</span>{" "}
                {selectedReq.preferred_colors}
              </p>
            )}
            {selectedReq.target_date && (
              <p className="text-gray-500">
                <span className="font-medium text-gray-700">Needed By:</span>{" "}
                {selectedReq.target_date}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Estimate / Quoted Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={quotedAmount}
                onChange={(e) => setQuotedAmount(Number(e.target.value))}
                placeholder="e.g. 1200"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Internal Teacher Notes
              </label>
              <input
                type="text"
                value={ownerNotes}
                onChange={(e) => setOwnerNotes(e.target.value)}
                placeholder="e.g. Sent palette photos on WhatsApp"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <a
                href={getWhatsAppQuoteLink(selectedReq)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Send Quote on WhatsApp
              </a>

              <button
                type="button"
                onClick={handleConvertToOrder}
                disabled={busy}
                className="px-3.5 py-2 bg-[#B97968] text-white rounded-lg text-xs font-semibold hover:bg-[#a66858] transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Convert to Confirmed Order
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleUpdateQuote("DECLINED")}
                disabled={busy}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
              >
                Decline Request
              </button>
              <button
                type="button"
                onClick={() => handleUpdateQuote("QUOTED")}
                disabled={busy}
                className="px-4 py-1.5 bg-[#453C35] text-white rounded-lg text-xs font-semibold hover:bg-black transition"
              >
                Save as Quoted
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquareQuote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-medium text-gray-900">No custom enquiries</h3>
            <p className="text-xs text-gray-500 mt-1">
              Custom order requests submitted by customers on the storefront will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F4EC] text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Quantity / Date</th>
                  <th className="py-3 px-4">Quote</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-gray-900">
                      {r.request_number}
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{r.customer_name}</p>
                        <p className="text-gray-400 text-[11px]">{r.customer_phone}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-gray-800 line-clamp-2">{r.description}</p>
                      {r.preferred_colors && (
                        <span className="text-[10px] text-gray-400">
                          Palette: {r.preferred_colors}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{r.quantity} pcs</p>
                      {r.target_date && (
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {r.target_date}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {r.quoted_amount ? (
                        `₹${r.quoted_amount.toLocaleString("en-IN")}`
                      ) : (
                        <span className="text-gray-400 font-normal italic">Not quoted</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.status === "NEW"
                            ? "bg-blue-100 text-blue-700"
                            : r.status === "QUOTED"
                            ? "bg-purple-100 text-purple-700"
                            : r.status === "ACCEPTED"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={getWhatsAppQuoteLink(r)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Chat with Customer on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => openQuoteModal(r)}
                          className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-[#B97968] hover:text-white rounded-lg text-gray-700 transition"
                        >
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

