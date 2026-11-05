import { getAdminClient } from "@/lib/supabase/admin";
import { sanitizeForCSV } from "@/lib/utils/format";

export interface DashboardMetrics {
  pendingOrdersCount: number;
  inProgressOrdersCount: number;
  completedOrdersCount: number;
  // STRICT RULE: Revenue ONLY from orders marked PAID or DELIVERED
  realRevenue: number;
  lowStockCount: number;
  customEnquiriesCount: number;
}

export interface CustomerSummary {
  phone: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  cities: string[];
}

/**
 * Calculates dashboard metrics strictly following master prompt accounting rules.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const supabase = getAdminClient();

    const [
      { count: pendingCount },
      { count: inProgressCount },
      { count: completedCount },
      { data: revenueOrders },
      { data: lowStockProducts },
      { count: enquiriesCount },
    ] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "PENDING_APPROVAL"),
      supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["CONFIRMED", "PREPARING", "READY_TO_SHIP"]),
      supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["SHIPPED", "DELIVERED"]),
      // REAL REVENUE ONLY from orders marked PAID or DELIVERED
      supabase.from("orders").select("final_total").or("payment_status.eq.PAID,status.eq.DELIVERED"),
      supabase.from("products").select("id").eq("is_archived", false).lte("stock_quantity", 3),
      supabase.from("custom_order_requests").select("*", { count: "exact", head: true }).eq("status", "NEW"),
    ]);

    const realRevenue = (revenueOrders || []).reduce(
      (sum, o) => sum + (Number(o.final_total) || 0),
      0
    );

    return {
      pendingOrdersCount: pendingCount || 0,
      inProgressOrdersCount: inProgressCount || 0,
      completedOrdersCount: completedCount || 0,
      realRevenue,
      lowStockCount: lowStockProducts?.length || 0,
      customEnquiriesCount: enquiriesCount || 0,
    };
  } catch (err) {
    console.error("Error computing dashboard metrics:", err);
    return {
      pendingOrdersCount: 0,
      inProgressOrdersCount: 0,
      completedOrdersCount: 0,
      realRevenue: 0,
      lowStockCount: 0,
      customEnquiriesCount: 0,
    };
  }
}

/**
 * Aggregates unique customers grouped by phone number with lifetime spend and order count.
 */
export async function getCustomersDirectory(): Promise<CustomerSummary[]> {
  try {
    const supabase = getAdminClient();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("customer_phone, customer_name, final_total, created_at, shipping_address")
      .order("created_at", { ascending: false });

    if (error || !orders) return [];

    const grouped: Record<string, CustomerSummary> = {};

    for (const order of orders) {
      const phone = order.customer_phone;
      const addr = order.shipping_address as any;
      const city = addr?.city || "Unknown";

      if (!grouped[phone]) {
        grouped[phone] = {
          phone,
          name: order.customer_name,
          totalOrders: 1,
          totalSpent: Number(order.final_total) || 0,
          lastOrderDate: order.created_at,
          cities: [city],
        };
      } else {
        grouped[phone].totalOrders += 1;
        grouped[phone].totalSpent += Number(order.final_total) || 0;
        if (!grouped[phone].cities.includes(city)) {
          grouped[phone].cities.push(city);
        }
      }
    }

    return Object.values(grouped).sort((a, b) => b.totalSpent - a.totalSpent);
  } catch (err) {
    console.error("Error generating customers directory:", err);
    return [];
  }
}

/**
 * Generates CSV content from customer directory with mandatory formula injection sanitization.
 */
export function generateCustomersCSV(customers: CustomerSummary[]): string {
  const headers = ["Customer Name", "Phone Number", "Total Orders", "Lifetime Spent (INR)", "Last Order Date", "Locations"];
  const rows = customers.map((c) => [
    sanitizeForCSV(c.name),
    sanitizeForCSV(`+91 ${c.phone}`),
    sanitizeForCSV(c.totalOrders),
    sanitizeForCSV(c.totalSpent.toFixed(2)),
    sanitizeForCSV(new Date(c.lastOrderDate).toLocaleDateString("en-IN")),
    sanitizeForCSV(c.cities.join("; ")),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

