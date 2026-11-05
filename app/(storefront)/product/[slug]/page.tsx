import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { ProductDetailView } from "@/components/storefront/product-detail-view";
import { ProductCard } from "@/components/storefront/product-card";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/services/products";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Vedanya Craft Ghar",
    };
  }

  const primaryImage =
    product.images.find((img) => img.is_primary)?.image_url ||
    product.images[0]?.image_url;

  return {
    title: `${product.title} | Vedanya Craft Ghar`,
    description:
      product.description?.slice(0, 160) ||
      `Handcrafted ${product.title} made with love in India.`,
    openGraph: {
      title: `${product.title} | Vedanya Craft Ghar`,
      description: product.description?.slice(0, 160),
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.category_id,
    4
  );

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StorefrontNavbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <ProductDetailView product={product} />

        {/* Related Creations */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#D8CCBE]">
            <div className="text-center mb-10">
              <span className="text-xs uppercase tracking-widest text-[#B97968] font-semibold">
                More Handcrafted Treasures
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#453C35] mt-1 font-semibold">
                You May Also Adore
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}

