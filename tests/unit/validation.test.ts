import { describe, it, expect } from "vitest";
import {
  indianPhoneRegex,
  indianPinCodeRegex,
  checkoutAddressSchema,
} from "@/lib/validators/checkout";

describe("Validation Utilities", () => {
  describe("Indian Phone Regex", () => {
    it("accepts valid 10-digit Indian numbers starting with 6, 7, 8, or 9", () => {
      expect(indianPhoneRegex.test("9876543210")).toBe(true);
      expect(indianPhoneRegex.test("8123456789")).toBe(true);
      expect(indianPhoneRegex.test("7000000000")).toBe(true);
      expect(indianPhoneRegex.test("6999999999")).toBe(true);
    });

    it("rejects numbers starting with 0-5 or wrong length", () => {
      expect(indianPhoneRegex.test("5123456789")).toBe(false);
      expect(indianPhoneRegex.test("09876543210")).toBe(false);
      expect(indianPhoneRegex.test("987654321")).toBe(false);
      expect(indianPhoneRegex.test("98765432100")).toBe(false);
      expect(indianPhoneRegex.test("abcdefghij")).toBe(false);
    });
  });

  describe("Indian PIN Code Regex", () => {
    it("accepts valid 6-digit Indian PIN codes starting with 1-9", () => {
      expect(indianPinCodeRegex.test("110001")).toBe(true);
      expect(indianPinCodeRegex.test("560001")).toBe(true);
      expect(indianPinCodeRegex.test("600028")).toBe(true);
    });

    it("rejects PIN codes starting with 0 or incorrect length", () => {
      expect(indianPinCodeRegex.test("010001")).toBe(false);
      expect(indianPinCodeRegex.test("56001")).toBe(false);
      expect(indianPinCodeRegex.test("5600001")).toBe(false);
      expect(indianPinCodeRegex.test("56A001")).toBe(false);
    });
  });

  describe("Checkout Address Schema", () => {
    const validData = {
      fullName: "Ananya Sharma",
      phone: "9876543210",
      email: "ananya@example.com",
      houseBuilding: "Flat 402, Lotus Apartments",
      streetLocality: "12th Main, Indiranagar",
      landmark: "Near BDA Complex",
      pinCode: "560038",
      city: "Bengaluru",
      district: "Bengaluru Urban",
      state: "Karnataka",
      orderNotes: "Please deliver before Friday.",
    };

    it("successfully parses valid customer checkout payload", () => {
      const parsed = checkoutAddressSchema.safeParse(validData);
      expect(parsed.success).toBe(true);
    });

    it("fails when phone number is invalid", () => {
      const parsed = checkoutAddressSchema.safeParse({
        ...validData,
        phone: "1234567890",
      });
      expect(parsed.success).toBe(false);
    });

    it("fails when PIN code is invalid", () => {
      const parsed = checkoutAddressSchema.safeParse({
        ...validData,
        pinCode: "012345",
      });
      expect(parsed.success).toBe(false);
    });

    it("fails when an invalid state name is provided", () => {
      const parsed = checkoutAddressSchema.safeParse({
        ...validData,
        state: "California",
      });
      expect(parsed.success).toBe(false);
    });
  });
});

