import { getAdminProductsList } from "@/lib/services/admin-products";
import { ProductsListView } from "@/components/admin/products-list-view";

export const metadata = {
  title: "Products | Vedanya Owner Platform",
};

export default async function AdminProductsPage() {
  const products = await getAdminProductsList();

  return (
    <div className="p-6 md:p-8">
      <ProductsListView initialProducts={products} />
    </div>
  );
}

