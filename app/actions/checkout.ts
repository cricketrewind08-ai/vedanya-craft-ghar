"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import { getAdminStoreSettings } from "@/lib/services/settings";
import { assertCanPlaceOrder } from "@/lib/services/operating-mode";
import { createOrderInputSchema, type CreateOrderInput } from "@/lib/validators/checkout";

export interface OrderSubmissionResult {
  success: boolean;
  orderNumber?: string;
  trackingHash?: string;
  finalTotal?: number;
  error?: string;
}

export async function submitOrderAction(
  rawInput: unknown
): Promise<OrderSubmissionResult> {
  try {
    const validated: CreateOrderInput = createOrderInputSchema.parse(rawInput);

    // 1. Verify store operating mode server-side
    const settings = await getAdminStoreSettings();
    assertCanPlaceOrder(settings.store_mode);

    // 2. Format payload for create_order_rpc
    const shippingAddress = {
      houseBuilding: validated.houseBuilding,
      streetLocality: validated.streetLocality,
      landmark: validated.landmark || null,
      pinCode: validated.pinCode,
      city: validated.city,
      district: validated.district,
      state: validated.state,
    };

    const itemsPayload = validated.items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId || null,
      quantity: item.quantity,
    }));

    const supabase = getAdminClient();

    // 3. Call transactional Postgres RPC
    const { data, error } = await supabase.rpc("create_order_rpc", {
      p_customer_name: validated.fullName,
      p_customer_phone: validated.phone,
      p_customer_email: validated.email || null,
      p_shipping_address: shippingAddress,
      p_order_notes: validated.orderNotes || null,
      p_order_source: validated.orderSource || "WEBSITE",
      p_items: itemsPayload,
    });

    if (error || !data) {
      console.error("Order creation RPC error:", error);
      return {
        success: false,
        error: error?.message || "Failed to process order request.",
      };
    }

    const result = data as {
      order_id: string;
      order_number: string;
      tracking_hash: string;
      final_total: number;
    };

    return {
      success: true,
      orderNumber: result.order_number,
      trackingHash: result.tracking_hash,
      finalTotal: result.final_total,
    };
  } catch (err) {
    console.error("Order action error:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while placing your order request.",
    };
  }
}

