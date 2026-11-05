"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Archive,
  ArchiveRestore,
  Edit,
  Trash2,
  ExternalLink,
  Package,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  toggleArchiveProductAction,
  purgeDemoDataAction,
  deleteProductAction,
} from "@/app/actions/admin";
import type { ProductWithDetails } from "@/lib/services/admin-products";

interface ProductsListViewProps {
  initialProducts: ProductWithDetails[];
}

export function ProductsListView({ initialProducts }: ProductsListViewProps) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "active" | "archived">("active");
  const [purging, setPurging] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    // Tab filter
    if (tab === "active" && p.is_archived) return false;
    if (tab === "archived" && !p.is_archived) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCat = p.category?.name.toLowerCase().includes(q);
      if (!matchTitle && !matchCat) return false;
    }
    return true;
  });

  const handleToggleArchive = async (id: string, currentArchived: boolean) => {
    setBusyId(id);
    const res = await toggleArchiveProductAction(id, !currentArchived);
    if (res.success) {
      setProducts(
        products.map((p) => (p.id === id ? { ...p, is_archived: !currentArchived } : p))
      );
    } else {
      alert("Failed to update status");
    }
    setBusyId(null);
  };

  const handlePurgeDemo = async () => {
    if (
      !confirm(
        "Are you sure you want to purge all demo products and categories? This cannot be undone and will delete demo data before you hand over to real store items."
      )
    ) {
      return;
    }

    setPurging(true);
    const res = await purgeDemoDataAction();
    setPurging(false);
    if (res.success) {
      setProducts(products.filter((p) => !p.is_demo));
      alert("Demo data successfully purged!");
    } else {
      alert(res.error || "Failed to purge demo data");
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setBusyId(id);
    const res = await deleteProductAction(id);
    setBusyId(null);

    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert(res.error || "Failed to delete product");
    }
  };

  const hasDemoProducts = products.some((p) => p.is_demo);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Products Catalog</h1>
          <p className="text-sm text-gray-500">
            Manage handmade craft catalog, stock levels, variants, and descriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasDemoProducts && (
            <button
              onClick={handlePurgeDemo}
              disabled={purging}
              className="px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition flex items-center gap-1.5"
            >
              {purging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Purge Demo Data
            </button>
          )}

          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-[#B97968] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#a66858] transition shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              tab === "active"
                ? "bg-[#453C35] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Active ({products.filter((p) => !p.is_archived).length})
          </button>
          <button
            onClick={() => setTab("archived")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              tab === "archived"
                ? "bg-[#453C35] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Archived ({products.filter((p) => p.is_archived).length})
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              tab === "all"
                ? "bg-[#453C35] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All ({products.length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search or tab filter, or click "Add New Product" to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F4EC] text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const primaryImg = p.images.find((i) => i.is_primary) || p.images[0];
                  const availableStock = p.stock_quantity - (p.reserved_quantity || 0);

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 relative overflow-hidden flex-shrink-0">
                            {primaryImg ? (
                              <Image
                                src={primaryImg.image_url}
                                alt={p.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-900">{p.title}</span>
                              {p.is_demo && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  DEMO
                                </span>
                              )}
                              {p.is_featured && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                  FEATURED
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400">/{p.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        {p.category?.name || <span className="italic text-gray-400">Uncategorized</span>}
                      </td>

                      <td className="py-3 px-4 font-semibold text-gray-900">
                        ₹{p.base_price.toLocaleString("en-IN")}
                        {p.compare_at_price && (
                          <span className="text-[10px] text-gray-400 line-through ml-1.5">
                            ₹{p.compare_at_price}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-medium ${
                              availableStock <= 3 ? "text-amber-600 font-bold" : "text-gray-900"
                            }`}
                          >
                            {availableStock} avail
                          </span>
                          {p.reserved_quantity > 0 && (
                            <span className="text-[10px] text-gray-400">
                              ({p.reserved_quantity} locked)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                          {p.availability_mode.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {p.is_archived ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-600">
                            Archived
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            title="View on Live Storefront"
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            title="Edit Product"
                            className="p-1.5 text-gray-600 hover:text-[#B97968] hover:bg-gray-100 rounded-lg transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleToggleArchive(p.id, p.is_archived)}
                            disabled={busyId === p.id}
                            title={p.is_archived ? "Restore to active" : "Archive product"}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                          >
                            {p.is_archived ? (
                              <ArchiveRestore className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.title)}
                            disabled={busyId === p.id}
                            title="Delete product permanently"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          >
                            {busyId === p.id ? (
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
        )}
      </div>
    </div>
  );
}

