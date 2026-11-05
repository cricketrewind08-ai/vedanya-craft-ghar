"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, FolderTree, Loader2 } from "lucide-react";
import { saveCategoryAction, deleteCategoryAction } from "@/app/actions/admin";
import type { Category } from "@/lib/services/products";

interface CategoriesManagerViewProps {
  initialCategories: Category[];
}

export function CategoriesManagerView({ initialCategories }: CategoriesManagerViewProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [busy, setBusy] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isHidden, setIsHidden] = useState(false);

  const startEdit = (cat: Category) => {
    setIsAddingNew(false);
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setDisplayOrder(cat.display_order);
    setIsHidden(cat.is_hidden);
  };

  const startNew = () => {
    setEditingId(null);
    setIsAddingNew(true);
    setName("");
    setSlug("");
    setDescription("");
    setDisplayOrder(categories.length);
    setIsHidden(false);
  };

  const cancelForm = () => {
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (isAddingNew) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setBusy(true);
    const res = await saveCategoryAction({
      id: editingId || undefined,
      name,
      slug,
      description,
      displayOrder,
      isHidden,
    });
    setBusy(false);

    if (res.success) {
      if (editingId) {
        setCategories(
          categories.map((c) =>
            c.id === editingId
              ? {
                  ...c,
                  name,
                  slug,
                  description: description || null,
                  display_order: displayOrder,
                  is_hidden: isHidden,
                }
              : c
          )
        );
      } else {
        // Reload page or re-fetch
        window.location.reload();
      }
      cancelForm();
    } else {
      alert(res.error || "Failed to save category");
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete category "${catName}"? Any products assigned to it will become uncategorized.`
      )
    ) {
      return;
    }

    setBusy(true);
    const res = await deleteCategoryAction(id);
    setBusy(false);

    if (res.success) {
      setCategories(categories.filter((c) => c.id !== id));
    } else {
      alert(res.error || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Category Manager</h1>
          <p className="text-sm text-gray-500">
            Organize craft collections, storefront navigation tabs, and display order.
          </p>
        </div>

        {!isAddingNew && !editingId && (
          <button
            onClick={startNew}
            className="px-4 py-2 bg-[#B97968] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#a66858] transition shadow flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      {/* Editor Modal / Panel */}
      {(isAddingNew || editingId) && (
        <div className="bg-white p-5 rounded-2xl border border-[#B97968]/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-serif text-base font-bold text-gray-900">
              {isAddingNew ? "Add New Category" : "Edit Category"}
            </h3>
            <button
              onClick={cancelForm}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Crochet Plushies"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. crochet-plushies"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short bio for this craft category on the shop page"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
                <span className="text-[11px] text-gray-400 ml-2">Lower numbers appear first</span>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="isHiddenCat"
                  checked={isHidden}
                  onChange={(e) => setIsHidden(e.target.checked)}
                  className="rounded text-[#B97968] focus:ring-[#B97968] w-4 h-4"
                />
                <label htmlFor="isHiddenCat" className="text-xs text-gray-700">
                  Hide from public storefront menu
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 bg-[#B97968] text-white rounded-lg text-xs font-semibold hover:bg-[#a66858] transition flex items-center gap-1.5"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No categories created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F4EC] text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-mono text-gray-400">#{c.display_order}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {c.is_demo && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500">/{c.slug}</td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                      {c.description || "-"}
                    </td>
                    <td className="py-3 px-4">
                      {c.is_hidden ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 flex items-center gap-1 w-max">
                          <EyeOff className="w-3 h-3" /> Hidden
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 flex items-center gap-1 w-max">
                          <Eye className="w-3 h-3" /> Visible
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => startEdit(c)}
                          className="p-1.5 text-gray-600 hover:text-[#B97968] hover:bg-gray-100 rounded-lg transition"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

