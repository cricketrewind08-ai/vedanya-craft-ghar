import { getAdminClient } from "@/lib/supabase/admin";
import { getPublicStoreSettings } from "@/lib/services/settings";
import { CustomEnquiriesView } from "@/components/admin/custom-enquiries-view";

export const metadata = {
  title: "Custom Enquiries | Vedanya Owner Platform",
};

export default async function AdminCustomEnquiriesPage() {
  const supabase = getAdminClient();
  const [{ data: requests }, settings] = await Promise.all([
    supabase
      .from("custom_order_requests")
      .select("*")
      .order("created_at", { ascending: false }),
    getPublicStoreSettings(),
  ]);

  return (
    <div className="p-6 md:p-8">
      <CustomEnquiriesView
        initialRequests={requests || []}
        storePhone={settings?.whatsapp_number || settings?.phone}
      />
    </div>
  );
}

