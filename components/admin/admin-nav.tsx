"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  Users,
  Settings,
  Sparkles,
  ExternalLink,
  Store,
} from "lucide-react";
import { useSettings } from "@/components/providers/settings-provider";
import { switchStoreModeAction } from "@/app/actions/settings";
import type { StoreMode } from "@/lib/types/database";

const NAV_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const { settings, modeStatus } = useSettings();

  const handleModeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as StoreMode;
    await switchStoreModeAction(newMode);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#453C35] text-[#F8F4EC] flex items-center justify-center font-serif font-bold text-sm">
                V
              </span>
              <div>
                <span className="font-serif font-bold text-sm text-gray-900 block leading-tight">
                  {settings.business_name}
                </span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  Owner Workspace
                </span>
              </div>
            </Link>

            {/* Quick Storefront View */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 border border-gray-200 px-2.5 py-1 rounded-md transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-gray-50">
              <span
                className={`w-2 h-2 rounded-full ${
                  modeStatus.mode === "OPEN"
                    ? "bg-green-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              <span className="text-gray-500 text-[11px] hidden md:inline">Mode:</span>
              <select
                value={modeStatus.mode}
                onChange={handleModeChange}
                className="bg-transparent font-semibold text-xs text-gray-800 cursor-pointer focus:outline-none"
              >
                <option value="OPEN">OPEN (Ordering Active)</option>
                <option value="TEMPORARILY_CLOSED">TEMPORARILY CLOSED</option>
                <option value="VACATION">VACATION MODE</option>
                <option value="CUSTOM_ORDERS_ONLY">CUSTOM ORDERS ONLY</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#453C35] text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

