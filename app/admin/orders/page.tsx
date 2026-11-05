import Link from "next/link";
import {
  Clock,
  Search,
  CheckCircle2,
  Package,
  Plus,
  ArrowRight,
} from "lucide-react";
import { getAdminOrders } from "@/lib/services/admin-orders";
import { formatINR } from "@/lib/utils/currency";
import { formatDateIST } from "@/lib/utils/format";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const params = await searchParams;
  const currentStatus = params.status || "all";
  const searchQuery = params.search || "";

  const orders = await getAdminOrders({
    status: currentStatus === "all" ? undefined : currentStatus,
    search: searchQuery,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Order Command Center
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Approve requests, adjust delivery fees, advance crafting status, and log manual sales.
          </p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#453C35] hover:bg-black text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Log Manual / WhatsApp Order</span>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <Link
              href="/admin/orders?status=all"
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                currentStatus === "all"
                  ? "bg-[#453C35] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Orders
            </Link>
            <Link
              href="/admin/orders?status=pending"
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                currentStatus === "pending"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              Needs Approval
            </Link>
            <Link
              href="/admin/orders?status=in-progress"
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                currentStatus === "in-progress"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-800 hover:bg-blue-100"
              }`}
            >
              In Progress
            </Link>
            <Link
              href="/admin/orders?status=completed"
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                currentStatus === "completed"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              Completed
            </Link>
            <Link
              href="/admin/orders?status=cancelled"
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                currentStatus === "cancelled"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Cancelled / Rejected
            </Link>
          </div>

          {/* Search Form */}
          <form className="relative sm:w-72">
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search by order #, name, phone..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center text-xs text-gray-500">
            No orders found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 uppercase text-[10px] tracking-wider text-gray-500 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Order Ref</th>
                  <th className="px-5 py-3.5">Customer & Contact</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Source</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-gray-900">
                      {order.order_number}
                      <span className="block text-[10px] font-normal text-gray-400 font-sans">
                        {formatDateIST(order.created_at)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-900 block">
                        {order.customer_name}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        +91 {order.customer_phone}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate text-gray-600">
                      {order.items.map((i) => `${i.quantity}x ${i.product_title_snapshot}`).join(", ")}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700">
                        {order.order_source.replace("MANUAL_", "")}
                      </span>
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
                            : order.status === "PREPARING"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          order.payment_status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#B97968] hover:underline"
                      >
                        <span>Manage</span>
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

