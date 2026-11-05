import { z } from "zod";

export const storeModeEnum = z.enum([
  "OPEN",
  "TEMPORARILY_CLOSED",
  "VACATION",
  "CUSTOM_ORDERS_ONLY",
  "MAINTENANCE",
]);

export const storeSettingsSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required").max(100),
  tagline: z.string().trim().max(150),
  logoUrl: z.string().url().nullable().optional().or(z.literal("")),
  bannerUrl: z.string().url().nullable().optional().or(z.literal("")),
  aboutContent: z.string().trim().max(3000).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit WhatsApp number (without +91)")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  instagramUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  storeMode: storeModeEnum.default("OPEN"),
  modeMessage: z.string().trim().max(500).optional().or(z.literal("")),
  vacationReturnDate: z.string().optional().or(z.literal("")),
  defaultShippingCharge: z.number().min(0, "Shipping charge cannot be negative").default(80),
  freeShippingThreshold: z.number().min(0).nullable().optional(),
  minOrderAmount: z.number().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(3),
  processingTimeText: z.string().trim().max(200).optional().or(z.literal("")),
  policies: z.object({
    return_policy: z.string().trim().min(10, "Return policy is required"),
    shipping_policy: z.string().trim().min(10, "Shipping policy is required"),
    privacy_policy: z.string().trim().min(10, "Privacy policy is required"),
    terms_conditions: z.string().trim().min(10, "Terms and conditions are required"),
  }),
  customOrdersEnabled: z.boolean().default(true),
  isSetupCompleted: z.boolean().default(false),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

