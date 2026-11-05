import { getAdminClient } from "@/lib/supabase/admin";
import type { Database, OrderStatus, PaymentStatus, OrderSource } from "@/lib/types/database";

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderStatusHistory = Database["public"]["Tables"]["order_status_history"]["Row"];

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  history: OrderStatusHistory[];
}

export interface AdminOrderFilters {
  status?: string; // "all", "pending", "in-progress", "completed", "cancelled"
  search?: string;
  limit?: number;
}

/**
 * Fetches orders for the admin command center with search and filtering.
 */
export async function getAdminOrders(
  filters: AdminOrderFilters = {}
): Promise<OrderWithDetails[]> {
  try {
    const supabase = getAdminClient();

    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

    if (filters.status) {
      if (filters.status === "pending") {
        query = query.eq("status", "PENDING_APPROVAL");
      } else if (filters.status === "in-progress") {
        query = query.in("status", ["CONFIRMED", "PREPARING", "READY_TO_SHIP"]);
      } else if (filters.status === "completed") {
        query = query.in("status", ["SHIPPED", "DELIVERED"]);
      } else if (filters.status === "cancelled") {
        query = query.in("status", ["REJECTED", "CANCELLED"]);
      }
    }

    if (filters.search && filters.search.trim() !== "") {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`order_number.ilike.${term},customer_name.ilike.${term},customer_phone.ilike.${term}`);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data: orders, error } = await query;
    if (error || !orders) return [];

    // Fetch items and history for these orders
    const orderIds = orders.map((o) => o.id);
    if (orderIds.length === 0) return [];

    const [{ data: allItems }, { data: allHistory }] = await Promise.all([
      supabase.from("order_items").select("*").in("order_id", orderIds),
      supabase.from("order_status_history").select("*").in("order_id", orderIds),
    ]);

    const itemsByOrder = (allItems || []).reduce((acc, item) => {
      acc[item.order_id] = acc[item.order_id] || [];
      acc[item.order_id].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);

    const historyByOrder = (allHistory || []).reduce((acc, h) => {
      acc[h.order_id] = acc[h.order_id] || [];
      acc[h.order_id].push(h);
      return acc;
    }, {} as Record<string, OrderStatusHistory[]>);

    return orders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
      history: (historyByOrder[order.id] || []).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    }));
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    return [];
  }
}

/**
 * Fetches a single order by ID with items and full history.
 */
export async function getAdminOrderById(orderId: string): Promise<OrderWithDetails | null> {
  try {
    const supabase = getAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) return null;

    const [{ data: items }, { data: history }] = await Promise.all([
      supabase.from("order_items").select("*").eq("order_id", order.id),
      supabase.from("order_status_history").select("*").eq("order_id", order.id),
    ]);

    return {
      ...order,
      items: items || [],
      history: (history || []).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    };
  } catch (err) {
    console.error("Error fetching admin order:", err);
    return null;
  }
}

/**
 * Approves a pending order with stock reservation, optional price adjustment, and owner notes.
 */
export async function approveOrder(
  orderId: string,
  adminEmail: string,
  adjustmentAmount: number = 0,
  adjustmentReason?: string,
  ownerNote?: string
) {
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc("approve_order_rpc", {
    p_order_id: orderId,
    p_admin_email: adminEmail,
    p_adjustment_amount: adjustmentAmount,
    p_adjustment_reason: adjustmentReason || null,
    p_owner_note: ownerNote || null,
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

/**
 * Rejects or cancels an order and releases any reserved inventory.
 */
export async function rejectOrCancelOrder(
  orderId: string,
  newStatus: "REJECTED" | "CANCELLED",
  adminEmail: string,
  reason: string
) {
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc("reject_or_cancel_order_rpc", {
    p_order_id: orderId,
    p_new_status: newStatus,
    p_admin_email: adminEmail,
    p_reason: reason,
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

/**
 * Updates an in-progress order status with valid progression.
 */
export async function advanceOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminEmail: string,
  note?: string
) {
  const supabase = getAdminClient();

  if (newStatus === "SHIPPED" || newStatus === "DELIVERED") {
    const { data, error } = await supabase.rpc("fulfill_order_rpc", {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_admin_email: adminEmail,
      p_tracking_note: note || null,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  // Other status changes (e.g. PREPARING, READY_TO_SHIP)
  const { data: order } = await supabase.from("orders").select("status").eq("id", orderId).single();
  const oldStatus = order?.status;

  const { data, error } = await supabase
    .from("orders")
    .update({ status: newStatus, customer_visible_note: note || undefined })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    old_status: oldStatus || null,
    new_status: newStatus,
    changed_by: adminEmail,
    note: note || `Order advanced to ${newStatus}`,
  });

  return data;
}

/**
 * Updates manual payment status (UNPAID, PAID, REFUNDED).
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  adminEmail: string
) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    new_status: data.status,
    changed_by: adminEmail,
    note: `Payment status marked as ${paymentStatus}`,
  });

  return data;
}

/**
 * Creates a manual order logged by the owner (Instagram, WhatsApp, In-Person).
 */
export async function createManualOrder(input: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: any;
  orderSource: OrderSource;
  subtotal: number;
  shippingCharge: number;
  finalTotal: number;
  ownerNotes?: string;
  items: Array<{
    productId: string;
    variantId?: string | null;
    title: string;
    variantLabel?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  adminEmail: string;
}) {
  const supabase = getAdminClient();

  // Generate order number
  const { data: seqData } = await supabase.rpc("generate_order_number" as any);
  const orderNumber = (seqData as string) || `VCG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const trackingHash = Math.random().toString(36).substring(2, 15);

  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .single();

  const { data: newOrder, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      tracking_hash: trackingHash,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail || null,
      shipping_address: input.shippingAddress,
      owner_notes: input.ownerNotes || null,
      status: "CONFIRMED",
      payment_status: "UNPAID",
      subtotal: input.subtotal,
      shipping_charge: input.shippingCharge,
      final_total: input.finalTotal,
      order_source: input.orderSource,
      business_snapshot: settings || {},
    })
    .select()
    .single();

  if (error || !newOrder) throw new Error(`Failed to create manual order: ${error?.message}`);

  // Insert items
  const itemsToInsert = input.items.map((i) => ({
    order_id: newOrder.id,
    product_id: i.productId,
    variant_id: i.variantId || null,
    product_title_snapshot: i.title,
    variant_snapshot: i.variantLabel || null,
    quantity: i.quantity,
    unit_price: i.unitPrice,
    line_total: i.lineTotal,
  }));

  await supabase.from("order_items").insert(itemsToInsert);

  await supabase.from("order_status_history").insert({
    order_id: newOrder.id,
    new_status: "CONFIRMED",
    changed_by: input.adminEmail,
    note: `Manual order created via ${input.orderSource}`,
  });

  return newOrder;
}

