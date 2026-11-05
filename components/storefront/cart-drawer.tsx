"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useSettings } from "@/components/providers/settings-provider";
import { formatINR } from "@/lib/utils/currency";

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, closeCart, updateQuantity, removeItem, getCartTotal } =
    useCartStore();
  const { settings, modeStatus } = useSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const subtotal = getCartTotal();
  const freeThreshold = settings.free_shipping_threshold ?? 999;
  const freeShippingMet = subtotal >= freeThreshold;
  const neededForFree = freeThreshold - subtotal;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#453C35]/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Shopping Cart Drawer"
          className="w-screen max-w-md bg-[#F8F4EC] text-[#453C35] flex flex-col shadow-2xl border-l border-[#D8CCBE]"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#D8CCBE] flex items-center justify-between bg-[#E9DCCB]/40">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#B97968]" />
              <h2 className="font-serif text-lg font-semibold text-[#453C35]">
                Your Shopping Basket
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full hover:bg-[#D8CCBE] text-[#453C35] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Milestone */}
          {settings.free_shipping_threshold && (
            <div className="p-3 bg-[#E9DCCB]/60 border-b border-[#D8CCBE] text-xs">
              {freeShippingMet ? (
                <p className="text-center font-medium text-[#453C35] flex items-center justify-center gap-1">
                  🎉 You have unlocked <span className="font-semibold">FREE Shipping</span>!
                </p>
              ) : (
                <div>
                  <p className="text-center text-[#7D726A] mb-1.5">
                    Add <span className="font-semibold text-[#453C35]">{formatINR(neededForFree)}</span> more for Free Shipping
                  </p>
                  <div className="w-full h-1.5 bg-[#D8CCBE] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B97968] transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#D8CCBE]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#7D726A]">
                <div className="w-16 h-16 rounded-full bg-[#E9DCCB]/70 flex items-center justify-center mb-4 text-[#B97968]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif text-lg text-[#453C35] font-medium mb-1">
                  Your basket is empty
                </p>
                <p className="text-sm text-[#7D726A] max-w-xs mb-6">
                  Explore our handcrafted collection to find lovely crochet pieces and silk treasures.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-[#B97968] text-white rounded text-sm font-medium hover:bg-[#A66757] transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || "base"}`}
                  className="py-4 flex gap-4"
                >
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-[#E9DCCB] shrink-0 border border-[#D8CCBE]">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-sm text-[#453C35] line-clamp-1">
                          {item.title}
                        </h3>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-[#7D726A] hover:text-[#B33927] transition-colors p-1"
                          aria-label={`Remove ${item.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.variantLabel && (
                        <p className="text-xs text-[#7D726A] mt-0.5">
                          {item.variantLabel}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#D8CCBE] rounded bg-[#FCFAF6]">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity - 1
                            )
                          }
                          className="p-1 hover:bg-[#E9DCCB] text-[#453C35] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-[#453C35]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity + 1
                            )
                          }
                          className="p-1 hover:bg-[#E9DCCB] text-[#453C35] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="font-semibold text-sm text-[#453C35]">
                        {formatINR(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#D8CCBE] bg-[#E9DCCB]/30 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#7D726A]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#453C35]">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#7D726A]">
                  <span>Shipping</span>
                  <span className="text-xs italic">
                    {freeShippingMet
                      ? "Free"
                      : "Calculated at checkout (Flat ₹" + settings.default_shipping_charge + ")"}
                  </span>
                </div>
                <p className="text-[11px] text-[#7D726A] italic">
                  * Note: Order requests are reviewed & confirmed by the owner before payment.
                </p>
              </div>

              {modeStatus.canOrder ? (
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-md bg-[#B97968] hover:bg-[#A66757] text-white font-medium text-sm tracking-wide shadow-warm transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="p-3 bg-[#E9DCCB] rounded text-center text-xs text-[#453C35]">
                  Ordering is currently paused ({modeStatus.bannerTitle}). You can still save items to your basket!
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

