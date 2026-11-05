import type { Metadata } from "next";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { OrderTrackerView } from "@/components/storefront/order-tracker-view";

export const metadata: Metadata = {
  title: "Track Your Order | Vedanya Craft Ghar",
  description:
    "Track the live artisan crafting, packaging, and dispatch progress of your handcrafted order.",
};

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StorefrontNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#B97968] font-semibold">
            Real-Time Updates
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#453C35] font-semibold mt-1">
            Track Handcrafted Order
          </h1>
          <p className="text-sm text-[#7D726A] mt-2">
            Enter your Order Reference Number and the 10-digit mobile number used when placing the request.
          </p>
        </div>

        <OrderTrackerView />
      </main>

      <StorefrontFooter />
    </div>
  );
}

