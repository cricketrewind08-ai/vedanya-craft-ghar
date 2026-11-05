import { notFound } from "next/navigation";
import { getAdminProductById } from "@/lib/services/admin-products";
import { getActiveCategories } from "@/lib/services/products";
import { ProductFormWithPreview } from "@/components/admin/product-form-with-preview";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Product | Vedanya Owner Platform",
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getActiveCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8">
      <ProductFormWithPreview categories={categories} initialData={product} />
    </div>
  );
}

