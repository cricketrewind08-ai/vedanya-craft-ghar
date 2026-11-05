"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, ShoppingBag, Clock } from "lucide-react";
import type { ProductWithDetails } from "@/lib/services/products";
import { formatINR } from "@/lib/utils/currency";
import { useCartStore } from "@/lib/store/cart";
import { useSettings } from "@/components/providers/settings-provider";
import { QuickBuyModal } from "@/components/storefront/quick-buy-modal";

interface ProductCardProps {
  product: ProductWithDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quickBuyOpen, setQuickBuyOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { modeStatus } = useSettings();

  const primaryImage =
    product.images.find((img) => img.is_primary)?.image_url ||
    product.images[0]?.image_url ||
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80";

  const hasVariants = product.variants && product.variants.length > 0;
  const availableStock = product.stock_quantity - product.reserved_quantity;
  const isOutOfStock = product.track_inventory && availableStock <= 0;

  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.base_price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVariants) {
      setQuickBuyOpen(true);
      return;
    }

    addItem({
      productId: product.id,
      variantId: null,
      title: product.title,
      variantLabel: null,
      unitPrice: product.base_price,
      imageUrl: primaryImage,
      preparationDays: product.preparation_days,
      maxAvailable: product.track_inventory ? availableStock : 99,
    });
  };

  return (
    <>
      <div className="group rounded-xl overflow-hidden bg-white/70 border border-[#D8CCBE]/70 hover:border-[#B97968]/50 shadow-sm hover:shadow-warm transition-all duration-300 flex flex-col justify-between">
        {/* Top Image & Badges */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#E9DCCB]/40">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
            {product.availability_mode === "READY_TO_SHIP" && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#A3AA8C] text-white shadow-sm">
                Ready to Ship
              </span>
            )}
            {product.availability_mode === "MADE_TO_ORDER" && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#E9DCCB] text-[#453C35] border border-[#D8CCBE] shadow-sm flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#B97968]" />
                Made to Order
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#B97968] text-white shadow-sm">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Out of Stock Ribbon */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-[#453C35]/60 backdrop-blur-[1px] flex items-center justify-center z-20">
              <span className="px-3 py-1 bg-white text-[#453C35] text-xs font-semibold rounded tracking-wider uppercase">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {product.category && (
              <p className="text-[11px] uppercase tracking-wider text-[#7D726A] font-medium mb-1">
                {product.category.name}
              </p>
            )}
            <Link
              href={`/product/${product.slug}`}
              className="font-serif text-base font-semibold text-[#453C35] hover:text-[#B97968] transition-colors line-clamp-2"
            >
              {product.title}
            </Link>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D8CCBE]/40 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-semibold text-[#453C35]">
                  {formatINR(product.base_price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-[#7D726A] line-through">
                    {formatINR(product.compare_at_price)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#7D726A]">
                {product.preparation_days === 0
                  ? "Ships same day"
                  : `Prep: ${product.preparation_days} days`}
              </p>
            </div>

            {/* Quick Actions */}
            {modeStatus.canOrder && !isOutOfStock && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  title="Add to Basket"
                  className="p-2 rounded-lg border border-[#D8CCBE] bg-white hover:bg-[#E9DCCB]/60 text-[#453C35] transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setQuickBuyOpen(true)}
                  title="Quick Purchase"
                  className="px-3 py-1.5 rounded-lg bg-[#B97968] hover:bg-[#A66757] text-white text-xs font-medium tracking-wide flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Buy</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Buy Modal */}
      {quickBuyOpen && (
        <QuickBuyModal
          product={product}
          isOpen={quickBuyOpen}
          onClose={() => setQuickBuyOpen(false)}
        />
      )}
    </>
  );
}

