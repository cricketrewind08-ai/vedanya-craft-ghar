"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useSettings } from "@/components/providers/settings-provider";

export function StorefrontNavbar() {
  const { settings, modeStatus } = useSettings();

  return (
    <header className="border-b border-[#D8CCBE]/60 bg-[#F8F4EC]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <span className="w-9 h-9 rounded-full bg-[#B97968]/20 flex items-center justify-center text-[#B97968] group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-current" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif tracking-tight font-semibold text-[#453C35]">
              {settings.business_name}
            </h1>
            <p className="text-[10px] tracking-widest uppercase text-[#7D726A] font-medium">
              {settings.tagline}
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        {!modeStatus.isMaintenance && (
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#453C35]">
            <Link href="/" className="hover:text-[#B97968] transition-colors">
              Home
            </Link>
            <Link href="/shop" className="hover:text-[#B97968] transition-colors">
              Collection
            </Link>
            {settings.custom_orders_enabled && (
              <Link
                href="/custom-order"
                className="hover:text-[#B97968] transition-colors"
              >
                Custom Orders
              </Link>
            )}
            <Link
              href="/track-order"
              className="hover:text-[#B97968] transition-colors"
            >
              Track Order
            </Link>
            <Link href="/about" className="hover:text-[#B97968] transition-colors">
              Our Story
            </Link>
          </nav>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {!modeStatus.isMaintenance && (
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full hover:bg-[#E9DCCB]/60 transition-colors text-[#453C35]"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
          )}

          <Link
            href="/admin/login"
            className="text-xs px-3 py-1.5 rounded border border-[#D8CCBE] hover:border-[#B97968] text-[#7D726A] hover:text-[#453C35] transition-colors"
          >
            Owner Portal
          </Link>
        </div>
      </div>
    </header>
  );
}

