import { describe, it, expect } from "vitest";
import { createOrderInputSchema } from "@/lib/validators/checkout";

describe("Checkout Order Validation", () => {
  const validOrderInput = {
    fullName: "Rohan Patel",
    phone: "9823456789",
    email: "rohan@example.com",
    houseBuilding: "Villa 14, Palm Meadows",
    streetLocality: "Whitefield Road",
    landmark: "Behind Forum Mall",
    pinCode: "560066",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    state: "Karnataka",
    orderNotes: "Gift wrap please!",
    items: [
      {
        productId: "22222222-2222-2222-2222-222222222201",
        variantId: "33333333-3333-3333-3333-333333333301",
        quantity: 1,
      },
    ],
    orderSource: "WEBSITE" as const,
  };

  it("accepts valid full order submission payload", () => {
    const res = createOrderInputSchema.safeParse(validOrderInput);
    expect(res.success).toBe(true);
  });

  it("rejects empty cart items array", () => {
    const emptyCart = {
      ...validOrderInput,
      items: [],
    };
    const res = createOrderInputSchema.safeParse(emptyCart);
    expect(res.success).toBe(false);
  });

  it("rejects invalid item quantity (less than 1)", () => {
    const invalidQty = {
      ...validOrderInput,
      items: [
        {
          productId: "22222222-2222-2222-2222-222222222201",
          quantity: 0,
        },
      ],
    };
    const res = createOrderInputSchema.safeParse(invalidQty);
    expect(res.success).toBe(false);
  });

  it("rejects invalid item UUID", () => {
    const invalidUuid = {
      ...validOrderInput,
      items: [
        {
          productId: "not-a-uuid",
          quantity: 1,
        },
      ],
    };
    const res = createOrderInputSchema.safeParse(invalidUuid);
    expect(res.success).toBe(false);
  });
});

