import { getAdminClient } from "@/lib/supabase/admin";
import { SetupWizard } from "@/components/admin/setup-wizard";

export const metadata = {
  title: "Store Setup Wizard | Vedanya Owner Platform",
};

export default async function AdminSetupPage() {
  const supabase = getAdminClient();
  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .single();

  if (!settings) {
    return <div className="p-8 text-center text-sm text-gray-500">Store settings record not found.</div>;
  }

  return (
    <div className="p-6 md:p-8">
      <SetupWizard initialSettings={settings} />
    </div>
  );
}

