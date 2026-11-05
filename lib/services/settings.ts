import { getAdminClient } from "@/lib/supabase/admin";
import type { Database, StoreMode } from "@/lib/types/database";
import { storeSettingsSchema, type StoreSettingsInput } from "@/lib/validators/settings";

type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"];
type StoreSettingsUpdate = Database["public"]["Tables"]["store_settings"]["Update"];
type PublicStoreSettings = Database["public"]["Views"]["public_store_settings"]["Row"];

export const DEFAULT_SETTINGS: PublicStoreSettings = {
  business_name: "Vedanya Craft Ghar",
  tagline: "Handmade with love",
  logo_url: null,
  banner_url: null,
  about_content:
    "Welcome to Vedanya Craft Ghar. Every single creation here is handcrafted with patience, artistry, and love.",
  address: null,
  phone: null,
  whatsapp_number: null,
  email: null,
  instagram_url: "https://instagram.com/vedanyacraftghar",
  other_social: [],
  store_mode: "OPEN",
  mode_message: null,
  vacation_return_date: null,
  default_shipping_charge: 80,
  free_shipping_threshold: 999,
  min_order_amount: 0,
  processing_time_text: "2-4 business days for in-stock items, 5-7 days for made-to-order",
  policies: {
    return_policy:
      "Because our items are handmade with love, returns are accepted within 3 days of delivery only in cases of verified transit damage. Please record an unboxing video upon receipt.",
    shipping_policy:
      "We ship all across India using trusted courier partners. Dispatch is within 2-4 business days of order confirmation.",
    privacy_policy:
      "Your personal phone number and shipping address are strictly used to process your order and coordinate delivery. We never share or sell customer data.",
    terms_conditions:
      "All pieces are unique and handmade; subtle variations in weave, texture and shade are the hallmark of authentic artisan crafts.",
  },
  custom_orders_enabled: true,
  is_setup_completed: false,
};

/**
 * Fetches the public settings for the customer storefront.
 * Safe to call from React Server Components.
 */
export async function getPublicStoreSettings(): Promise<PublicStoreSettings> {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from("public_store_settings")
      .select("*")
      .single();

    if (error || !data) {
      console.warn("Failed to fetch public_store_settings, using fallback:", error?.message);
      return DEFAULT_SETTINGS;
    }

    return data as PublicStoreSettings;
  } catch (err) {
    console.warn("Error getting public store settings, using defaults:", err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Fetches the full raw store settings record for the admin dashboard.
 */
export async function getAdminStoreSettings(): Promise<StoreSettings> {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from("store_settings")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .single();

  if (error || !data) {
    throw new Error(`Failed to load store settings: ${error?.message || "Not found"}`);
  }

  return data;
}

/**
 * Updates store settings, validates with Zod, writes to database,
 * and records a diff in the settings_history table.
 */
export async function updateStoreSettings(
  input: StoreSettingsInput,
  adminUserId?: string
): Promise<StoreSettings> {
  // Validate input
  const validated = storeSettingsSchema.parse(input);

  const adminClient = getAdminClient();

  // Get current settings to compute diff
  const current = await getAdminStoreSettings();

  const updates: StoreSettingsUpdate = {
    business_name: validated.businessName,
    tagline: validated.tagline,
    logo_url: validated.logoUrl || null,
    banner_url: validated.bannerUrl || null,
    about_content: validated.aboutContent || null,
    address: validated.address || null,
    phone: validated.phone || null,
    whatsapp_number: validated.whatsappNumber || null,
    email: validated.email || null,
    instagram_url: validated.instagramUrl || null,
    store_mode: validated.storeMode,
    mode_message: validated.modeMessage || null,
    vacation_return_date: validated.vacationReturnDate || null,
    default_shipping_charge: validated.defaultShippingCharge,
    free_shipping_threshold: validated.freeShippingThreshold ?? null,
    min_order_amount: validated.minOrderAmount,
    low_stock_threshold: validated.lowStockThreshold,
    processing_time_text: validated.processingTimeText || null,
    policies: validated.policies,
    custom_orders_enabled: validated.customOrdersEnabled,
    is_setup_completed: validated.isSetupCompleted,
  };

  // Compute diff
  const diff: Record<string, { old: unknown; new: unknown }> = {};
  for (const [key, val] of Object.entries(updates)) {
    const oldVal = (current as unknown as Record<string, unknown>)[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(val)) {
      diff[key] = { old: oldVal, new: val };
    }
  }

  // Update store_settings
  const { data: updated, error } = await adminClient
    .from("store_settings")
    .update(updates)
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .select()
    .single();

  if (error || !updated) {
    throw new Error(`Failed to update store settings: ${error?.message}`);
  }

  // Record history if changes occurred
  if (Object.keys(diff).length > 0) {
    await adminClient.from("settings_history").insert({
      changed_by: adminUserId || null,
      diff: JSON.parse(JSON.stringify(diff)),
    });
  }

  return updated;
}

/**
 * 1-click update of store operating mode with optional message / return date.
 */
export async function updateStoreMode(
  newMode: StoreMode,
  modeMessage?: string | null,
  vacationReturnDate?: string | null,
  adminUserId?: string
): Promise<StoreSettings> {
  const adminClient = getAdminClient();
  const current = await getAdminStoreSettings();

  const updates: StoreSettingsUpdate = {
    store_mode: newMode,
    mode_message: modeMessage ?? current.mode_message,
    vacation_return_date: vacationReturnDate ?? current.vacation_return_date,
  };

  const { data: updated, error } = await adminClient
    .from("store_settings")
    .update(updates)
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .select()
    .single();

  if (error || !updated) {
    throw new Error(`Failed to switch store mode: ${error?.message}`);
  }

  await adminClient.from("settings_history").insert({
    changed_by: adminUserId || null,
    diff: JSON.parse(
      JSON.stringify({
        store_mode: { old: current.store_mode, new: newMode },
        mode_message: { old: current.mode_message, new: updates.mode_message },
        vacation_return_date: {
          old: current.vacation_return_date,
          new: updates.vacation_return_date,
        },
      })
    ),
  });

  return updated;
}
