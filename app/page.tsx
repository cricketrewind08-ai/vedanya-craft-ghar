import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { getPublicStoreSettings } from "@/lib/services/settings";
import { evaluateStoreMode } from "@/lib/services/operating-mode";

export default async function HomePage() {
  const settings = await getPublicStoreSettings();
  const modeStatus = evaluateStoreMode(settings);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Announcement Bar */}
      <div className="bg-[#453C35] text-[#F8F4EC] text-xs py-2 text-center tracking-wide font-medium">
        Handmade with love · Shipping across India · Each piece uniquely crafted
      </div>

      {/* Boutique Navigation */}
      <StorefrontNavbar />

      {/* Hero Showcase */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9DCCB] text-[#453C35] text-xs font-medium tracking-wide mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#B97968]" />
          Artisanal Treasures Crafted by Hand
        </div>

        <h2 className="text-4xl sm:text-6xl font-serif text-[#453C35] max-w-3xl leading-tight font-medium">
          Thoughtfully crafted crochet, silk & hair accessories.
        </h2>

        <p className="mt-6 text-base sm:text-lg text-[#7D726A] max-w-xl font-normal leading-relaxed">
          {settings.about_content ||
            "Every piece is made slowly with care and love. Authentic handmade items for personal moments and heartfelt gifts."}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          {modeStatus.canOrder ? (
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#B97968] hover:bg-[#A66757] text-[#FFFFFF] rounded-md font-medium text-sm tracking-wide shadow-warm transition-all duration-200"
            >
              Explore Creations
            </Link>
          ) : (
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#E9DCCB] hover:bg-[#D7C3AA] text-[#453C35] rounded-md font-medium text-sm tracking-wide transition-all duration-200"
            >
              Browse Catalog
            </Link>
          )}

          {settings.custom_orders_enabled && (
            <Link
              href="/custom-order"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#E9DCCB] hover:bg-[#D7C3AA] text-[#453C35] rounded-md font-medium text-sm tracking-wide transition-all duration-200"
            >
              Request Custom Piece
            </Link>
          )}
        </div>

        {/* Brand Promise Badges */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-lg bg-[#E9DCCB]/40 border border-[#D8CCBE]/50">
            <h3 className="font-serif text-lg font-semibold text-[#453C35] mb-2">
              100% Handcrafted
            </h3>
            <p className="text-sm text-[#7D726A]">
              No factory machines. Each stitch is personally made with artisan dedication.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-[#E9DCCB]/40 border border-[#D8CCBE]/50">
            <h3 className="font-serif text-lg font-semibold text-[#453C35] mb-2">
              Personalized Touch
            </h3>
            <p className="text-sm text-[#7D726A]">
              Custom color combinations, gift packaging, and handwritten notes upon request.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-[#E9DCCB]/40 border border-[#D8CCBE]/50">
            <h3 className="font-serif text-lg font-semibold text-[#453C35] mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-[#A3AA8C]" />
              Owner Verified
            </h3>
            <p className="text-sm text-[#7D726A]">
              Every order is directly reviewed and confirmed by the artisan before dispatch.
            </p>
          </div>
        </div>
      </main>

      {/* Boutique Footer */}
      <StorefrontFooter />
    </div>
  );
}
