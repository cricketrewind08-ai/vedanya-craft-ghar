import { Suspense } from "react";
import type { Metadata } from "next";
import { StorefrontNavbar } from "@/components/storefront/navbar";
import { StorefrontFooter } from "@/components/storefront/footer";
import { ProductCard } from "@/components/storefront/product-card";
import {
  getStorefrontProducts,
  getActiveCategories,
} from "@/lib/services/products";
import { ShopFilters } from "@/components/storefront/shop-filters";

export const metadata: Metadata = {
  title: "Shop Handcrafted Collection | Vedanya Craft Ghar",
  description:
    "Explore our complete range of handcrafted crochet accessories, mulberry silk scrunchies, headbands, and custom handmade gifts.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: "featured" | "price-asc" | "price-desc" | "newest";
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categorySlug = params.category || "all";
  const searchQuery = params.search || "";
  const sortBy = params.sort || "featured";

  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getStorefrontProducts({
      categorySlug,
      search: searchQuery,
      sortBy,
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <StorefrontNavbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#B97968] font-semibold">
            Boutique Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#453C35] mt-1 font-semibold">
            Handcrafted with Intention & Heart
          </h1>
          <p className="text-sm text-[#7D726A] mt-2">
            Each creation is individually woven and tailored using high quality yarns, silks, and sustainable natural materials.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <Suspense fallback={<div className="h-16 animate-pulse bg-[#E9DCCB]/30 rounded-lg" />}>
          <ShopFilters
            categories={categories}
            currentCategory={categorySlug}
            currentSearch={searchQuery}
            currentSort={sortBy}
          />
        </Suspense>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="py-20 text-center bg-white/50 rounded-2xl border border-[#D8CCBE] mt-8">
            <p className="font-serif text-xl text-[#453C35] font-semibold">
              No creations found
            </p>
            <p className="text-sm text-[#7D726A] mt-1 max-w-md mx-auto">
              We couldn’t find any items matching your selected filters. Try choosing another category or clearing your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}

