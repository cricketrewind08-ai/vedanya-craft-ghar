import { describe, it, expect } from "vitest";
import {
  evaluateStoreMode,
  assertCanPlaceOrder,
  assertCanSubmitCustomOrder,
} from "@/lib/services/operating-mode";

describe("Operating Mode Engine", () => {
  it("evaluates OPEN mode correctly", () => {
    const status = evaluateStoreMode({ store_mode: "OPEN" });
    expect(status.mode).toBe("OPEN");
    expect(status.canOrder).toBe(true);
    expect(status.canSubmitCustomOrder).toBe(true);
    expect(status.bannerVisible).toBe(false);
    expect(status.isMaintenance).toBe(false);
  });

  it("evaluates TEMPORARILY_CLOSED mode and blocks ordering", () => {
    const status = evaluateStoreMode({
      store_mode: "TEMPORARILY_CLOSED",
      mode_message: "Taking a quick breather to pack orders!",
    });
    expect(status.mode).toBe("TEMPORARILY_CLOSED");
    expect(status.canOrder).toBe(false);
    expect(status.bannerVisible).toBe(true);
    expect(status.bannerMessage).toBe("Taking a quick breather to pack orders!");
  });

  it("evaluates VACATION mode with return date", () => {
    const status = evaluateStoreMode({
      store_mode: "VACATION",
      vacation_return_date: "2026-12-01",
    });
    expect(status.mode).toBe("VACATION");
    expect(status.canOrder).toBe(false);
    expect(status.bannerVisible).toBe(true);
    expect(status.bannerMessage).toContain("2026-12-01");
  });

  it("evaluates CUSTOM_ORDERS_ONLY mode", () => {
    const status = evaluateStoreMode({
      store_mode: "CUSTOM_ORDERS_ONLY",
      custom_orders_enabled: true,
    });
    expect(status.mode).toBe("CUSTOM_ORDERS_ONLY");
    expect(status.canOrder).toBe(false);
    expect(status.canSubmitCustomOrder).toBe(true);
    expect(status.bannerVisible).toBe(true);
  });

  it("evaluates MAINTENANCE mode", () => {
    const status = evaluateStoreMode({ store_mode: "MAINTENANCE" });
    expect(status.mode).toBe("MAINTENANCE");
    expect(status.canOrder).toBe(false);
    expect(status.canSubmitCustomOrder).toBe(false);
    expect(status.isMaintenance).toBe(true);
  });

  describe("Server-Side Order Placement Assertion", () => {
    it("allows order placement in OPEN mode", () => {
      expect(() => assertCanPlaceOrder("OPEN")).not.toThrow();
    });

    it("throws clear error when placing order in TEMPORARILY_CLOSED mode", () => {
      expect(() => assertCanPlaceOrder("TEMPORARILY_CLOSED")).toThrowError(
        /temporarily paused/i
      );
    });

    it("throws clear error when placing order in VACATION mode", () => {
      expect(() => assertCanPlaceOrder("VACATION")).toThrowError(/vacation/i);
    });

    it("throws clear error when placing order in CUSTOM_ORDERS_ONLY mode", () => {
      expect(() => assertCanPlaceOrder("CUSTOM_ORDERS_ONLY")).toThrowError(
        /custom order/i
      );
    });

    it("throws clear error when placing order in MAINTENANCE mode", () => {
      expect(() => assertCanPlaceOrder("MAINTENANCE")).toThrowError(/maintenance/i);
    });
  });

  describe("Server-Side Custom Order Submission Assertion", () => {
    it("allows custom order when enabled and not in maintenance", () => {
      expect(() => assertCanSubmitCustomOrder("OPEN", true)).not.toThrow();
      expect(() =>
        assertCanSubmitCustomOrder("CUSTOM_ORDERS_ONLY", true)
      ).not.toThrow();
    });

    it("throws when custom orders are disabled by owner", () => {
      expect(() => assertCanSubmitCustomOrder("OPEN", false)).toThrowError(
        /disabled/i
      );
    });

    it("throws when store is in MAINTENANCE mode", () => {
      expect(() => assertCanSubmitCustomOrder("MAINTENANCE", true)).toThrowError(
        /maintenance/i
      );
    });
  });
});

