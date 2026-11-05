import Link from "next/link";
import {
  Clock,
  Sparkles,
  ShoppingBag,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  Plus,
  CheckCircle2,
  Package,
} from "lucide-react";
import { getDashboardMetrics } from "@/lib/services/admin-analytics";
import { getAdminOrders } from "@/lib/services/admin-orders";
import { getAdminStoreSettings } from "@/lib/services/settings";
import { formatINR } from "@/lib/utils/currency";
import { formatDateIST } from "@/lib/utils/format";

export default async function AdminOverviewPage() {
  const [metrics, recentOrders, settings] = await Promise.all([
    getDashboardMetrics(),
    getAdminOrders({ limit: 6 }),
    getAdminStoreSettings(),
  ]);

  const hasMissingContact = !settings.whatsapp_number || !settings.phone;

  return (
    <div className="space-y-8">
      {/* Setup Checklist Banner (if store is unconfigured) */}
      {(!settings.is_setup_completed || hasMissingContact) && (
        <div className="p-5 rounded-2xl bg-[#E9DCCB]/60 border border-[#D8CCBE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-base font-semibold text-[#453C35] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#B97968]" />
              Finish Setting Up Your Artisan Store
            </h3>
            <p className="text-xs text-[#7D726A] max-w-xl">
              Complete your contact details, studio WhatsApp number, and delivery rates so customers can connect with you directly.
            </p>
          </div>
          <Link
            href="/admin/setup"
            className="px-5 py-2.5 bg-[#453C35] hover:bg-black text-white text-xs font-semibold rounded-lg shrink-0 shadow-sm transition-colors"
          >
            Open Setup Wizard
          </Link>
        </div>
      )}

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pending Approval */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 block mb-1">
              Needs Your Review
            </span>
            <span className="text-2xl font-bold text-gray-900 font-serif">
              {metrics.pendingOrdersCount}
            </span>
            <p className="text-[11px] text-gray-500 mt-1">Pending approval requests</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 block mb-1">
              In Crafting / Packing
            </span>
            <span className="text-2xl font-bold text-gray-900 font-serif">
              {metrics.inProgressOrdersCount}
            </span>
            <p className="text-[11px] text-gray-500 mt-1">Confirmed & preparing</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Real Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 block mb-1">
              Confirmed Revenue
            </span>
            <span className="text-2xl font-bold text-gray-900 font-serif">
              {formatINR(metrics.realRevenue)}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">From PAID & DELIVERED orders</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 block mb-1">
              Low Stock Items
            </span>
            <span className="text-2xl font-bold text-gray-900 font-serif">
              {metrics.lowStockCount}
            </span>
            <p className="text-[11px] text-gray-500 mt-1">≤ 3 items remaining</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#453C35] hover:bg-black text-white text-xs font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
        <Link
          href="/admin/orders?status=pending"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 hover:border-gray-400 text-gray-800 text-xs font-semibold transition-colors shadow-sm"
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Review Pending Orders ({metrics.pendingOrdersCount})</span>
        </Link>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 hover:border-gray-400 text-gray-800 text-xs font-semibold transition-colors shadow-sm"
        >
          <Package className="w-4 h-4 text-[#B97968]" />
          <span>Log Offline / WhatsApp Order</span>
        </Link>
      </div>

      {/* Recent Orders Command Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-base font-bold text-gray-900">
              Recent Order Requests
            </h2>
            <p className="text-xs text-gray-500">
              Orders requiring artisan confirmation, crafting, or shipment.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs text-[#B97968] font-semibold hover:underline"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No order requests received yet. Orders placed by customers will appear here instantly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 uppercase text-[10px] tracking-wider text-gray-500 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Order Ref</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-900 block">
                        {order.customer_name}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        +91 {order.customer_phone}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {formatDateIST(order.created_at)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {formatINR(order.final_total)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
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
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#B97968] hover:underline"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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

