import { getAdminClient } from "@/lib/supabase/admin";
import { CustomersDirectoryView, type CustomerSummary } from "@/components/admin/customers-directory-view";

export const metadata = {
  title: "Customers Directory | Vedanya Owner Platform",
};

export default async function AdminCustomersPage() {
  const supabase = getAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("customer_name, customer_phone, customer_email, shipping_address, final_total, payment_status, status, created_at")
    .order("created_at", { ascending: false });

  // Aggregate by customer phone
  const customerMap = new Map<string, CustomerSummary>();

  for (const order of orders || []) {
    const phone = order.customer_phone.trim();
    const isRealizedRevenue = order.payment_status === "PAID" || order.status === "DELIVERED";
    const shipping = order.shipping_address as any;
    const city = shipping?.city || "Unknown";

    const existing = customerMap.get(phone);
    if (existing) {
      existing.totalOrders += 1;
      if (isRealizedRevenue) {
        existing.totalSpend += Number(order.final_total || 0);
      }
      if (!existing.email && order.customer_email) {
        existing.email = order.customer_email;
      }
    } else {
      customerMap.set(phone, {
        phone,
        name: order.customer_name,
        email: order.customer_email || null,
        city,
        totalOrders: 1,
        totalSpend: isRealizedRevenue ? Number(order.final_total || 0) : 0,
        lastOrderDate: order.created_at,
      });
    }
  }

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpend - a.totalSpend
  );

  return (
    <div className="p-6 md:p-8">
      <CustomersDirectoryView customers={customers} />
    </div>
  );
}

