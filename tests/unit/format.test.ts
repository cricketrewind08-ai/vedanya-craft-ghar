import { describe, it, expect } from "vitest";
import {
  formatDateIST,
  formatDateTimeIST,
  maskPhoneNumber,
  sanitizeForCSV,
} from "@/lib/utils/format";

describe("Formatting and Sanitization Utilities", () => {
  it("formats date strings into IST representation", () => {
    const formatted = formatDateIST("2026-02-16T10:00:00Z");
    expect(formatted).toMatch(/16\sFeb\s2026/);
  });

  it("handles null and undefined dates gracefully", () => {
    expect(formatDateIST(null)).toBe("—");
    expect(formatDateTimeIST(undefined)).toBe("—");
  });

  it("masks phone numbers for privacy", () => {
    expect(maskPhoneNumber("9876543210")).toBe("98****3210");
    expect(maskPhoneNumber(null)).toBe("—");
  });

  it("sanitizes CSV cells against formula injection attacks", () => {
    // Cells starting with =, +, -, @ should be prepended with a single quote
    expect(sanitizeForCSV("=SUM(A1:A10)")).toBe("`'=SUM(A1:A10)`".replace(/`/g, ""));
    expect(sanitizeForCSV("+919876543210")).toBe("`'+919876543210`".replace(/`/g, ""));
    expect(sanitizeForCSV("@admin")).toBe("`'@admin`".replace(/`/g, ""));
    // Standard alphanumeric text is unaffected
    expect(sanitizeForCSV("Ananya Sharma")).toBe("Ananya Sharma");
  });
});

