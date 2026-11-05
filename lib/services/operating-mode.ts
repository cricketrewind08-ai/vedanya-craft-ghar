import type { StoreMode, Database } from "@/lib/types/database";

type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"];
type PublicStoreSettings = Database["public"]["Views"]["public_store_settings"]["Row"];

export interface StoreModeStatus {
  mode: StoreMode;
  canOrder: boolean;
  canSubmitCustomOrder: boolean;
  bannerVisible: boolean;
  bannerTitle: string;
  bannerMessage: string;
  isMaintenance: boolean;
}

/**
 * Assesses the current operating mode and returns behavioral flags and customer-facing banners.
 */
export function evaluateStoreMode(
  settings: Partial<StoreSettings | PublicStoreSettings> | null | undefined
): StoreModeStatus {
  const mode: StoreMode = settings?.store_mode || "OPEN";
  const customOrdersEnabled = settings?.custom_orders_enabled ?? true;

  switch (mode) {
    case "MAINTENANCE":
      return {
        mode,
        canOrder: false,
        canSubmitCustomOrder: false,
        bannerVisible: true,
        bannerTitle: "Store Under Maintenance",
        bannerMessage:
          settings?.mode_message ||
          "We are currently updating our boutique creations. We will be back shortly!",
        isMaintenance: true,
      };

    case "VACATION":
      return {
        mode,
        canOrder: false,
        canSubmitCustomOrder: false,
        bannerVisible: true,
        bannerTitle: "We Are On Vacation",
        bannerMessage:
          settings?.mode_message ||
          (settings?.vacation_return_date
            ? `We are taking a short artisan break and will resume taking orders on ${settings.vacation_return_date}.`
            : "We are currently on break. Browsing is open; ordering is temporarily paused."),
        isMaintenance: false,
      };

    case "TEMPORARILY_CLOSED":
      return {
        mode,
        canOrder: false,
        canSubmitCustomOrder: false,
        bannerVisible: true,
        bannerTitle: "Ordering Temporarily Paused",
        bannerMessage:
          settings?.mode_message ||
          "We have reached our maximum order capacity for handmade creations. Browsing is open; orders will reopen soon!",
        isMaintenance: false,
      };

    case "CUSTOM_ORDERS_ONLY":
      return {
        mode,
        canOrder: false,
        canSubmitCustomOrder: customOrdersEnabled,
        bannerVisible: true,
        bannerTitle: "Custom Orders Only",
        bannerMessage:
          settings?.mode_message ||
          "Standard catalog checkout is currently paused while we prioritize personalized custom orders. Submit a custom enquiry below!",
        isMaintenance: false,
      };

    case "OPEN":
    default:
      return {
        mode: "OPEN",
        canOrder: true,
        canSubmitCustomOrder: customOrdersEnabled,
        bannerVisible: false,
        bannerTitle: "",
        bannerMessage: "",
        isMaintenance: false,
      };
  }
}

/**
 * Enforces server-side ordering validity. Throws a descriptive error if checkout is prohibited.
 */
export function assertCanPlaceOrder(mode: StoreMode): void {
  if (mode !== "OPEN") {
    switch (mode) {
      case "TEMPORARILY_CLOSED":
        throw new Error("Orders are temporarily paused due to artisan capacity.");
      case "VACATION":
        throw new Error("Store is currently on vacation. Ordering is paused.");
      case "CUSTOM_ORDERS_ONLY":
        throw new Error("Store is currently accepting custom order enquiries only.");
      case "MAINTENANCE":
        throw new Error("Store is undergoing maintenance. Please check back later.");
      default:
        throw new Error(`Ordering is not permitted in ${mode} mode.`);
    }
  }
}

/**
 * Enforces server-side custom enquiry validity.
 */
export function assertCanSubmitCustomOrder(
  mode: StoreMode,
  customOrdersEnabled: boolean
): void {
  if (mode === "MAINTENANCE") {
    throw new Error("Store is currently undergoing maintenance.");
  }
  if (!customOrdersEnabled) {
    throw new Error("Custom orders are currently disabled by the owner.");
  }
}

