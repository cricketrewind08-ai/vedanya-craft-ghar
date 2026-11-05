"use client";

import React, { createContext, useContext } from "react";
import type { Database } from "@/lib/types/database";
import { evaluateStoreMode, type StoreModeStatus } from "@/lib/services/operating-mode";

type PublicStoreSettings = Database["public"]["Views"]["public_store_settings"]["Row"];

interface SettingsContextValue {
  settings: PublicStoreSettings;
  modeStatus: StoreModeStatus;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: PublicStoreSettings;
  children: React.ReactNode;
}) {
  const modeStatus = evaluateStoreMode(settings);

  return (
    <SettingsContext.Provider value={{ settings, modeStatus }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

/**
 * Visual store mode banner component rendered on customer storefront.
 */
export function StoreModeBanner() {
  const { modeStatus } = useSettings();

  if (!modeStatus.bannerVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Store Status Announcement"
      className="bg-[#B97968]/15 border-b border-[#B97968]/30 px-4 py-2.5 text-center text-xs sm:text-sm text-[#453C35]"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
        <span className="font-semibold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-[#B97968] text-white">
          {modeStatus.bannerTitle}
        </span>
        <span className="text-[#453C35]">{modeStatus.bannerMessage}</span>
      </div>
    </aside>
  );
}

