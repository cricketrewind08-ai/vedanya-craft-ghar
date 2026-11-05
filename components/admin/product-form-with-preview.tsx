"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Eye, Save, ArrowLeft, Tag, Layers, Clock } from "lucide-react";
import { saveProductAction } from "@/app/actions/admin";
import type { Category } from "@/lib/services/products";
import type { AvailabilityMode } from "@/lib/types/database";
import { formatINR } from "@/lib/utils/currency";

interface ProductFormWithPreviewProps {
  categories: Category[];
  initialData?: any;
}

export function ProductFormWithPreview({
  categories,
  initialData,
}: ProductFormWithPreviewProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.category_id || (categories[0]?.id || "")
  );
  const [basePrice, setBasePrice] = useState<number>(initialData?.base_price || 499);
  const [compareAtPrice, setCompareAtPrice] = useState<number | "">(
    initialData?.compare_at_price || ""
  );
  const [availabilityMode, setAvailabilityMode] = useState<AvailabilityMode>(
    initialData?.availability_mode || "READY_TO_SHIP"
  );
  const [preparationDays, setPreparationDays] = useState<number>(
    initialData?.preparation_days ?? 2
  );
  const [stockQuantity, setStockQuantity] = useState<number>(
    initialData?.stock_quantity ?? 5
  );
  const [trackInventory, setTrackInventory] = useState<boolean>(
    initialData?.track_inventory ?? true
  );
  const [material, setMaterial] = useState(initialData?.material || "");
  const [dimensions, setDimensions] = useState(initialData?.dimensions || "");
  const [isFeatured, setIsFeatured] = useState<boolean>(
    initialData?.is_featured ?? false
  );
  const [description, setDescription] = useState(initialData?.description || "");

  // Images state
  const [images, setImages] = useState<Array<{ imageUrl: string; isPrimary: boolean }>>(
    initialData?.images?.map((i: any) => ({
      imageUrl: i.image_url,
      isPrimary: i.is_primary,
    })) || [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
        isPrimary: true,
      },
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  // Variants state
  const [variants, setVariants] = useState<
    Array<{ optionName: string; optionValue: string; priceModifier: number; stockQuantity: number }>
  >(
    initialData?.variants?.map((v: any) => ({
      optionName: v.option_name,
      optionValue: v.option_value,
      priceModifier: Number(v.price_modifier) || 0,
      stockQuantity: v.stock_quantity || 0,
    })) || []
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialData) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, { imageUrl: newImageUrl.trim(), isPrimary: images.length === 0 }]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    if (updated.length > 0 && !updated.some((i) => i.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  const setPrimaryImage = (index: number) => {
    setImages(images.map((img, idx) => ({ ...img, isPrimary: idx === index })));
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        optionName: "Color",
        optionValue: "Pastel Pink",
        priceModifier: 0,
        stockQuantity: 3,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setServerError(null);

    if (images.length === 0) {
      setServerError("Please add at least one product photo URL.");
      setSaving(false);
      return;
    }

    const payload = {
      id: initialData?.id,
      categoryId: categoryId || null,
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      basePrice,
      compareAtPrice: compareAtPrice === "" ? null : Number(compareAtPrice),
      availabilityMode,
      preparationDays,
      stockQuantity,
      trackInventory,
      material: material.trim() || undefined,
      dimensions: dimensions.trim() || undefined,
      isFeatured,
      images: images.map((img, idx) => ({
        imageUrl: img.imageUrl,
        displayOrder: idx,
        isPrimary: img.isPrimary,
      })),
      variants,
    };

    const res = await saveProductAction(payload);
    if (!res.success) {
      setServerError(res.error || "Failed to save product.");
      setSaving(false);
      return;
    }

    router.push("/admin/products");
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const primaryImgUrl = images.find((i) => i.isPrimary)?.imageUrl || images[0]?.imageUrl || "";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 cols: Form Inputs */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
            <h2 className="font-serif text-lg font-bold text-gray-900">
              {initialData ? "Edit Artisan Creation" : "Add New Artisan Creation"}
            </h2>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Products</span>
            </button>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Handcrafted Daisy Crochet Tote Bag"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 font-mono focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Base Price (₹ INR) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Compare-at Price (₹ Optional Discount)
                </label>
                <input
                  type="number"
                  min={0}
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 799"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>
            </div>

            {/* Availability Mode & Days */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Availability Mode
                </label>
                <select
                  value={availabilityMode}
                  onChange={(e) => setAvailabilityMode(e.target.value as AvailabilityMode)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                >
                  <option value="READY_TO_SHIP">Ready to Ship</option>
                  <option value="MADE_TO_ORDER">Made to Order</option>
                  <option value="PRE_ORDER">Pre-Order</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="HIDDEN">Hidden (Draft)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Preparation Days
                </label>
                <input
                  type="number"
                  min={0}
                  value={preparationDays}
                  onChange={(e) => setPreparationDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Current Stock
                </label>
                <input
                  type="number"
                  min={0}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Product Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Carefully describe the handcrafting, texture, weave, and care instructions..."
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            {/* Material & Dimensions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Material
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g. 100% Organic Cotton Yarn"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Dimensions / Sizing
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 14\" x 15\" with 10\" strap"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>
            </div>

            {/* Photo URLs */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Product Photos
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black"
                >
                  Add Image
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-lg overflow-hidden border-2 aspect-square group ${
                      img.isPrimary ? "border-[#B97968]" : "border-gray-200"
                    }`}
                  >
                    <Image src={img.imageUrl} alt="Thumbnail" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          className="px-2 py-1 bg-white text-[10px] font-semibold rounded text-gray-900"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1 bg-red-600 text-white rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {img.isPrimary && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#B97968] text-white">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product Variants (Colors, Sizes, Bundles)
                </label>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1 text-xs text-[#B97968] font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Variant</span>
                </button>
              </div>

              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 items-center text-xs"
                >
                  <div>
                    <label className="text-[10px] text-gray-500">Option Type</label>
                    <input
                      type="text"
                      value={v.optionName}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].optionName = e.target.value;
                        setVariants(copy);
                      }}
                      className="w-full px-2 py-1 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Option Value</label>
                    <input
                      type="text"
                      value={v.optionValue}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].optionValue = e.target.value;
                        setVariants(copy);
                      }}
                      className="w-full px-2 py-1 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Price Delta (₹)</label>
                    <input
                      type="number"
                      value={v.priceModifier}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].priceModifier = Number(e.target.value);
                        setVariants(copy);
                      }}
                      className="w-full px-2 py-1 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Stock Qty</label>
                    <input
                      type="number"
                      min={0}
                      value={v.stockQuantity}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].stockQuantity = Number(e.target.value);
                        setVariants(copy);
                      }}
                      className="w-full px-2 py-1 border rounded bg-white"
                    />
                  </div>
                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-gray-300 text-[#B97968] focus:ring-[#B97968]"
              />
              <label htmlFor="isFeatured" className="text-xs font-medium text-gray-700 cursor-pointer">
                Feature on storefront homepage
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#453C35] hover:bg-black text-white text-xs font-semibold tracking-wider uppercase rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Publishing..." : "Save & Publish"}</span>
            </button>
          </div>
        </div>

        {/* Right 4 cols: LIVE STOREFRONT CARD PREVIEW */}
        <div className="lg:col-span-4 sticky top-24 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-[#B97968]" />
            <span>Live Storefront Preview</span>
          </div>
          <p className="text-[11px] text-gray-500">
            This is exactly how your customer will see this item on the boutique:
          </p>

          <div className="rounded-xl overflow-hidden bg-white border border-[#D8CCBE] shadow-warm p-0">
            <div className="relative aspect-square w-full bg-[#E9DCCB]/40">
              {primaryImgUrl ? (
                <Image src={primaryImgUrl} alt={title || "Preview"} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  No image added
                </div>
              )}
              <div className="absolute top-2.5 left-2.5">
                {availabilityMode === "READY_TO_SHIP" && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#A3AA8C] text-white">
                    Ready to Ship
                  </span>
                )}
                {availabilityMode === "MADE_TO_ORDER" && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#E9DCCB] text-[#453C35] border border-[#D8CCBE]">
                    Made to Order
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-[#7D726A] font-semibold">
                {selectedCategory?.name || "Category"}
              </p>
              <h3 className="font-serif text-sm font-semibold text-[#453C35] line-clamp-1">
                {title || "Handcrafted Product Title"}
              </h3>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-base font-semibold text-[#453C35]">
                  {formatINR(basePrice)}
                </span>
                {compareAtPrice && Number(compareAtPrice) > basePrice && (
                  <span className="text-xs text-[#7D726A] line-through">
                    {formatINR(Number(compareAtPrice))}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#7D726A]">
                Prep time: {preparationDays} business days
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

