"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Boxes,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
  History,
  Loader2,
  PackageCheck,
  Search,
  Trash2,
} from "lucide-react";
import { updateInventoryAction, deleteInventoryItemAction } from "@/app/actions/admin";
import type { ProductWithDetails } from "@/lib/services/admin-products";
import type { Database } from "@/lib/types/database";

type InventoryAdjustment = Database["public"]["Tables"]["inventory_adjustments"]["Row"];

interface InventoryMatrixViewProps {
  products: ProductWithDetails[];
  adjustments: InventoryAdjustment[];
}

export function InventoryMatrixView({ products, adjustments }: InventoryMatrixViewProps) {
  const [productList, setProductList] = useState(products);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<{
    productId: string;
    variantId?: string | null;
    title: string;
    currentStock: number;
    reserved: number;
  } | null>(null);

  const [newStock, setNewStock] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Flatten products and variants into inventory rows
  const inventoryRows: Array<{
    productId: string;
    variantId?: string | null;
    title: string;
    imageUrl?: string;
    category?: string;
    stock: number;
    reserved: number;
    available: number;
    isVariant: boolean;
  }> = [];

  for (const p of productList) {
    const primaryImg = p.images.find((i) => i.is_primary)?.image_url || p.images[0]?.image_url;

    if (p.variants.length > 0) {
      for (const v of p.variants) {
        inventoryRows.push({
          productId: p.id,
          variantId: v.id,
          title: `${p.title} (${v.option_name}: ${v.option_value})`,
          imageUrl: primaryImg,
          category: p.category?.name,
          stock: v.stock_quantity,
          reserved: 0, // reserved is tracked on main product level in simplified schema
          available: v.stock_quantity,
          isVariant: true,
        });
      }
    } else {
      const avail = p.stock_quantity - (p.reserved_quantity || 0);
      inventoryRows.push({
        productId: p.id,
        variantId: null,
        title: p.title,
        imageUrl: primaryImg,
        category: p.category?.name,
        stock: p.stock_quantity,
        reserved: p.reserved_quantity || 0,
        available: avail,
        isVariant: false,
      });
    }
  }

  const filteredRows = inventoryRows.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const openAdjuster = (row: typeof inventoryRows[0]) => {
    setSelectedItem({
      productId: row.productId,
      variantId: row.variantId,
      title: row.title,
      currentStock: row.stock,
      reserved: row.reserved,
    });
    setNewStock(row.stock);
    setReason("Physical stock recount / Restock");
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setBusy(true);
    const res = await updateInventoryAction({
      productId: selectedItem.productId,
      variantId: selectedItem.variantId,
      newStock,
      reason,
    });
    setBusy(false);

    if (res.success) {
      alert("Inventory successfully updated!");
      setSelectedItem(null);
      window.location.reload();
    } else {
      alert(res.error || "Failed to update inventory");
    }
  };

  const handleDeleteItem = async (row: (typeof inventoryRows)[0]) => {
    const itemKey = row.variantId || row.productId;
    if (
      !confirm(
        `Are you sure you want to permanently delete "${row.title}" from inventory? This will remove it from the product catalog.`
      )
    ) {
      return;
    }

    setDeletingKey(itemKey);
    const res = await deleteInventoryItemAction({
      productId: row.productId,
      variantId: row.variantId,
    });
    setDeletingKey(null);

    if (res.success) {
      if (row.variantId) {
        setProductList((prev) =>
          prev.map((p) =>
            p.id === row.productId
              ? { ...p, variants: p.variants.filter((v) => v.id !== row.variantId) }
              : p
          )
        );
      } else {
        setProductList((prev) => prev.filter((p) => p.id !== row.productId));
      }
    } else {
      alert(res.error || "Failed to delete inventory item");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Inventory Matrix</h1>
          <p className="text-sm text-gray-500">
            Monitor real-time physical stock, reserved items locked by active orders, and audit history.
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <History className="w-4 h-4 text-gray-500" />
          {showHistory ? "Hide Audit History" : "View Adjustment Audit Log"}
        </button>
      </div>

      {/* Adjuster Modal */}
      {selectedItem && (
        <div className="bg-white p-5 rounded-2xl border border-[#B97968]/40 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-serif text-base font-bold text-gray-900">
                Adjust Stock: {selectedItem.title}
              </h3>
              <p className="text-xs text-gray-400">
                Current Stock: {selectedItem.currentStock} units ({selectedItem.reserved} currently locked in orders)
              </p>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Total Stock Count *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Adjustment *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Handmade 5 more pieces / Restock"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 bg-[#B97968] text-white rounded-lg text-xs font-semibold hover:bg-[#a66858] transition flex items-center gap-1.5"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Confirm Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Audit Log Panel */}
      {showHistory && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <History className="w-4 h-4 text-[#B97968]" />
            <h3 className="font-serif text-sm font-bold text-gray-900">
              Recent Inventory Audit Trail
            </h3>
          </div>

          {adjustments.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 text-center italic">No adjustments recorded yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 text-xs">
              {adjustments.slice(0, 10).map((adj) => (
                <div key={adj.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800">{adj.reason}</span>
                    <span className="text-[10px] text-gray-400 ml-2">
                      {new Date(adj.created_at).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{adj.previous_stock}</span>
                    <span>→</span>
                    <span className="font-semibold text-gray-900">{adj.new_stock} units</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search items or variants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
          />
        </div>
        <p className="text-xs text-gray-400 hidden sm:block">
          Showing {filteredRows.length} inventory items
        </p>
      </div>

      {/* Inventory Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F4EC] text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Product / Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Total Physical</th>
                <th className="py-3 px-4 text-center">Locked / Reserved</th>
                <th className="py-3 px-4 text-center">Available to Sell</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((r, idx) => {
                const isOutOfStock = r.available <= 0;
                const isLowStock = r.available > 0 && r.available <= 3;
                const itemKey = r.variantId || r.productId;

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {r.imageUrl && (
                          <div className="w-8 h-8 rounded bg-gray-100 relative overflow-hidden flex-shrink-0">
                            <Image src={r.imageUrl} alt={r.title} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{r.title}</p>
                          {r.isVariant && (
                            <span className="text-[10px] text-gray-400">Variant stock</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-gray-500">{r.category || "-"}</td>

                    <td className="py-3 px-4 text-center font-mono font-medium text-gray-900">
                      {r.stock}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-gray-500">
                      {r.reserved > 0 ? (
                        <span className="text-amber-600 font-semibold">{r.reserved}</span>
                      ) : (
                        "0"
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-gray-900">
                      {r.available}
                    </td>

                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" /> Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" /> Low Stock ({r.available})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 flex items-center gap-1 w-max">
                          <CheckCircle className="w-3 h-3" /> In Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openAdjuster(r)}
                          className="px-2.5 py-1 text-xs border border-gray-200 hover:border-[#B97968] rounded-lg text-gray-700 hover:text-[#B97968] transition"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => handleDeleteItem(r)}
                          disabled={deletingKey === itemKey}
                          title="Delete from inventory"
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          {deletingKey === itemKey ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

