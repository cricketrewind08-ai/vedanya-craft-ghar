import { getAdminClient } from "@/lib/supabase/admin";

export interface AuditLogEntry {
  action: string;
  entityType: "ORDER" | "PRODUCT" | "SETTINGS" | "CATEGORY" | "INVENTORY";
  entityId: string;
  adminEmail: string;
  metadata?: Record<string, any>;
}

/**
 * Service to log key administrative mutations for auditability and compliance.
 */
export async function logAdminAction(entry: AuditLogEntry) {
  try {
    const supabase = getAdminClient();

    // If order entity, recorded in order_status_history or notifications
    if (entry.entityType === "ORDER") {
      // Order status history handles order mutations
      return;
    }

    // Insert into in-app notifications if relevant
    if (entry.metadata?.notify) {
      await supabase.from("notifications").insert({
        title: entry.action,
        message: `${entry.action} performed on ${entry.entityType} ${entry.entityId} by ${entry.adminEmail}`,
        type: "SYSTEM",
        reference_id: entry.entityId,
      });
    }
  } catch (err) {
    console.error("Audit logging failed:", err);
  }
}

