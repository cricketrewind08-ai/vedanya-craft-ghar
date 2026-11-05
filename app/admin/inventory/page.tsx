import { getAdminProductsList } from "@/lib/services/admin-products";
import { getAdminClient } from "@/lib/supabase/admin";
import { InventoryMatrixView } from "@/components/admin/inventory-matrix-view";

export const metadata = {
  title: "Inventory Matrix | Vedanya Owner Platform",
};

export default async function AdminInventoryPage() {
  const supabase = getAdminClient();
  const [products, { data: adjustments }] = await Promise.all([
    getAdminProductsList(),
    supabase
      .from("inventory_adjustments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="p-6 md:p-8">
      <InventoryMatrixView
        products={products}
        adjustments={adjustments || []}
      />
    </div>
  );
}

