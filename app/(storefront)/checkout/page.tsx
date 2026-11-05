import { Suspense } from "react";
import type { Metadata } from "next";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export const metadata: Metadata = {
  title: "Guest Checkout | Vedanya Craft Ghar",
  description:
    "Review and submit your handcrafted order request. No online payment required; verified personally by the artisan.",
};

interface CheckoutPageProps {
  searchParams: Promise<{
    quick?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const isQuickPurchase = params.quick === "true";

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StorefrontNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#B97968] font-semibold">
            Two-Stage Approval Order Pipeline
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#453C35] mt-1">
            Submit Order Request
          </h1>
          <p className="text-xs text-[#7D726A] mt-1.5">
            Guest checkout · Verified by artisan · Pay only after confirmation
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-12 text-center text-xs text-[#7D726A] animate-pulse">
              Loading checkout session...
            </div>
          }
        >
          <CheckoutForm isQuickPurchase={isQuickPurchase} />
        </Suspense>
      </main>

      <StorefrontFooter />
    </div>
  );
}

