"use client";

import { useState } from "react";
import {
  Store,
  ShieldCheck,
  Truck,
  FileText,
  Clock,
  History,
  Save,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Lock,
  PauseCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { updateStoreSettingsAction, switchStoreModeAction } from "@/app/actions/settings";
import type { StoreMode, Database } from "@/lib/types/database";

type SettingsRow = Database["public"]["Tables"]["store_settings"]["Row"];
type SettingsHistoryRow = Database["public"]["Tables"]["settings_history"]["Row"];

interface StoreSettingsViewProps {
  initialSettings: SettingsRow;
  history: SettingsHistoryRow[];
}

export function StoreSettingsView({ initialSettings, history }: StoreSettingsViewProps) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Operating Mode State
  const [storeMode, setStoreMode] = useState<StoreMode>(initialSettings.store_mode);
  const [modeMessage, setModeMessage] = useState(initialSettings.mode_message || "");
  const [vacationReturnDate, setVacationReturnDate] = useState(
    initialSettings.vacation_return_date ? initialSettings.vacation_return_date.slice(0, 10) : ""
  );

  // Business Profile
  const [businessName, setBusinessName] = useState(initialSettings.business_name);
  const [tagline, setTagline] = useState(initialSettings.tagline);
  const [phone, setPhone] = useState(initialSettings.phone || "");
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsapp_number || "");
  const [email, setEmail] = useState(initialSettings.email || "");
  const [instagramUrl, setInstagramUrl] = useState(initialSettings.instagram_url || "");
  const [address, setAddress] = useState(initialSettings.address || "");
  const [aboutContent, setAboutContent] = useState(initialSettings.about_content || "");

  // Shipping & Orders
  const [defaultShippingCharge, setDefaultShippingCharge] = useState(
    initialSettings.default_shipping_charge
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | "">(
    initialSettings.free_shipping_threshold ?? ""
  );
  const [minOrderAmount, setMinOrderAmount] = useState(initialSettings.min_order_amount);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialSettings.low_stock_threshold
  );
  const [processingTimeText, setProcessingTimeText] = useState(
    initialSettings.processing_time_text || ""
  );
  const [customOrdersEnabled, setCustomOrdersEnabled] = useState(
    initialSettings.custom_orders_enabled
  );

  // Policies
  const policiesObj = (initialSettings.policies as any) || {};
  const [returnPolicy, setReturnPolicy] = useState(
    policiesObj.return_policy ||
      "Every piece is handcrafted with utmost care. Due to the artisanal nature of our crafts, returns are accepted only for transit damage reported within 24 hours of delivery."
  );
  const [shippingPolicy, setShippingPolicy] = useState(
    policiesObj.shipping_policy ||
      "All orders are carefully wrapped and dispatched via trusted courier partners across India. Tracking details are provided upon dispatch."
  );
  const [privacyPolicy, setPrivacyPolicy] = useState(
    policiesObj.privacy_policy ||
      "Your personal information (name, phone, address) is collected solely for fulfilling your order and is never shared or sold."
  );
  const [termsConditions, setTermsConditions] = useState(
    policiesObj.terms_conditions ||
      "By placing an order request on Vedanya Craft Ghar, you agree to our handcrafted production terms and two-stage order confirmation process."
  );

  // 1-Click Mode Switcher Handler
  const handleModeSwitch = async (newMode: StoreMode) => {
    if (
      newMode !== "OPEN" &&
      !confirm(
        `Are you sure you want to switch store mode to "${newMode.replace(/_/g, " ")}"? Customers will see announcement banners and restrictions.`
      )
    ) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const res = await switchStoreModeAction(
      newMode,
      modeMessage.trim() || undefined,
      newMode === "VACATION" && vacationReturnDate ? vacationReturnDate : undefined
    );

    setSaving(false);
    if (res.success) {
      setStoreMode(newMode);
      setSuccess(`Store operating mode successfully switched to ${newMode.replace(/_/g, " ")}!`);
    } else {
      setError(res.error || "Failed to switch mode");
    }
  };

  // Full Settings Form Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const res = await updateStoreSettingsAction({
      businessName,
      tagline,
      phone: phone.trim() || "",
      whatsappNumber: whatsappNumber.trim() || "",
      email: email.trim() || "",
      instagramUrl: instagramUrl.trim() || "",
      address: address.trim() || "",
      aboutContent: aboutContent.trim() || "",
      storeMode,
      modeMessage: modeMessage.trim() || "",
      vacationReturnDate: vacationReturnDate || "",
      defaultShippingCharge: Number(defaultShippingCharge),
      freeShippingThreshold:
        freeShippingThreshold === "" || Number(freeShippingThreshold) <= 0
          ? null
          : Number(freeShippingThreshold),
      minOrderAmount: Number(minOrderAmount),
      lowStockThreshold: Number(lowStockThreshold),
      processingTimeText: processingTimeText.trim() || "",
      customOrdersEnabled,
      isSetupCompleted: true,
      policies: {
        return_policy: returnPolicy,
        shipping_policy: shippingPolicy,
        privacy_policy: privacyPolicy,
        terms_conditions: termsConditions,
      },
    });

    setSaving(false);
    if (res.success) {
      setSuccess("Store settings and policies saved successfully!");
    } else {
      setError(res.error || "Failed to save settings");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Store Settings & Operating Modes</h1>
        <p className="text-sm text-gray-500">
          Manage your boutique's operating status, contact details, shipping rates, and buyer policies.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 1. Operating Mode Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#B97968]" />
            <h2 className="font-serif text-base font-bold text-gray-900">
              1-Click Operating Mode Switcher
            </h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F8F4EC] text-[#B97968] border border-[#B97968]/30">
            Current: {storeMode.replace(/_/g, " ")}
          </span>
        </div>

        <p className="text-xs text-gray-500">
          Need to take a break or pause incoming orders during exams or family vacation? Switch modes with one click.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* OPEN */}
          <button
            type="button"
            onClick={() => handleModeSwitch("OPEN")}
            className={`p-4 rounded-xl border text-left transition ${
              storeMode === "OPEN"
                ? "border-green-500 bg-green-50/50 ring-2 ring-green-500/20"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                Normal Operations
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <p className="font-semibold text-sm text-gray-900">OPEN</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Store is fully active. Customers can browse and submit order requests.
            </p>
          </button>

          {/* TEMPORARILY_CLOSED */}
          <button
            type="button"
            onClick={() => handleModeSwitch("TEMPORARILY_CLOSED")}
            className={`p-4 rounded-xl border text-left transition ${
              storeMode === "TEMPORARILY_CLOSED"
                ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Pause Orders
              </span>
              <PauseCircle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-semibold text-sm text-gray-900">TEMPORARILY CLOSED</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Disables checkout with a banner. Browsing catalog remains visible.
            </p>
          </button>

          {/* VACATION */}
          <button
            type="button"
            onClick={() => handleModeSwitch("VACATION")}
            className={`p-4 rounded-xl border text-left transition ${
              storeMode === "VACATION"
                ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Holiday / Away
              </span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <p className="font-semibold text-sm text-gray-900">VACATION</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Displays vacation banner with your return date. Orders paused.
            </p>
          </button>

          {/* CUSTOM_ORDERS_ONLY */}
          <button
            type="button"
            onClick={() => handleModeSwitch("CUSTOM_ORDERS_ONLY")}
            className={`p-4 rounded-xl border text-left transition ${
              storeMode === "CUSTOM_ORDERS_ONLY"
                ? "border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Bespoke Only
              </span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <p className="font-semibold text-sm text-gray-900">CUSTOM ORDERS ONLY</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Disables ready stock cart, directs visitors to the Custom Request form.
            </p>
          </button>

          {/* MAINTENANCE */}
          <button
            type="button"
            onClick={() => handleModeSwitch("MAINTENANCE")}
            className={`p-4 rounded-xl border text-left transition ${
              storeMode === "MAINTENANCE"
                ? "border-red-500 bg-red-50/50 ring-2 ring-red-500/20"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                Site Maintenance
              </span>
              <Lock className="w-4 h-4 text-red-600" />
            </div>
            <p className="font-semibold text-sm text-gray-900">MAINTENANCE</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Maintenance splash banner across the storefront while updating products.
            </p>
          </button>
        </div>

        {/* Mode Message & Return Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Announcement Banner Message (Shown at top of website)
            </label>
            <input
              type="text"
              value={modeMessage}
              onChange={(e) => setModeMessage(e.target.value)}
              placeholder="e.g. We are handcrafting our festival collection! Normal dispatch resumes Monday."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Vacation Return Date (Optional)
            </label>
            <input
              type="date"
              value={vacationReturnDate}
              onChange={(e) => setVacationReturnDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
            />
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 2. Business Profile */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Store className="w-5 h-5 text-[#B97968]" />
            <h2 className="font-serif text-base font-bold text-gray-900">Business Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                WhatsApp Number (10 digits)
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customer Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. hello@vedanyacraft.in"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Instagram URL / Handle
              </label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/vedanya.craftghar"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Studio / City Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Bengaluru, Karnataka, India"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              About Bio (Artisan Story for About Page)
            </label>
            <textarea
              rows={3}
              value={aboutContent}
              onChange={(e) => setAboutContent(e.target.value)}
              placeholder="Tell your customers the story of your handmade craft journey..."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
            />
          </div>
        </div>

        {/* 3. Shipping & Order Rules */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Truck className="w-5 h-5 text-[#B97968]" />
            <h2 className="font-serif text-base font-bold text-gray-900">
              Shipping & Order Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Default Flat Delivery Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                value={defaultShippingCharge}
                onChange={(e) => setDefaultShippingCharge(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Free Delivery Above (₹, optional)
              </label>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) =>
                  setFreeShippingThreshold(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="e.g. 1500 (leave blank if none)"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Minimum Order Value (₹)
              </label>
              <input
                type="number"
                min="0"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-28 px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
              <span className="text-[11px] text-gray-400 ml-2">Alert when stock falls below this</span>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="customEnabledCheck"
                checked={customOrdersEnabled}
                onChange={(e) => setCustomOrdersEnabled(e.target.checked)}
                className="rounded text-[#B97968] focus:ring-[#B97968] w-4 h-4"
              />
              <label htmlFor="customEnabledCheck" className="text-xs text-gray-700 font-medium">
                Enable Custom Craft Order Requests page on storefront
              </label>
            </div>
          </div>
        </div>

        {/* 4. Policies */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileText className="w-5 h-5 text-[#B97968]" />
            <h2 className="font-serif text-base font-bold text-gray-900">Store Policies</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Return & Cancellation Policy
              </label>
              <textarea
                rows={2}
                value={returnPolicy}
                onChange={(e) => setReturnPolicy(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Shipping & Delivery Policy
              </label>
              <textarea
                rows={2}
                value={shippingPolicy}
                onChange={(e) => setShippingPolicy(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Privacy Policy
              </label>
              <textarea
                rows={2}
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                rows={2}
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#B97968] text-white rounded-xl text-sm font-semibold hover:bg-[#a66858] transition shadow disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Settings
          </button>
        </div>
      </form>

      {/* 5. Audit Trail */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <History className="w-4 h-4 text-[#B97968]" />
          <h2 className="font-serif text-sm font-bold text-gray-900">Settings Change Audit Trail</h2>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-gray-400 py-3 text-center italic">No settings changes recorded yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {history.slice(0, 10).map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800">
                    Updated by {h.changed_by || "Admin"}
                  </span>
                  <p className="text-[11px] text-gray-400">
                    Changed: {h.diff && typeof h.diff === "object" ? Object.keys(h.diff).join(", ") : "Settings updated"}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(h.created_at).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
