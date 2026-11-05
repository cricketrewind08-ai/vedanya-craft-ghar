import { describe, it, expect } from "vitest";
import { storeSettingsSchema } from "@/lib/validators/settings";

describe("Store Settings Schema Validation", () => {
  const validSettings = {
    businessName: "Vedanya Craft Ghar",
    tagline: "Handmade with love",
    logoUrl: "https://example.com/logo.png",
    bannerUrl: "",
    aboutContent: "Artisan crafts hand-crocheted in India.",
    address: "123 Artisan Street, Jaipur, Rajasthan",
    phone: "9876543210",
    whatsappNumber: "9876543210",
    email: "owner@vedanyacraftghar.com",
    instagramUrl: "https://instagram.com/vedanyacraftghar",
    storeMode: "OPEN" as const,
    modeMessage: "",
    vacationReturnDate: "",
    defaultShippingCharge: 80,
    freeShippingThreshold: 999,
    minOrderAmount: 0,
    lowStockThreshold: 3,
    processingTimeText: "2-4 days",
    policies: {
      return_policy: "Returns accepted for transit damage only.",
      shipping_policy: "Dispatched within 2-4 business days.",
      privacy_policy: "Your data is never sold or shared.",
      terms_conditions: "Handmade variations are natural.",
    },
    customOrdersEnabled: true,
    isSetupCompleted: true,
  };

  it("validates correct full settings input", () => {
    const result = storeSettingsSchema.safeParse(validSettings);
    expect(result.success).toBe(true);
  });

  it("permits unconfigured phone, whatsapp, and address (initial owner state)", () => {
    const unconfigured = {
      ...validSettings,
      phone: "",
      whatsappNumber: "",
      address: "",
      email: "",
      logoUrl: "",
    };
    const result = storeSettingsSchema.safeParse(unconfigured);
    expect(result.success).toBe(true);
  });

  it("rejects invalid 9-digit phone or invalid format", () => {
    const invalidPhone = {
      ...validSettings,
      phone: "12345",
    };
    const result = storeSettingsSchema.safeParse(invalidPhone);
    expect(result.success).toBe(false);
  });

  it("rejects negative shipping charge", () => {
    const negativeShipping = {
      ...validSettings,
      defaultShippingCharge: -50,
    };
    const result = storeSettingsSchema.safeParse(negativeShipping);
    expect(result.success).toBe(false);
  });

  it("enforces mandatory policy text", () => {
    const missingPolicy = {
      ...validSettings,
      policies: {
        return_policy: "",
        shipping_policy: "Dispatched within 2-4 business days.",
        privacy_policy: "Your data is never sold.",
        terms_conditions: "All pieces are unique.",
      },
    };
    const result = storeSettingsSchema.safeParse(missingPolicy);
    expect(result.success).toBe(false);
  });
});

