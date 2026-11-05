/**
 * WhatsApp Business Cloud API Integration Boundary
 *
 * Implements a safe notification abstraction:
 * - If credentials (WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN) are provided,
 *   sends official template notifications.
 * - If unconfigured (default), logs cleanly and returns status { sent: false, reason: "NOT_CONFIGURED" }
 *   without disrupting the checkout or admin approval flow.
 * - Customer & owner deep links (wa.me) serve as the zero-cost reliable primary channel.
 */

export interface WhatsAppNotificationResult {
  sent: boolean;
  messageId?: string;
  reason?: "NOT_CONFIGURED" | "INVALID_PHONE" | "API_ERROR" | "SUCCESS";
  error?: string;
}

export interface WhatsAppTemplatePayload {
  toPhone: string;
  templateName: string;
  languageCode?: string;
  parameters: Record<string, string | number>;
}

export class WhatsAppProvider {
  private static phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private static accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  /**
   * Returns true if official WhatsApp Cloud API is configured.
   */
  public static isConfigured(): boolean {
    return Boolean(this.phoneNumberId && this.accessToken);
  }

  /**
   * Sends a template notification or falls back gracefully.
   */
  public static async sendTemplateNotification(
    payload: WhatsAppTemplatePayload
  ): Promise<WhatsAppNotificationResult> {
    if (!this.isConfigured()) {
      // Clean fallback: Not configured, deep-links used instead
      return {
        sent: false,
        reason: "NOT_CONFIGURED",
      };
    }

    try {
      const cleanPhone = payload.toPhone.replace(/\D/g, "");
      const recipient = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

      const body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "template",
        template: {
          name: payload.templateName,
          language: {
            code: payload.languageCode || "en",
          },
          components: [
            {
              type: "body",
              parameters: Object.entries(payload.parameters).map(([key, val]) => ({
                type: "text",
                text: String(val),
              })),
            },
          ],
        },
      };

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        console.error("WhatsApp Cloud API error:", json);
        return {
          sent: false,
          reason: "API_ERROR",
          error: json?.error?.message || "WhatsApp Cloud API error",
        };
      }

      return {
        sent: true,
        messageId: json?.messages?.[0]?.id,
        reason: "SUCCESS",
      };
    } catch (err) {
      console.error("WhatsApp notification dispatch exception:", err);
      return {
        sent: false,
        reason: "API_ERROR",
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }

  /**
   * Helper to construct one-click wa.me chat links with pre-filled messages.
   */
  public static generateDeepLink(phone: string, text: string): string {
    const raw = phone.replace(/\D/g, "");
    const intl = raw.length === 10 ? `91${raw}` : raw;
    return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
  }
}

