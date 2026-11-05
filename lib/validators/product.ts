import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().uuid().optional(),
  optionName: z.string().trim().min(1, "Option name is required (e.g. Color, Pack Size)"),
  optionValue: z.string().trim().min(1, "Option value is required (e.g. Pastel Pink)"),
  priceModifier: z.number().default(0),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative").default(0),
  sku: z.string().trim().optional().or(z.literal("")),
});

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid("Please select a category").nullable().optional(),
  title: z.string().trim().min(2, "Product title must be at least 2 characters").max(150),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().trim().min(10, "Please provide a helpful description for customers"),
  basePrice: z.number().min(0, "Price cannot be negative"),
  compareAtPrice: z.number().min(0).nullable().optional(),
  availabilityMode: z.enum([
    "READY_TO_SHIP",
    "MADE_TO_ORDER",
    "PRE_ORDER",
    "OUT_OF_STOCK",
    "HIDDEN",
  ]),
  preparationDays: z.number().int().min(0, "Preparation days must be 0 or more").default(2),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative").default(0),
  trackInventory: z.boolean().default(true),
  material: z.string().trim().max(200).optional().or(z.literal("")),
  dimensions: z.string().trim().max(200).optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  images: z.array(
    z.object({
      id: z.string().optional(),
      imageUrl: z.string().url("Valid image URL required"),
      altText: z.string().optional(),
      displayOrder: z.number().int().default(0),
      isPrimary: z.boolean().default(false),
    })
  ).min(1, "At least one product photo is required"),
  variants: z.array(variantSchema).default([]),
});

export type ProductFormInput = z.infer<typeof productSchema>;
export type VariantFormInput = z.infer<typeof variantSchema>;

