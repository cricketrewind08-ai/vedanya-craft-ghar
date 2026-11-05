"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { useCartStore } from "@/lib/store/cart";
import { useSettings } from "@/components/providers/settings-provider";
import { formatINR } from "@/lib/utils/currency";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const { settings, modeStatus } = useSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <StorefrontNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#B97968] border-t-transparent animate-spin" />
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  const subtotal = getCartTotal();
  const freeThreshold = settings.free_shipping_threshold ?? 999;
  const freeShippingMet = subtotal >= freeThreshold;
  const neededForFree = freeThreshold - subtotal;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StorefrontNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#D8CCBE]">
          <h1 className="font-serif text-3xl font-semibold text-[#453C35]">
            Shopping Basket
          </h1>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#7D726A] hover:text-[#B97968] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white/70 rounded-2xl border border-[#D8CCBE] p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#E9DCCB] text-[#B97968] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[#453C35] mb-2">
              Your basket is empty
            </h2>
            <p className="text-sm text-[#7D726A] mb-6">
              You haven't added any handcrafted creations to your basket yet.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#B97968] hover:bg-[#A66757] text-white rounded-md text-xs font-semibold tracking-wider uppercase shadow-warm transition-all"
            >
              Discover Handcrafted Items
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free shipping bar */}
              {settings.free_shipping_threshold && (
                <div className="p-4 bg-[#E9DCCB]/50 rounded-xl border border-[#D8CCBE] text-xs">
                  {freeShippingMet ? (
                    <p className="font-medium text-[#453C35] text-center">
                      ✨ You qualify for <span className="font-semibold">FREE Delivery</span> across India!
                    </p>
                  ) : (
                    <div>
                      <p className="text-[#7D726A] text-center mb-1.5">
                        Add <span className="font-semibold text-[#453C35]">{formatINR(neededForFree)}</span> more to unlock Free Shipping
                      </p>
                      <div className="w-full h-2 bg-[#D8CCBE] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#B97968] transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white/80 rounded-2xl border border-[#D8CCBE] shadow-warm divide-y divide-[#D8CCBE]/70 overflow-hidden">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId || "base"}`}
                    className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center"
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-[#E9DCCB] shrink-0 border border-[#D8CCBE]">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-serif text-base font-semibold text-[#453C35]">
                            {item.title}
                          </h3>
                          {item.variantLabel && (
                            <p className="text-xs text-[#7D726A] mt-0.5">
                              {item.variantLabel}
                            </p>
                          )}
                          <p className="text-[11px] text-[#7D726A] mt-1">
                            Preparation: {item.preparationDays} business days
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-[#7D726A] hover:text-[#B33927] transition-colors p-1.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-[#D8CCBE] rounded bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                            className="px-2.5 py-1 hover:bg-[#E9DCCB] text-[#453C35]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                            className="px-2.5 py-1 hover:bg-[#E9DCCB] text-[#453C35]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-semibold text-base text-[#453C35]">
                          {formatINR(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Card */}
            <div>
              <div className="bg-white/80 rounded-2xl border border-[#D8CCBE] shadow-warm p-6 space-y-5 sticky top-28">
                <h2 className="font-serif text-lg font-semibold text-[#453C35] pb-3 border-b border-[#D8CCBE]">
                  Order Overview
                </h2>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-[#7D726A]">
                    <span>Items Subtotal</span>
                    <span className="font-medium text-[#453C35]">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#7D726A]">
                    <span>Estimated Shipping</span>
                    <span className="font-medium text-[#453C35]">
                      {freeShippingMet
                        ? "FREE"
                        : formatINR(settings.default_shipping_charge)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#D8CCBE] flex justify-between font-semibold text-base text-[#453C35]">
                    <span>Estimated Total</span>
                    <span>
                      {formatINR(
                        subtotal +
                          (freeShippingMet ? 0 : settings.default_shipping_charge)
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#E9DCCB]/40 rounded-lg text-[11px] text-[#7D726A] leading-relaxed">
                  💡 <strong>Two-Stage Approval:</strong> You do not pay online right now. Your request is reviewed by the artisan first, after which payment and delivery details are arranged directly.
                </div>

                {modeStatus.canOrder ? (
                  <Link
                    href="/checkout"
                    className="w-full py-3.5 px-6 rounded-md bg-[#B97968] hover:bg-[#A66757] text-white font-medium text-xs tracking-wider uppercase shadow-warm flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Proceed to Guest Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="p-3 bg-[#E9DCCB] text-[#453C35] rounded text-center text-xs">
                    Ordering is currently paused ({modeStatus.bannerTitle}).
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}

