"use server";

import { getAdminClient } from "@/lib/supabase/admin";
import { orderTrackingSchema } from "@/lib/validators/checkout";
import { maskPhoneNumber } from "@/lib/utils/format";

// In-Memory rate limiting map: ip -> { count: number, resetAt: number }
const trackingAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = trackingAttempts.get(identifier);

  if (!entry || now > entry.resetAt) {
    trackingAttempts.set(identifier, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) {
    return false; // locked out
  }

  entry.count += 1;
  return true;
}

export interface TrackOrderResult {
  success: boolean;
  error?: string;
  order?: {
    orderNumber: string;
    createdAt: string;
    status: string;
    paymentStatus: string;
    customerName: string;
    maskedPhone: string;
    customerVisibleNote?: string | null;
    adjustmentAmount?: number;
    adjustmentReason?: string | null;
    subtotal: number;
    shippingCharge: number;
    finalTotal: number;
    items: Array<{
      title: string;
      variantLabel?: string | null;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
    history: Array<{
      status: string;
      createdAt: string;
      note?: string | null;
    }>;
    shippingAddress: {
      city: string;
      state: string;
      pinCode: string;
      district: string;
      houseBuilding: string;
      streetLocality: string;
    };
    businessSnapshot: any;
  };
}

export async function trackOrderAction(
  orderNumber: string,
  phone: string,
  clientIp: string = "default"
): Promise<TrackOrderResult> {
  try {
    const validated = orderTrackingSchema.parse({
      orderNumber,
      phone,
    });

    // Rate Limit Guard: 5 failed attempts per 15 minutes
    const allowed = checkRateLimit(`${clientIp}_${validated.orderNumber}`);
    if (!allowed) {
      return {
        success: false,
        error:
          "Too many attempts. For security, please wait 15 minutes before trying again.",
      };
    }

    const supabase = getAdminClient();

    // Query order strictly by order_number AND customer_phone
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", validated.orderNumber)
      .eq("customer_phone", validated.phone)
      .single();

    if (error || !order) {
      // Generic error: never reveal whether orderNumber or phone was incorrect
      return {
        success: false,
        error: "Order not found or contact number does not match records.",
      };
    }

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    const { data: orderHistory } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", order.id);

    const items = (orderItems || []).map((i) => ({
      title: i.product_title_snapshot,
      variantLabel: i.variant_snapshot,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      lineTotal: i.line_total,
    }));

    const history = (orderHistory || [])
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      .map((h) => ({
        status: h.new_status,
        createdAt: h.created_at,
        note: h.note,
      }));

    return {
      success: true,
      order: {
        orderNumber: order.order_number,
        createdAt: order.created_at,
        status: order.status,
        paymentStatus: order.payment_status,
        customerName: order.customer_name,
        maskedPhone: maskPhoneNumber(order.customer_phone),
        customerVisibleNote: order.customer_visible_note,
        adjustmentAmount: order.adjustment_amount,
        adjustmentReason: order.adjustment_reason,
        subtotal: order.subtotal,
        shippingCharge: order.shipping_charge,
        finalTotal: order.final_total,
        items,
        history,
        shippingAddress: order.shipping_address as any,
        businessSnapshot: order.business_snapshot,
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Could not track order. Please verify input.",
    };
  }
}
