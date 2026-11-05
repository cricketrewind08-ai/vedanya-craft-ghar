"use server";

import { revalidatePath } from "next/cache";
import { updateStoreSettings, updateStoreMode } from "@/lib/services/settings";
import { storeSettingsSchema, type StoreSettingsInput } from "@/lib/validators/settings";
import type { StoreMode } from "@/lib/types/database";

export async function updateStoreSettingsAction(input: StoreSettingsInput) {
  try {
    const validated = storeSettingsSchema.parse(input);
    const updated = await updateStoreSettings(validated);
    revalidatePath("/", "layout");
    return { success: true, settings: updated };
  } catch (error) {
    console.error("Failed to update store settings action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update settings",
    };
  }
}

export async function switchStoreModeAction(
  newMode: StoreMode,
  message?: string | null,
  vacationDate?: string | null
) {
  try {
    const updated = await updateStoreMode(newMode, message, vacationDate);
    revalidatePath("/", "layout");
    return { success: true, settings: updated };
  } catch (error) {
    console.error("Failed to switch store mode:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to switch store mode",
    };
  }
}

