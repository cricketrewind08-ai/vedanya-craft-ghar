"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Share2,
  Copy,
  Check,
  Clock,
  Sparkles,
  ShoppingBag,
  Zap,
  Tag,
  Ruler,
  Layers,
} from "lucide-react";
import type { ProductWithDetails, ProductVariant } from "@/lib/services/products";
import { formatINR } from "@/lib/utils/currency";
import { useCartStore } from "@/lib/store/cart";
import { useSettings } from "@/components/providers/settings-provider";

interface ProductDetailViewProps {
  product: ProductWithDetails;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const { modeStatus } = useSettings();
  const addItem = useCartStore((state) => state.addItem);
  const setQuickItem = useCartStore((state) => state.setQuickItem);

  const images =
    product.images.length > 0
      ? product.images
      : [
          {
            id: "fallback",
            product_id: product.id,
            image_url:
              "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
            alt_text: product.title,
            display_order: 1,
            is_primary: true,
            created_at: new Date().toISOString(),
          },
        ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const currentPrice =
    product.base_price + (selectedVariant ? selectedVariant.price_modifier : 0);

  const availableStock = selectedVariant
    ? selectedVariant.stock_quantity - selectedVariant.reserved_quantity
    : product.stock_quantity - product.reserved_quantity;

  const isOutOfStock = product.track_inventory && availableStock <= 0;

  const hasDiscount =
    product.compare_at_price && product.compare_at_price > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - currentPrice) /
          product.compare_at_price!) *
          100
      )
    : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant ? selectedVariant.id : null,
        title: product.title,
        variantLabel: selectedVariant
          ? `${selectedVariant.option_name}: ${selectedVariant.option_value}`
          : null,
        unitPrice: currentPrice,
        imageUrl: images[activeImageIndex].image_url,
        preparationDays: product.preparation_days,
        maxAvailable: product.track_inventory ? availableStock : 99,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    setQuickItem({
      productId: product.id,
      variantId: selectedVariant ? selectedVariant.id : null,
      title: product.title,
      variantLabel: selectedVariant
        ? `${selectedVariant.option_name}: ${selectedVariant.option_value}`
        : null,
      unitPrice: currentPrice,
      imageUrl: images[activeImageIndex].image_url,
      quantity,
      preparationDays: product.preparation_days,
    });
    router.push("/checkout?quick=true");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} at Vedanya Craft Ghar!`,
          url,
        });
        return;
      } catch {
        // Fallback to copy link
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      {/* Left: Multi-Image Gallery */}
      <div className="space-y-4">
        {/* Main Display Image */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#E9DCCB]/40 border border-[#D8CCBE] shadow-warm">
          <Image
            src={images[activeImageIndex].image_url}
            alt={images[activeImageIndex].alt_text || product.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
            {product.availability_mode === "READY_TO_SHIP" && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#A3AA8C] text-white shadow-sm">
                Ready to Ship
              </span>
            )}
            {product.availability_mode === "MADE_TO_ORDER" && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#E9DCCB] text-[#453C35] border border-[#D8CCBE] shadow-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#B97968]" />
                Made to Order
              </span>
            )}
            {hasDiscount && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#B97968] text-white shadow-sm flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Save {discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIndex === idx
                    ? "border-[#B97968] scale-105"
                    : "border-[#D8CCBE] opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || `Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Details & Purchase Actions */}
      <div className="flex flex-col justify-between">
        <div className="space-y-6">
          {/* Category & Title */}
          <div>
            {product.category && (
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="text-xs uppercase tracking-widest text-[#B97968] font-semibold hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl text-[#453C35] font-semibold mt-1">
              {product.title}
            </h1>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3 pb-6 border-b border-[#D8CCBE]/70">
            <span className="text-3xl font-semibold text-[#453C35]">
              {formatINR(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-[#7D726A] line-through">
                {formatINR(product.compare_at_price)}
              </span>
            )}
            <span className="text-xs text-[#7D726A] italic">
              (Includes handmade crafting & packaging)
            </span>
          </div>

          {/* Availability & Preparation Alert */}
          <div className="p-3.5 rounded-lg bg-[#E9DCCB]/40 border border-[#D8CCBE] text-xs space-y-1">
            <p className="font-medium text-[#453C35] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#B97968]" />
              Artisan Slow Fashion Notice
            </p>
            <p className="text-[#7D726A] leading-relaxed">
              {product.preparation_days === 0
                ? "This item is completed and ready for immediate courier dispatch."
                : `Handcrafted preparation requires ${product.preparation_days} business days before courier dispatch.`}
            </p>
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35]">
                {product.variants[0].option_name}
              </label>
              <div className="flex flex-wrap gap-2.5">
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
                      className={`px-4 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? "border-[#B97968] bg-[#E9DCCB]/60 text-[#453C35] ring-1 ring-[#B97968]"
                          : "border-[#D8CCBE] bg-white text-[#453C35] hover:border-[#B97968]/50"
                      } ${vOutOfStock ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                    >
                      <span>{v.option_value}</span>
                      {v.price_modifier !== 0 && (
                        <span className="ml-1.5 text-[10px] text-[#7D726A]">
                          ({v.price_modifier > 0 ? "+" : ""}
                          {formatINR(v.price_modifier)})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Controls & Action Buttons */}
          {modeStatus.canOrder && !isOutOfStock ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#453C35]">
                  Quantity
                </span>
                <div className="flex items-center border border-[#D8CCBE] rounded bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 hover:bg-[#E9DCCB] text-[#453C35] transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-semibold">{quantity}</span>
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
                    className="px-3.5 py-1.5 hover:bg-[#E9DCCB] text-[#453C35] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-md bg-[#E9DCCB] hover:bg-[#D7C3AA] text-[#453C35] font-medium text-sm tracking-wide flex items-center justify-center gap-2 border border-[#D8CCBE] transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Basket</span>
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-md bg-[#B97968] hover:bg-[#A66757] text-white font-medium text-sm tracking-wide shadow-warm flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Buy Now (Quick Purchase)</span>
                </button>
              </div>
            </div>
          ) : isOutOfStock ? (
            <div className="p-4 bg-[#E9DCCB]/60 rounded-xl text-center text-sm font-medium text-[#453C35]">
              Currently Out of Stock. Follow our Instagram for restock announcements!
            </div>
          ) : (
            <div className="p-4 bg-[#E9DCCB]/60 rounded-xl text-center text-sm font-medium text-[#453C35]">
              Ordering is temporarily paused ({modeStatus.bannerTitle}).
            </div>
          )}

          {/* Description */}
          <div className="pt-6 border-t border-[#D8CCBE]/70 space-y-3">
            <h2 className="font-serif text-lg font-semibold text-[#453C35]">
              Artisan Craftsmanship & Details
            </h2>
            <p className="text-sm text-[#7D726A] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Specifications (Material & Dimensions) */}
          {(product.material || product.dimensions) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#D8CCBE]/70 text-xs">
              {product.material && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white/60 border border-[#D8CCBE]/60">
                  <Layers className="w-4 h-4 text-[#B97968] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#453C35] block">
                      Material
                    </span>
                    <span className="text-[#7D726A]">{product.material}</span>
                  </div>
                </div>
              )}
              {product.dimensions && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white/60 border border-[#D8CCBE]/60">
                  <Ruler className="w-4 h-4 text-[#A3AA8C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#453C35] block">
                      Dimensions
                    </span>
                    <span className="text-[#7D726A]">{product.dimensions}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share Button */}
          <div className="pt-4 flex items-center gap-3 text-xs text-[#7D726A]">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 hover:text-[#B97968] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#A3AA8C]" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share this piece</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      {modeStatus.canOrder && !isOutOfStock && (
        <div className="fixed bottom-0 inset-x-0 bg-[#F8F4EC]/95 backdrop-blur-md border-t border-[#D8CCBE] p-3 flex sm:hidden items-center gap-3 z-40 shadow-lg">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 rounded-md bg-[#E9DCCB] text-[#453C35] font-medium text-xs border border-[#D8CCBE]"
          >
            Add to Basket
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 py-3 px-4 rounded-md bg-[#B97968] text-white font-medium text-xs shadow-warm flex items-center justify-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Buy Now</span>
          </button>
        </div>
      )}
    </div>
  );
}

