import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Sparkles, Instagram } from "lucide-react";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { getPublicStoreSettings } from "@/lib/services/settings";

export const metadata: Metadata = {
  title: "Our Story | Vedanya Craft Ghar",
  description:
    "Learn about Vedanya Craft Ghar - an Indian handmade artisan studio crafting slow-fashion crochet creations, silk scrunchies, and bespoke gifts with love.",
};

export default async function AboutPage() {
  const settings = await getPublicStoreSettings();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StorefrontNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#B97968] font-semibold">
            About Our Studio
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#453C35] font-semibold mt-1">
            Handmade with Love, Woven with Patience
          </h1>
          <p className="text-sm text-[#7D726A] mt-3 uppercase tracking-wider font-medium">
            {settings.tagline}
          </p>
        </div>

        {/* Narrative Card */}
        <div className="bg-white/80 p-8 sm:p-12 rounded-2xl border border-[#D8CCBE] shadow-warm space-y-6 text-[#453C35] leading-relaxed">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E9DCCB] text-[#453C35] text-xs font-medium">
            <Heart className="w-3.5 h-3.5 text-[#B97968] fill-current" />
            The Artisan Behind {settings.business_name}
          </div>

          <div className="prose prose-stone text-sm sm:text-base text-[#453C35] max-w-none space-y-4">
            <p className="text-base sm:text-lg text-[#453C35] font-serif leading-relaxed">
              {settings.about_content ||
                "Welcome to Vedanya Craft Ghar. Every single creation here is handcrafted with patience, artistry, and love."}
            </p>

            <p className="text-sm text-[#7D726A] leading-relaxed">
              In a world full of fast-paced mass manufacturing, we celebrate the delicate rhythm of slow craftsmanship. Every stitch in our crochet bags, every seam in our mulberry silk scrunchies, and every hand-tied bouquet carries human attention, deliberate care, and authentic warmth.
            </p>

            <p className="text-sm text-[#7D726A] leading-relaxed">
              When you choose a handmade piece from Vedanya Craft Ghar, you aren't just buying an accessory—you are supporting an independent artisan tradition and welcoming a keepsake created to bring comfort and joy for years to come.
            </p>
          </div>

          {/* Core Values */}
          <div className="pt-8 border-t border-[#D8CCBE] grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[#F8F4EC] border border-[#D8CCBE]/70">
              <Sparkles className="w-5 h-5 text-[#B97968] mb-2" />
              <h3 className="font-serif text-sm font-semibold text-[#453C35]">
                Ethical Materials
              </h3>
              <p className="text-xs text-[#7D726A] mt-1">
                Natural cotton yarns, pure mulberry silks, and plastic-conscious packaging.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F4EC] border border-[#D8CCBE]/70">
              <Heart className="w-5 h-5 text-[#A3AA8C] mb-2 fill-current" />
              <h3 className="font-serif text-sm font-semibold text-[#453C35]">
                Bespoke Feasibility
              </h3>
              <p className="text-xs text-[#7D726A] mt-1">
                Every customer order is personally reviewed by the artisan before confirmation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F4EC] border border-[#D8CCBE]/70">
              <Instagram className="w-5 h-5 text-[#B97968] mb-2" />
              <h3 className="font-serif text-sm font-semibold text-[#453C35]">
                Artisan Community
              </h3>
              <p className="text-xs text-[#7D726A] mt-1">
                Follow our daily work-in-progress reels and updates on Instagram.
              </p>
            </div>
          </div>

          <div className="pt-6 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-md bg-[#B97968] hover:bg-[#A66757] text-white text-xs font-semibold tracking-wider uppercase shadow-warm transition-all"
            >
              Explore Our Handmade Collection
            </Link>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}

