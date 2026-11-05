import { getAdminClient } from "@/lib/supabase/admin";
import type { Database, AvailabilityMode } from "@/lib/types/database";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];

export interface ProductFormData {
  id?: string;
  categoryId?: string | null;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number | null;
  availabilityMode: AvailabilityMode;
  preparationDays: number;
  stockQuantity: number;
  trackInventory: boolean;
  material?: string;
  dimensions?: string;
  isFeatured: boolean;
  images: Array<{
    id?: string;
    imageUrl: string;
    altText?: string;
    displayOrder: number;
    isPrimary: boolean;
  }>;
  variants: Array<{
    id?: string;
    optionName: string;
    optionValue: string;
    priceModifier: number;
    stockQuantity: number;
    sku?: string;
  }>;
}

export interface ProductWithDetails extends Product {
  category: Database["public"]["Tables"]["categories"]["Row"] | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

/**
 * Fetches all products including archived ones for the owner manager.
 */
export async function getAdminProductsList(): Promise<ProductWithDetails[]> {
  try {
    const supabase = getAdminClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !products || products.length === 0) return [];

    const productIds = products.map((p) => p.id);
    const categoryIds = Array.from(new Set(products.map((p) => p.category_id).filter(Boolean))) as string[];

    const [{ data: categories }, { data: images }, { data: variants }] = await Promise.all([
      categoryIds.length > 0
        ? supabase.from("categories").select("*").in("id", categoryIds)
        : Promise.resolve({ data: [] }),
      supabase.from("product_images").select("*").in("product_id", productIds).order("display_order", { ascending: true }),
      supabase.from("product_variants").select("*").in("product_id", productIds),
    ]);

    const catMap = (categories || []).reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {} as Record<string, Database["public"]["Tables"]["categories"]["Row"]>);

    const imgMap = (images || []).reduce((acc, img) => {
      acc[img.product_id] = acc[img.product_id] || [];
      acc[img.product_id].push(img);
      return acc;
    }, {} as Record<string, ProductImage[]>);

    const varMap = (variants || []).reduce((acc, v) => {
      acc[v.product_id] = acc[v.product_id] || [];
      acc[v.product_id].push(v);
      return acc;
    }, {} as Record<string, ProductVariant[]>);

    return products.map((p) => ({
      ...p,
      category: p.category_id ? catMap[p.category_id] || null : null,
      images: imgMap[p.id] || [],
      variants: varMap[p.id] || [],
    }));
  } catch (err) {
    console.error("Error fetching admin products list:", err);
    return [];
  }
}

/**
 * Fetches a single product by ID with full images and variants.
 */
export async function getAdminProductById(productId: string): Promise<ProductWithDetails | null> {
  try {
    const supabase = getAdminClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error || !product) return null;

    const [{ data: category }, { data: images }, { data: variants }] = await Promise.all([
      product.category_id
        ? supabase.from("categories").select("*").eq("id", product.category_id).single()
        : Promise.resolve({ data: null }),
      supabase.from("product_images").select("*").eq("product_id", product.id).order("display_order", { ascending: true }),
      supabase.from("product_variants").select("*").eq("product_id", product.id),
    ]);

    return {
      ...product,
      category: category || null,
      images: images || [],
      variants: variants || [],
    };
  } catch (err) {
    console.error("Error fetching admin product by ID:", err);
    return null;
  }
}

/**
 * Saves a product (insert or update) along with its images and variants.
 */
export async function saveProduct(input: ProductFormData) {
  const supabase = getAdminClient();

  const productData = {
    category_id: input.categoryId || null,
    title: input.title,
    slug: input.slug,
    description: input.description,
    base_price: input.basePrice,
    compare_at_price: input.compareAtPrice || null,
    availability_mode: input.availabilityMode,
    preparation_days: input.preparationDays,
    stock_quantity: input.stockQuantity,
    track_inventory: input.trackInventory,
    material: input.material || null,
    dimensions: input.dimensions || null,
    is_featured: input.isFeatured,
  };

  let productId = input.id;

  if (productId) {
    const { error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", productId);
    if (error) throw new Error(`Failed to update product: ${error.message}`);
  } else {
    const { data: newProd, error } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();
    if (error || !newProd) throw new Error(`Failed to create product: ${error?.message}`);
    productId = newProd.id;
  }

  // Handle images: delete and re-insert or update
  if (input.images && input.images.length > 0) {
    await supabase.from("product_images").delete().eq("product_id", productId);
    const imagesToInsert = input.images.map((img, idx) => ({
      product_id: productId!,
      image_url: img.imageUrl,
      alt_text: img.altText || input.title,
      display_order: img.displayOrder ?? idx,
      is_primary: img.isPrimary ?? idx === 0,
    }));
    await supabase.from("product_images").insert(imagesToInsert);
  }

  // Handle variants: delete and re-insert
  if (input.variants) {
    await supabase.from("product_variants").delete().eq("product_id", productId);
    if (input.variants.length > 0) {
      const variantsToInsert = input.variants.map((v) => ({
        product_id: productId!,
        option_name: v.optionName,
        option_value: v.optionValue,
        price_modifier: v.priceModifier || 0,
        stock_quantity: v.stockQuantity || 0,
        sku: v.sku || null,
      }));
      await supabase.from("product_variants").insert(variantsToInsert);
    }
  }

  return { success: true, productId };
}

/**
 * Toggles product archive state (soft delete).
 */
export async function toggleArchiveProduct(productId: string, isArchived: boolean) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update({ is_archived: isArchived })
    .eq("id", productId)
    .select()
    .single();

  if (error) throw new Error(`Failed to archive product: ${error.message}`);
  return data;
}

/**
 * One-click purge of all demo products and categories before handover to teacher.
 */
export async function purgeAllDemoData() {
  const supabase = getAdminClient();

  // Cascade will delete images, variants, etc.
  const { error: prodError } = await supabase.from("products").delete().eq("is_demo", true);
  if (prodError) throw new Error(`Failed to purge demo products: ${prodError.message}`);

  const { error: catError } = await supabase.from("categories").delete().eq("is_demo", true);
  if (catError) throw new Error(`Failed to purge demo categories: ${catError.message}`);

  return { success: true };
}

