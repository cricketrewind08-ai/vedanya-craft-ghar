"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Sparkles, ArrowRight, Check } from "lucide-react";
import type { ProductWithDetails, ProductVariant } from "@/lib/services/products";
import { useCartStore } from "@/lib/store/cart";
import { formatINR } from "@/lib/utils/currency";

interface QuickBuyModalProps {
  product: ProductWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickBuyModal({ product, isOpen, onClose }: QuickBuyModalProps) {
  const router = useRouter();
  const setQuickItem = useCartStore((state) => state.setQuickItem);

  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    hasVariants ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState<number>(1);

  if (!isOpen) return null;

  const primaryImage =
    product.images.find((img) => img.is_primary)?.image_url ||
    product.images[0]?.image_url ||
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80";

  const currentPrice =
    product.base_price + (selectedVariant ? selectedVariant.price_modifier : 0);

  const availableStock = selectedVariant
    ? selectedVariant.stock_quantity - selectedVariant.reserved_quantity
    : product.stock_quantity - product.reserved_quantity;

  const isOutOfStock = product.track_inventory && availableStock <= 0;

  const handleProceed = () => {
    if (isOutOfStock) return;

    setQuickItem({
      productId: product.id,
      variantId: selectedVariant ? selectedVariant.id : null,
      title: product.title,
      variantLabel: selectedVariant
        ? `${selectedVariant.option_name}: ${selectedVariant.option_value}`
        : null,
      unitPrice: currentPrice,
      imageUrl: primaryImage,
      quantity,
      preparationDays: product.preparation_days,
    });

    onClose();
    router.push("/checkout?quick=true");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#453C35]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-buy-title"
        className="relative bg-[#F8F4EC] rounded-xl shadow-2xl max-w-lg w-full border border-[#D8CCBE] overflow-hidden z-10"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#D8CCBE] flex items-center justify-between bg-[#E9DCCB]/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B97968]" />
            <h2 id="quick-buy-title" className="font-serif text-base font-semibold text-[#453C35]">
              Quick Purchase
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#D8CCBE] text-[#453C35] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Snapshot */}
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-[#E9DCCB] shrink-0 border border-[#D8CCBE]">
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#B97968] font-semibold">
                {product.category?.name || "Handcrafted"}
              </p>
              <h3 className="font-serif text-lg font-semibold text-[#453C35] line-clamp-1">
                {product.title}
              </h3>
              <p className="text-lg font-semibold text-[#453C35] mt-1">
                {formatINR(currentPrice)}
              </p>
              <p className="text-xs text-[#7D726A] mt-0.5">
                Ready to ship in {product.preparation_days} business days
              </p>
            </div>
          </div>

          {/* Variant Selection */}
          {hasVariants && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35]">
                Select Option ({product.variants[0].option_name})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const vStock = v.stock_quantity - v.reserved_quantity;
                  const vOutOfStock = product.track_inventory && vStock <= 0;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={vOutOfStock}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? "border-[#B97968] bg-[#E9DCCB]/60 ring-1 ring-[#B97968]"
                          : "border-[#D8CCBE] bg-white hover:border-[#B97968]/50"
                      } ${vOutOfStock ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <div>
                        <p className="text-xs font-medium text-[#453C35]">
                          {v.option_value}
                        </p>
                        {v.price_modifier !== 0 && (
                          <p className="text-[10px] text-[#7D726A]">
                            {v.price_modifier > 0 ? "+" : ""}
                            {formatINR(v.price_modifier)}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#B97968] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#453C35]">
              Quantity
            </span>
            <div className="flex items-center border border-[#D8CCBE] rounded bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 hover:bg-[#E9DCCB] text-[#453C35]"
              >
                -
              </button>
              <span className="px-3 text-xs font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.min(
                      quantity + 1,
                      product.track_inventory ? Math.max(1, availableStock) : 10
                    )
                  )
                }
                className="px-3 py-1 hover:bg-[#E9DCCB] text-[#453C35]"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D8CCBE] bg-[#E9DCCB]/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#7D726A]">Estimated Total</p>
            <p className="font-semibold text-base text-[#453C35]">
              {formatINR(currentPrice * quantity)}
            </p>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleProceed}
            className={`px-6 py-2.5 rounded-md font-medium text-xs tracking-wider flex items-center gap-2 transition-all ${
              isOutOfStock
                ? "bg-[#D8CCBE] text-[#7D726A] cursor-not-allowed"
                : "bg-[#B97968] hover:bg-[#A66757] text-white shadow-warm"
            }`}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

