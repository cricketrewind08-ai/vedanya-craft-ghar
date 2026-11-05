"use client";

import Link from "next/link";
import { Instagram, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useSettings } from "@/components/providers/settings-provider";

export function StorefrontFooter() {
  const { settings } = useSettings();

  const hasContactInfo = Boolean(
    settings.phone ||
      settings.whatsapp_number ||
      settings.email ||
      settings.address
  );

  return (
    <footer className="border-t border-[#D8CCBE] bg-[#E9DCCB]/30 pt-12 pb-8 text-xs text-[#7D726A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="md:col-span-2">
          <h2 className="font-serif text-lg font-semibold text-[#453C35] mb-2">
            {settings.business_name}
          </h2>
          <p className="text-xs uppercase tracking-widest text-[#B97968] font-medium mb-3">
            {settings.tagline}
          </p>
          <p className="text-sm leading-relaxed text-[#7D726A] max-w-sm mb-4">
            {settings.about_content ||
              "Every single item is handcrafted with patient artistry, authentic natural materials, and dedicated love."}
          </p>
          {settings.instagram_url && (
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#453C35] hover:text-[#B97968] font-medium transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#B97968]" />
              Follow on Instagram
            </a>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-serif text-sm font-semibold text-[#453C35] mb-3 uppercase tracking-wider text-[11px]">
            Store Policies
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/policy/shipping"
                className="hover:text-[#B97968] transition-colors"
              >
                Shipping & Delivery
              </Link>
            </li>
            <li>
              <Link
                href="/policy/return"
                className="hover:text-[#B97968] transition-colors"
              >
                Return & Cancellation
              </Link>
            </li>
            <li>
              <Link
                href="/policy/privacy"
                className="hover:text-[#B97968] transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/policy/terms"
                className="hover:text-[#B97968] transition-colors"
              >
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info (Gracefully omitted if unconfigured) */}
        <div>
          <h3 className="font-serif text-sm font-semibold text-[#453C35] mb-3 uppercase tracking-wider text-[11px]">
            Artisan Studio
          </h3>
          {hasContactInfo ? (
            <ul className="space-y-2.5 text-sm">
              {settings.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#B97968] mt-0.5 shrink-0" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.whatsapp_number && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#A3AA8C] shrink-0" />
                  <a
                    href={`https://wa.me/91${settings.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#B97968] transition-colors"
                  >
                    +91 {settings.whatsapp_number}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#7D726A] shrink-0" />
                  <a
                    href={`tel:+91${settings.phone}`}
                    className="hover:text-[#B97968] transition-colors"
                  >
                    +91 {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#7D726A] shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-[#B97968] transition-colors"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-[#7D726A] italic">
              Studio details will be displayed once updated by the owner.
            </p>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#D8CCBE]/50 max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
        <p>© {new Date().getFullYear()} {settings.business_name}. All rights reserved.</p>
        <p className="text-[#8A7D73]">
          Market: India (₹ INR) · Handcrafted slow-fashion
        </p>
      </div>
    </footer>
  );
}

