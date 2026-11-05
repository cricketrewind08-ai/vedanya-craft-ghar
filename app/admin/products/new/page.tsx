import { getActiveCategories } from "@/lib/services/products";
import { ProductFormWithPreview } from "@/components/admin/product-form-with-preview";

export const metadata = {
  title: "New Product | Vedanya Owner Platform",
};

export default async function NewProductPage() {
  const categories = await getActiveCategories();

  return (
    <div className="p-6 md:p-8">
      <ProductFormWithPreview categories={categories} />
    </div>
  );
}

