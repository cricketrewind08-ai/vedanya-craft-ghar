import { describe, it, expect } from "vitest";
import { generateOrderSummaryPDF } from "@/lib/pdf/order-summary-pdf";

describe("Order Summary PDF Generation", () => {
  const sampleOrder = {
    orderNumber: "VCG-2026-1001",
    createdAt: "2026-02-16T10:00:00Z",
    status: "PENDING_APPROVAL",
    customerName: "Aarav Sharma",
    customerPhone: "9876543210",
    customerEmail: "aarav@example.com",
    shippingAddress: {
      houseBuilding: "House 10",
      streetLocality: "Artisan Lane",
      landmark: "Near Temple",
      city: "Jaipur",
      district: "Jaipur",
      state: "Rajasthan",
      pinCode: "302001",
    },
    orderNotes: "Handle with extra care",
    items: [
      {
        title: "Handcrafted Daisy Crochet Tote Bag",
        variantLabel: "Warm Terracotta",
        quantity: 1,
        unitPrice: 899,
        lineTotal: 899,
      },
    ],
    subtotal: 899,
    shippingCharge: 80,
    finalTotal: 979,
    businessSnapshot: {
      business_name: "Vedanya Craft Ghar",
      tagline: "Handmade with love",
      whatsapp_number: "9876543210",
      email: "hello@vedanyacraftghar.com",
    },
  };

  it("generates a provisional order PDF document without crashing", () => {
    const doc = generateOrderSummaryPDF(sampleOrder);
    expect(doc).toBeDefined();
    // Check output data URI string length
    const output = doc.output("datauristring");
    expect(output.startsWith("data:application/pdf")).toBe(true);
    expect(output.length).toBeGreaterThan(1000);
  });

  it("generates a confirmed order PDF with owner payment notes", () => {
    const confirmedOrder = {
      ...sampleOrder,
      status: "CONFIRMED",
      adjustmentAmount: 20,
      adjustmentReason: "Custom gift box wrapping",
      customerVisibleNote: "Please pay via UPI to: vedanya@upi. Thank you!",
      finalTotal: 999,
    };

    const doc = generateOrderSummaryPDF(confirmedOrder);
    expect(doc).toBeDefined();
    const output = doc.output("datauristring");
    expect(output.length).toBeGreaterThan(1000);
  });

  it("handles missing optional contacts gracefully without blanks", () => {
    const minimalOrder = {
      ...sampleOrder,
      customerEmail: null,
      orderNotes: null,
      businessSnapshot: {
        business_name: "Vedanya Craft Ghar",
        tagline: "Handmade with love",
        // No phone, email or address
      },
    };

    const doc = generateOrderSummaryPDF(minimalOrder);
    expect(doc).toBeDefined();
  });
});

