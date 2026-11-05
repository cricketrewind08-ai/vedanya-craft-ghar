import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/types/database";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];

export interface ProductWithDetails extends Product {
  category: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductFilterOptions {
  categorySlug?: string;
  search?: string;
  sortBy?: "featured" | "price-asc" | "price-desc" | "newest";
  limit?: number;
}

/**
 * Fetches active public categories.
 */
export async function getActiveCategories(): Promise<Category[]> {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_hidden", false)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Exception fetching categories:", err);
    return [];
  }
}

/**
 * Fetches viewable products for the storefront catalog with filtering and sorting.
 */
export async function getStorefrontProducts(
  options: ProductFilterOptions = {}
): Promise<ProductWithDetails[]> {
  try {
    const supabase = getAdminClient();

    let query = supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq("is_archived", false)
      .neq("availability_mode", "HIDDEN");

    // Category filter
    if (options.categorySlug && options.categorySlug !== "all") {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", options.categorySlug)
        .single();

      if (cat) {
        query = query.eq("category_id", cat.id);
      }
    }

    // Search query
    if (options.search && options.search.trim() !== "") {
      const term = `%${options.search.trim()}%`;
      query = query.or(`title.ilike.${term},description.ilike.${term},material.ilike.${term}`);
    }

    // Sorting
    switch (options.sortBy) {
      case "price-asc":
        query = query.order("base_price", { ascending: true });
        break;
      case "price-desc":
        query = query.order("base_price", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "featured":
      default:
        query = query
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false });
        break;
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching storefront products:", error.message);
      return [];
    }

    // Sort product images by display_order
    const products = (data as unknown as ProductWithDetails[]).map((product) => ({
      ...product,
      images: (product.images || []).sort(
        (a, b) => a.display_order - b.display_order
      ),
      variants: (product.variants || []).sort(
        (a, b) => (a.price_modifier || 0) - (b.price_modifier || 0)
      ),
    }));

    return products;
  } catch (err) {
    console.error("Exception fetching storefront products:", err);
    return [];
  }
}

/**
 * Fetches a single product by slug with images, variants, and category.
 */
export async function getProductBySlug(
  slug: string
): Promise<ProductWithDetails | null> {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq("slug", slug)
      .eq("is_archived", false)
      .neq("availability_mode", "HIDDEN")
      .single();

    if (error || !data) {
      return null;
    }

    const product = data as unknown as ProductWithDetails;
    product.images = (product.images || []).sort(
      (a, b) => a.display_order - b.display_order
    );
    product.variants = (product.variants || []).sort(
      (a, b) => (a.price_modifier || 0) - (b.price_modifier || 0)
    );

    return product;
  } catch (err) {
    console.error(`Exception fetching product with slug "${slug}":`, err);
    return null;
  }
}

/**
 * Fetches related products from the same category.
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit: number = 4
): Promise<ProductWithDetails[]> {
  if (!categoryId) return [];

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq("category_id", categoryId)
      .neq("id", productId)
      .eq("is_archived", false)
      .neq("availability_mode", "HIDDEN")
      .limit(limit);

    if (error || !data) return [];

    return (data as unknown as ProductWithDetails[]).map((p) => ({
      ...p,
      images: (p.images || []).sort((a, b) => a.display_order - b.display_order),
      variants: (p.variants || []).sort(
        (a, b) => (a.price_modifier || 0) - (b.price_modifier || 0)
      ),
    }));
  } catch (err) {
    console.error("Exception fetching related products:", err);
    return [];
  }
}

