import { describe, it, expect } from "vitest";
import { formatINR } from "@/lib/utils/currency";

describe("Currency Utility (formatINR)", () => {
  it("formats positive whole numbers with rupee symbol and Indian grouping", () => {
    const result = formatINR(1000);
    // en-IN should format as ₹1,000
    expect(result).toContain("1,000");
    expect(result).toMatch(/₹|INR/);
  });

  it("formats large amounts with lakhs grouping", () => {
    const result = formatINR(125000);
    // en-IN should format as 1,25,000
    expect(result).toContain("1,25,000");
  });

  it("handles null, undefined, or empty gracefully", () => {
    expect(formatINR(null)).toContain("0");
    expect(formatINR(undefined)).toContain("0");
    expect(formatINR("invalid")).toContain("0");
  });

  it("formats decimals when showDecimals is true", () => {
    const result = formatINR(899.5, true);
    expect(result).toContain("899.50");
  });
});

