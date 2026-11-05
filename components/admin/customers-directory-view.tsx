"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Download,
  MessageCircle,
  ShoppingBag,
  IndianRupee,
  Calendar,
} from "lucide-react";

export interface CustomerSummary {
  phone: string;
  name: string;
  email: string | null;
  city: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
}

interface CustomersDirectoryViewProps {
  customers: CustomerSummary[];
}

export function CustomersDirectoryView({ customers }: CustomersDirectoryViewProps) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  // Sanitized CSV Export to prevent Spreadsheet Formula Injection (=, +, -, @)
  const sanitizeCell = (text: string | null | undefined): string => {
    if (!text) return '""';
    let str = String(text);
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`; // Escape potential formula trigger
    }
    return `"${str.replace(/"/g, '""')}"`;
  };

  const exportCSV = () => {
    const headers = [
      "Customer Name",
      "Phone Number",
      "Email Address",
      "City",
      "Total Orders",
      "Total Realized Spend (INR)",
      "Last Order Date",
    ];

    const rows = filtered.map((c) => [
      sanitizeCell(c.name),
      sanitizeCell(c.phone),
      sanitizeCell(c.email || ""),
      sanitizeCell(c.city),
      sanitizeCell(c.totalOrders.toString()),
      sanitizeCell(c.totalSpend.toString()),
      sanitizeCell(new Date(c.lastOrderDate).toLocaleDateString("en-IN")),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `vedanya_customers_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const raw = phone.replace(/\D/g, "");
    const intl = raw.length === 10 ? `91${raw}` : raw;
    const msg = `Hello ${name}! Greeting from Vedanya Craft Ghar. Thank you for being a cherished customer of our handcrafted creations!`;
    return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Customer Directory</h1>
          <p className="text-sm text-gray-500">
            View repeat buyers, lifetime value, contact directly on WhatsApp, and export reports.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-[#B97968]" />
          Export CSV (Sanitized)
        </button>
      </div>

      {/* Search & Metrics bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
          />
        </div>

        <p className="text-xs text-gray-500">
          Total Customers: <span className="font-semibold text-gray-900">{filtered.length}</span>
        </p>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-medium text-gray-900">No customers found</h3>
            <p className="text-xs text-gray-500 mt-1">
              Customers who submit orders will automatically be cataloged here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F4EC] text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4 text-center">Orders Placed</th>
                  <th className="py-3 px-4 text-right">Lifetime Spend</th>
                  <th className="py-3 px-4">Last Order</th>
                  <th className="py-3 px-4 text-right">Connect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{c.name}</p>
                        {c.email && <p className="text-[11px] text-gray-400">{c.email}</p>}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-700">{c.phone}</td>

                    <td className="py-3 px-4 text-gray-600">{c.city}</td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                        {c.totalOrders} {c.totalOrders === 1 ? "order" : "orders"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      ₹{c.totalSpend.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-4 text-gray-500">
                      {new Date(c.lastOrderDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <a
                        href={getWhatsAppLink(c.phone, c.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
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

