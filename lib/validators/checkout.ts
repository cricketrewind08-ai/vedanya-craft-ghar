import { z } from "zod";

export const INDIAN_STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const indianPhoneRegex = /^[6-9]\d{9}$/;
export const indianPinCodeRegex = /^[1-9][0-9]{5}$/;

export const checkoutAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, "Enter a valid 10-digit Indian mobile number"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  houseBuilding: z
    .string()
    .trim()
    .min(1, "House / Flat / Building is required")
    .max(150, "Address is too long"),
  streetLocality: z
    .string()
    .trim()
    .min(2, "Street / Locality is required")
    .max(200, "Street name is too long"),
  landmark: z.string().trim().max(100).optional().or(z.literal("")),
  pinCode: z
    .string()
    .trim()
    .regex(indianPinCodeRegex, "Enter a valid 6-digit Indian PIN code"),
  city: z.string().trim().min(2, "City is required").max(100),
  district: z.string().trim().min(2, "District is required").max(100),
  state: z.string().refine((val) => (INDIAN_STATES_AND_UTS as readonly string[]).includes(val), {
    message: "Please select a valid Indian State or Union Territory",
  }),
  orderNotes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional().or(z.literal("")),
});

export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;

export const orderItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  variantId: z.string().uuid("Invalid variant ID").nullable().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50, "Maximum 50 per item"),
});

export const createOrderInputSchema = checkoutAddressSchema.extend({
  items: z.array(orderItemSchema).min(1, "Your cart is empty"),
  orderSource: z
    .enum(["WEBSITE", "MANUAL_WHATSAPP", "MANUAL_INSTAGRAM", "MANUAL_OTHER"])
    .default("WEBSITE"),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export const orderTrackingSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(5, "Enter a valid Order Number (e.g. VCG-2026-1001)"),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, "Enter the 10-digit mobile number used when placing the order"),
});

export type OrderTrackingInput = z.infer<typeof orderTrackingSchema>;

