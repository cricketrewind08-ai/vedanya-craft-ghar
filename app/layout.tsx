import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { getPublicStoreSettings } from "@/lib/services/settings";
import { SettingsProvider, StoreModeBanner } from "@/components/providers/settings-provider";
import { CartDrawer } from "@/components/storefront/cart-drawer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicStoreSettings();
  return {
    title: `${settings.business_name} | ${settings.tagline}`,
    description:
      settings.about_content?.slice(0, 160) ||
      "Indian handmade artisan boutique offering handcrafted crochet treasures, scrunchies, hair accessories, and bespoke gifts.",
    keywords: [
      settings.business_name,
      "crochet India",
      "handmade crochet tote",
      "hair accessories",
      "mulberry silk scrunchies",
      "handmade gifts India",
    ],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicStoreSettings();

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased bg-[#F8F4EC] text-[#453C35] selection:bg-[#B97968]/20 selection:text-[#453C35]">
        <SettingsProvider settings={settings}>
          <StoreModeBanner />
          {children}
          <CartDrawer />
        </SettingsProvider>
      </body>
    </html>
  );
}

