import type { Metadata } from "next";
import { MessageCircle, Phone, Mail, MapPin, Instagram, Heart } from "lucide-react";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { getPublicStoreSettings } from "@/lib/services/settings";

export const metadata: Metadata = {
  title: "Contact Artisan Studio | Vedanya Craft Ghar",
  description:
    "Get in touch with Vedanya Craft Ghar for custom crochet orders, order status questions, or artisan collaborations.",
};

export default async function ContactPage() {
  const settings = await getPublicStoreSettings();

  const hasPhone = Boolean(settings.phone);
  const hasWhatsApp = Boolean(settings.whatsapp_number);
  const hasEmail = Boolean(settings.email);
  const hasAddress = Boolean(settings.address);
  const hasInstagram = Boolean(settings.instagram_url);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StorefrontNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#B97968] font-semibold">
            Get In Touch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#453C35] font-semibold mt-1">
            We’d Love to Hear From You
          </h1>
          <p className="text-sm text-[#7D726A] mt-2">
            Have questions about an item, custom colors, or shipping timeline? Connect with our studio directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Studio Contact Card */}
          <div className="bg-white/80 p-8 rounded-2xl border border-[#D8CCBE] shadow-warm space-y-6">
            <h2 className="font-serif text-xl font-semibold text-[#453C35] pb-2 border-b border-[#D8CCBE]">
              Studio Information
            </h2>

            <ul className="space-y-4 text-sm">
              {hasAddress && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E9DCCB] text-[#B97968] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#7D726A] font-semibold block">
                      Studio Address
                    </span>
                    <span className="text-[#453C35] font-medium leading-relaxed">
                      {settings.address}
                    </span>
                  </div>
                </li>
              )}

              {hasWhatsApp && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#7D726A] font-semibold block">
                      WhatsApp Studio Chat
                    </span>
                    <a
                      href={`https://wa.me/91${settings.whatsapp_number}?text=Hello%20Vedanya%20Craft%20Ghar!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#453C35] font-medium hover:text-[#B97968] transition-colors"
                    >
                      +91 {settings.whatsapp_number} (Click to Chat)
                    </a>
                  </div>
                </li>
              )}

              {hasPhone && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E9DCCB] text-[#7D726A] flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#7D726A] font-semibold block">
                      Phone Call
                    </span>
                    <a
                      href={`tel:+91${settings.phone}`}
                      className="text-[#453C35] font-medium hover:text-[#B97968] transition-colors"
                    >
                      +91 {settings.phone}
                    </a>
                  </div>
                </li>
              )}

              {hasEmail && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E9DCCB] text-[#7D726A] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#7D726A] font-semibold block">
                      Email
                    </span>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-[#453C35] font-medium hover:text-[#B97968] transition-colors"
                    >
                      {settings.email}
                    </a>
                  </div>
                </li>
              )}

              {!hasPhone && !hasWhatsApp && !hasEmail && !hasAddress && (
                <li className="text-sm text-[#7D726A] italic">
                  Studio contact channels are currently being configured by the owner. Please check back shortly!
                </li>
              )}
            </ul>

            {hasInstagram && (
              <div className="pt-4 border-t border-[#D8CCBE]/70">
                <a
                  href={settings.instagram_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B97968] hover:underline"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Connect on Instagram @vedanyacraftghar</span>
                </a>
              </div>
            )}
          </div>

          {/* Quick FAQ / Note */}
          <div className="bg-[#E9DCCB]/40 p-8 rounded-2xl border border-[#D8CCBE] flex flex-col justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-medium text-[#453C35]">
                <Heart className="w-3.5 h-3.5 text-[#B97968] fill-current" />
                Artisan Direct Care
              </span>
              <h3 className="font-serif text-xl font-semibold text-[#453C35]">
                Personalized Communication
              </h3>
              <p className="text-sm text-[#7D726A] leading-relaxed">
                Because we are an independent slow-fashion artisan studio, you communicate directly with the creator of your items.
              </p>
              <p className="text-sm text-[#7D726A] leading-relaxed">
                When you place an order on the website, it enters a two-stage approval pipeline where we verify handcrafting feasibility and reach out with delivery scheduling and payment instructions.
              </p>
            </div>

            <div className="pt-6">
              <p className="text-xs text-[#7D726A] italic">
                Typical response time: Within 12-24 hours.
              </p>
            </div>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}

