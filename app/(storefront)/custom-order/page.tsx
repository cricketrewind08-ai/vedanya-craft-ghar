import type { Metadata } from "next";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { CustomOrderForm } from "@/components/storefront/custom-order-form";
import { getPublicStoreSettings } from "@/lib/services/settings";

export const metadata: Metadata = {
  title: "Request a Custom Piece | Vedanya Craft Ghar",
  description:
    "Have a unique handmade idea in mind? Request a custom crochet bouquet, personalized accessory, or gift crafted especially for you.",
};

export default async function CustomOrderPage() {
  const settings = await getPublicStoreSettings();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StorefrontNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#B97968] font-semibold">
            Bespoke Creations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#453C35] font-semibold mt-1">
            Let’s Bring Your Vision to Life
          </h1>
          <p className="text-sm text-[#7D726A] mt-2 leading-relaxed">
            From special color combinations to personalized wedding gifts and commemorative crochet bouquets, our artisan takes custom requests with joy.
          </p>
        </div>

        {!settings.custom_orders_enabled ? (
          <div className="p-8 bg-white/70 rounded-2xl border border-[#D8CCBE] text-center max-w-md mx-auto">
            <p className="font-serif text-lg text-[#453C35] font-medium mb-1">
              Custom Orders Currently Paused
            </p>
            <p className="text-xs text-[#7D726A]">
              We have temporarily paused new custom commissions to fulfill existing orders. Please check back soon or browse our ready-to-ship collection.
            </p>
          </div>
        ) : (
          <CustomOrderForm />
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}

