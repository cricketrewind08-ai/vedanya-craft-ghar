"use server";

import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { getAdminStoreSettings } from "@/lib/services/settings";
import { assertCanSubmitCustomOrder } from "@/lib/services/operating-mode";
import { indianPhoneRegex } from "@/lib/validators/checkout";

const customOrderInputSchema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  customerPhone: z.string().trim().regex(indianPhoneRegex, "Enter a valid 10-digit mobile number"),
  customerEmail: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  description: z.string().trim().min(10, "Please provide some detail about your desired piece").max(1000),
  preferredColors: z.string().trim().max(200).optional().or(z.literal("")),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50),
  targetDate: z.string().optional().or(z.literal("")),
  honeypot: z.string().max(0, "Bot submission rejected"),
});

export type CustomOrderInput = z.infer<typeof customOrderInputSchema>;

export async function submitCustomOrderAction(rawInput: unknown) {
  try {
    const validated = customOrderInputSchema.parse(rawInput);

    // Verify operating mode
    const settings = await getAdminStoreSettings();
    assertCanSubmitCustomOrder(settings.store_mode, settings.custom_orders_enabled);

    const supabase = getAdminClient();

    // Generate Request Number from sequence
    const { data: seqData, error: seqError } = await supabase.rpc(
      "generate_custom_request_number" as any
    );

    let requestNumber: string;
    if (seqError || !seqData) {
      // Fallback format
      requestNumber = `CR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    } else {
      requestNumber = seqData as string;
    }

    const { data, error } = await supabase
      .from("custom_order_requests")
      .insert({
        request_number: requestNumber,
        customer_name: validated.customerName,
        customer_phone: validated.customerPhone,
        customer_email: validated.customerEmail || null,
        description: validated.description,
        preferred_colors: validated.preferredColors || null,
        quantity: validated.quantity,
        target_date: validated.targetDate || null,
        status: "NEW",
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to save enquiry: ${error?.message}`);
    }

    // Insert admin notification
    await supabase.from("notifications").insert({
      title: `New Custom Request: ${requestNumber}`,
      message: `${validated.customerName} requested a custom piece: "${validated.description.slice(0, 60)}..."`,
      type: "CUSTOM_ENQUIRY",
      reference_id: requestNumber,
    });

    return {
      success: true,
      requestNumber,
      whatsappNumber: settings.whatsapp_number,
    };
  } catch (err) {
    console.error("Custom order submission failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Submission failed",
    };
  }
}

