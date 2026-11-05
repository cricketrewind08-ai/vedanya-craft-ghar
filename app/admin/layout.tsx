import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { getPublicStoreSettings } from "@/lib/services/settings";
import { SettingsProvider } from "@/components/providers/settings-provider";

export const metadata: Metadata = {
  title: "Owner Workspace | Vedanya Craft Ghar",
  description: "Independent Owner Management Console for Vedanya Craft Ghar.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicStoreSettings();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans">
      <SettingsProvider settings={settings}>
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </SettingsProvider>
    </div>
  );
}

