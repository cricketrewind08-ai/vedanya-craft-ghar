import { getAdminClient } from "@/lib/supabase/admin";
import { StoreSettingsView } from "@/components/admin/store-settings-view";

export const metadata = {
  title: "Store Settings | Vedanya Owner Platform",
};

export default async function AdminSettingsPage() {
  const supabase = getAdminClient();
  const [{ data: settings }, { data: history }] = await Promise.all([
    supabase
      .from("store_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single(),
    supabase
      .from("settings_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!settings) {
    return <div className="p-8 text-center text-sm text-gray-500">Store settings not initialized.</div>;
  }

  return (
    <div className="p-6 md:p-8">
      <StoreSettingsView
        initialSettings={settings}
        history={history || []}
      />
    </div>
  );
}

