"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ArrowLeft, Sparkles, Store, Phone, Truck, Shield } from "lucide-react";
import { updateStoreSettingsAction } from "@/app/actions/settings";
import type { StoreSettingsInput } from "@/lib/validators/settings";
import type { Database } from "@/lib/types/database";

type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"];

interface SetupWizardProps {
  initialSettings: StoreSettings;
}

export function SetupWizard({ initialSettings }: SetupWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<StoreSettingsInput>({
    businessName: initialSettings.business_name || "Vedanya Craft Ghar",
    tagline: initialSettings.tagline || "Handmade with love",
    logoUrl: initialSettings.logo_url || "",
    bannerUrl: initialSettings.banner_url || "",
    aboutContent: initialSettings.about_content || "",
    address: initialSettings.address || "",
    phone: initialSettings.phone || "",
    whatsappNumber: initialSettings.whatsapp_number || "",
    email: initialSettings.email || "",
    instagramUrl: initialSettings.instagram_url || "",
    storeMode: initialSettings.store_mode || "OPEN",
    modeMessage: initialSettings.mode_message || "",
    vacationReturnDate: initialSettings.vacation_return_date || "",
    defaultShippingCharge: Number(initialSettings.default_shipping_charge) || 80,
    freeShippingThreshold: initialSettings.free_shipping_threshold ? Number(initialSettings.free_shipping_threshold) : 999,
    minOrderAmount: Number(initialSettings.min_order_amount) || 0,
    lowStockThreshold: initialSettings.low_stock_threshold || 3,
    processingTimeText: initialSettings.processing_time_text || "",
    policies: initialSettings.policies as any,
    customOrdersEnabled: initialSettings.custom_orders_enabled ?? true,
    isSetupCompleted: true,
  });

  const saveCurrentStep = async (markComplete: boolean = false) => {
    setSaving(true);
    await updateStoreSettingsAction({
      ...formData,
      isSetupCompleted: markComplete ? true : initialSettings.is_setup_completed,
    });
    setSaving(false);
  };

  const handleNext = async () => {
    await saveCurrentStep(false);
    if (step < 4) {
      setStep(step + 1);
    } else {
      await saveCurrentStep(true);
      router.push("/admin");
    }
  };

  const handleSkip = async () => {
    await saveCurrentStep(true);
    router.push("/admin");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Wizard Header */}
      <div className="p-6 bg-[#F8F4EC] border-b border-gray-200 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B97968] font-semibold">
            First-Time Store Setup
          </span>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-0.5">
            Welcome to Your Artisan Dashboard
          </h2>
        </div>
        <button
          onClick={handleSkip}
          className="text-xs text-gray-500 hover:text-gray-900 underline"
        >
          Skip for now
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex border-b border-gray-100 text-xs">
        <div className={`flex-1 py-2 text-center font-medium ${step >= 1 ? "bg-[#B97968] text-white" : "bg-gray-50 text-gray-400"}`}>
          1. Brand Info
        </div>
        <div className={`flex-1 py-2 text-center font-medium ${step >= 2 ? "bg-[#B97968] text-white" : "bg-gray-50 text-gray-400"}`}>
          2. Contacts
        </div>
        <div className={`flex-1 py-2 text-center font-medium ${step >= 3 ? "bg-[#B97968] text-white" : "bg-gray-50 text-gray-400"}`}>
          3. Shipping
        </div>
        <div className={`flex-1 py-2 text-center font-medium ${step >= 4 ? "bg-[#B97968] text-white" : "bg-gray-50 text-gray-400"}`}>
          4. Policies
        </div>
      </div>

      {/* Step Form */}
      <div className="p-6 sm:p-8 space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#B97968]" />
              Store Identity
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Store Business Name *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-[#B97968] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tagline *
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-[#B97968] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Artisan Story / About Text
              </label>
              <textarea
                rows={3}
                value={formData.aboutContent || ""}
                onChange={(e) => setFormData({ ...formData, aboutContent: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-[#B97968] focus:outline-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#B97968]" />
              Studio Contact Channels
            </h3>
            <p className="text-xs text-gray-500">
              Customers will see these to reach you or receive WhatsApp order updates.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                WhatsApp Number (10 digits)
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={formData.whatsappNumber || ""}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-[#B97968] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone Number (Calls)
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-[#B97968] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Studio Address (City / State)
              </label>
              <input
                type="text"
                placeholder="e.g. Jaipur, Rajasthan"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-[#B97968] focus:outline-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#B97968]" />
              Shipping Rules across India
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Flat Shipping Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.defaultShippingCharge}
                onChange={(e) => setFormData({ ...formData, defaultShippingCharge: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-[#B97968] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.freeShippingThreshold || ""}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-[#B97968] focus:outline-none"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#B97968]" />
              Store Policies Review
            </h3>
            <p className="text-xs text-gray-500">
              Starter templates tailored for handcrafted Indian artisan businesses. You can edit anytime.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Return & Cancellation Policy
              </label>
              <textarea
                rows={2}
                value={formData.policies.return_policy}
                onChange={(e) => setFormData({
                  ...formData,
                  policies: { ...formData.policies, return_policy: e.target.value },
                })}
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-[#B97968] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Shipping Policy
              </label>
              <textarea
                rows={2}
                value={formData.policies.shipping_policy}
                onChange={(e) => setFormData({
                  ...formData,
                  policies: { ...formData.policies, shipping_policy: e.target.value },
                })}
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-[#B97968] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-[#453C35] hover:bg-black text-white text-xs font-semibold tracking-wide flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <span>{saving ? "Saving..." : step === 4 ? "Complete Setup & Launch" : "Save & Continue"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

