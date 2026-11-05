import { getAdminProductsList } from "@/lib/services/admin-products";
import { ManualOrderForm } from "@/components/admin/manual-order-form";

export const metadata = {
  title: "Log Manual Sale | Vedanya Owner Platform",
};

export default async function NewManualOrderPage() {
  const products = await getAdminProductsList();

  return (
    <div className="p-6 md:p-8">
      <ManualOrderForm products={products} />
    </div>
  );
}

