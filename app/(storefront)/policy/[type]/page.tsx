import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { getPublicStoreSettings } from "@/lib/services/settings";

interface PolicyPageProps {
  params: Promise<{
    type: string;
  }>;
}

const POLICY_CONFIG: Record<
  string,
  {
    title: string;
    key: "shipping_policy" | "return_policy" | "privacy_policy" | "terms_conditions";
    subtitle: string;
  }
> = {
  shipping: {
    title: "Shipping & Delivery Policy",
    key: "shipping_policy",
    subtitle: "Information on courier partners, delivery times, and packaging across India.",
  },
  return: {
    title: "Return & Cancellation Policy",
    key: "return_policy",
    subtitle: "Guidelines for handmade bespoke items, transit damage, and cancellations.",
  },
  privacy: {
    title: "Privacy Policy",
    key: "privacy_policy",
    subtitle: "How we protect and use your delivery address and phone number.",
  },
  terms: {
    title: "Terms & Conditions",
    key: "terms_conditions",
    subtitle: "Artisan craft terms, product care, and ordering conditions.",
  },
};

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { type } = await params;
  const config = POLICY_CONFIG[type];

  if (!config) {
    return { title: "Policy | Vedanya Craft Ghar" };
  }

  return {
    title: `${config.title} | Vedanya Craft Ghar`,
    description: config.subtitle,
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { type } = await params;
  const config = POLICY_CONFIG[type];

  if (!config) {
    notFound();
  }

  const settings = await getPublicStoreSettings();
  const rawPolicies = settings.policies as Record<string, string> | undefined;
  const content = rawPolicies?.[config.key] || "Policy details are being updated by the owner.";

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StorefrontNavbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-14 w-full">
        {/* Back Link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#7D726A] hover:text-[#B97968] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Collection</span>
        </Link>

        {/* Policy Content Card */}
        <article className="bg-white/80 p-8 sm:p-12 rounded-2xl border border-[#D8CCBE] shadow-warm space-y-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#B97968] font-semibold">
            <Shield className="w-4 h-4" />
            <span>Store Policy</span>
          </div>

          <header className="pb-6 border-b border-[#D8CCBE]/70">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#453C35]">
              {config.title}
            </h1>
            <p className="text-sm text-[#7D726A] mt-2">{config.subtitle}</p>
          </header>

          <div className="prose prose-stone max-w-none text-sm sm:text-base text-[#453C35] leading-relaxed whitespace-pre-line py-2">
            {content}
          </div>

          <footer className="pt-8 border-t border-[#D8CCBE]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#7D726A]">
            <p>Published by {settings.business_name} (Artisan Studio, India)</p>
            <Link
              href="/contact"
              className="text-[#B97968] hover:underline font-medium"
            >
              Have a question about this policy? Contact us
            </Link>
          </footer>
        </article>
      </main>

      <StorefrontFooter />
    </div>
  );
}

