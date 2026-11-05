"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  User,
  MapPin,
  FileCheck2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  checkoutAddressSchema,
  INDIAN_STATES_AND_UTS,
  type CheckoutAddressInput,
} from "@/lib/validators/checkout";
import { submitOrderAction } from "@/app/actions/checkout";
import { useCartStore } from "@/lib/store/cart";
import { useSettings } from "@/components/providers/settings-provider";
import { formatINR } from "@/lib/utils/currency";

interface CheckoutFormProps {
  isQuickPurchase: boolean;
}

type CheckoutStep = "contact" | "address" | "review";

export function CheckoutForm({ isQuickPurchase }: CheckoutFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("contact");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items: cartItems, quickItem, clearCart, clearQuickItem } = useCartStore();
  const { settings } = useSettings();

  // Active items for this checkout session
  const activeItems = isQuickPurchase
    ? quickItem
      ? [
          {
            productId: quickItem.productId,
            variantId: quickItem.variantId,
            title: quickItem.title,
            variantLabel: quickItem.variantLabel,
            unitPrice: quickItem.unitPrice,
            imageUrl: quickItem.imageUrl,
            quantity: quickItem.quantity,
          },
        ]
      : []
    : cartItems.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        title: i.title,
        variantLabel: i.variantLabel,
        unitPrice: i.unitPrice,
        imageUrl: i.imageUrl,
        quantity: i.quantity,
      }));

  const subtotal = activeItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );
  const freeThreshold = settings.free_shipping_threshold ?? 999;
  const isFreeShipping = subtotal >= freeThreshold;
  const shippingCharge = isFreeShipping ? 0 : settings.default_shipping_charge;
  const estimatedTotal = subtotal + shippingCharge;

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CheckoutAddressInput>({
    resolver: zodResolver(checkoutAddressSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      houseBuilding: "",
      streetLocality: "",
      landmark: "",
      pinCode: "",
      city: "",
      district: "",
      state: "Rajasthan",
      orderNotes: "",
    },
  });

  const nextFromContact = async () => {
    const valid = await trigger(["fullName", "phone", "email"]);
    if (valid) {
      setCurrentStep("address");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const nextFromAddress = async () => {
    const valid = await trigger([
      "houseBuilding",
      "streetLocality",
      "pinCode",
      "city",
      "district",
      "state",
    ]);
    if (valid) {
      setCurrentStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onFinalSubmit = async () => {
    if (activeItems.length === 0) {
      setServerError("Your basket is empty. Please add items to checkout.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const formValues = getValues();

    const payload = {
      ...formValues,
      items: activeItems.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      orderSource: "WEBSITE",
    };

    const res = await submitOrderAction(payload);

    if (!res.success) {
      setServerError(res.error || "Order submission failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Clear appropriate session state
    if (isQuickPurchase) {
      clearQuickItem();
    } else {
      clearCart();
    }

    // Redirect to confirmation page with tracking hash
    router.push(`/order/${res.orderNumber}?key=${res.trackingHash}`);
  };

  if (activeItems.length === 0) {
    return (
      <div className="bg-white/80 p-8 rounded-2xl border border-[#D8CCBE] text-center max-w-md mx-auto">
        <p className="font-serif text-lg text-[#453C35] font-semibold mb-2">
          Nothing to check out
        </p>
        <p className="text-xs text-[#7D726A] mb-4">
          Please add items to your basket or select Quick Purchase on a product.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="px-6 py-2.5 bg-[#B97968] text-white rounded text-xs font-semibold tracking-wider uppercase shadow-warm"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 7 cols: 3-Step Form */}
      <div className="lg:col-span-7 bg-white/80 rounded-2xl border border-[#D8CCBE] shadow-warm p-6 sm:p-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#D8CCBE]">
          <div
            className={`flex items-center gap-2 ${
              currentStep === "contact"
                ? "text-[#B97968] font-semibold"
                : "text-[#453C35]"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                currentStep !== "contact"
                  ? "bg-[#A3AA8C] text-white"
                  : "bg-[#B97968] text-white"
              }`}
            >
              {currentStep !== "contact" ? <Check className="w-3.5 h-3.5" /> : "1"}
            </div>
            <span className="text-xs uppercase tracking-wider hidden sm:inline">
              Contact
            </span>
          </div>

          <div className="flex-1 h-0.5 mx-3 bg-[#D8CCBE]" />

          <div
            className={`flex items-center gap-2 ${
              currentStep === "address"
                ? "text-[#B97968] font-semibold"
                : "text-[#7D726A]"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                currentStep === "review"
                  ? "bg-[#A3AA8C] text-white"
                  : currentStep === "address"
                  ? "bg-[#B97968] text-white"
                  : "bg-[#E9DCCB] text-[#7D726A]"
              }`}
            >
              {currentStep === "review" ? <Check className="w-3.5 h-3.5" /> : "2"}
            </div>
            <span className="text-xs uppercase tracking-wider hidden sm:inline">
              Delivery
            </span>
          </div>

          <div className="flex-1 h-0.5 mx-3 bg-[#D8CCBE]" />

          <div
            className={`flex items-center gap-2 ${
              currentStep === "review"
                ? "text-[#B97968] font-semibold"
                : "text-[#7D726A]"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                currentStep === "review"
                  ? "bg-[#B97968] text-white"
                  : "bg-[#E9DCCB] text-[#7D726A]"
              }`}
            >
              3
            </div>
            <span className="text-xs uppercase tracking-wider hidden sm:inline">
              Review
            </span>
          </div>
        </div>

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onFinalSubmit)}>
          {/* STEP 1: Contact Details */}
          {currentStep === "contact" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[#453C35] mb-2">
                <User className="w-4 h-4 text-[#B97968]" />
                <h2 className="font-serif text-lg font-semibold">
                  1. Contact Information
                </h2>
              </div>
              <p className="text-xs text-[#7D726A]">
                We use your 10-digit mobile number for WhatsApp updates and delivery tracking.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Iyer"
                  {...register("fullName")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
                {errors.fullName && (
                  <p className="text-red-600 text-[11px] mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
                  10-Digit Indian Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#7D726A] font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    {...register("phone")}
                    className="w-full pl-12 pr-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-600 text-[11px] mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="For provisional order copy"
                  {...register("email")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
                {errors.email && (
                  <p className="text-red-600 text-[11px] mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={nextFromContact}
                  className="px-6 py-3 rounded-md bg-[#B97968] hover:bg-[#A66757] text-white text-xs font-semibold tracking-wider uppercase shadow-warm flex items-center gap-2 transition-all"
                >
                  <span>Continue to Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Address */}
          {currentStep === "address" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[#453C35] mb-2">
                <MapPin className="w-4 h-4 text-[#B97968]" />
                <h2 className="font-serif text-lg font-semibold">
                  2. Indian Delivery Address
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
                  House / Flat / Building Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 302, Sai Vihar Apartments"
                  {...register("houseBuilding")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
                {errors.houseBuilding && (
                  <p className="text-red-600 text-[11px] mt-1">
                    {errors.houseBuilding.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
                  Street / Locality *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5th Cross, Malleshwaram"
                  {...register("streetLocality")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
                {errors.streetLocality && (
                  <p className="text-red-600 text-[11px] mt-1">
                    {errors.streetLocality.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Metro Station"
                    {...register("landmark")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
                    6-Digit PIN Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 560003"
                    maxLength={6}
                    {...register("pinCode")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                  />
                  {errors.pinCode && (
                    <p className="text-red-600 text-[11px] mt-1">
                      {errors.pinCode.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    {...register("city")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                  />
                  {errors.city && (
                    <p className="text-red-600 text-[11px] mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
                    District *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru Urban"
                    {...register("district")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                  />
                  {errors.district && (
                    <p className="text-red-600 text-[11px] mt-1">
                      {errors.district.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
                    State / UT *
                  </label>
                  <select
                    {...register("state")}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                  >
                    {INDIAN_STATES_AND_UTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
                  Delivery Notes / Gift Message (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or handwritten note request..."
                  {...register("orderNotes")}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep("contact")}
                  className="inline-flex items-center gap-1.5 text-xs text-[#7D726A] hover:text-[#453C35]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Contact</span>
                </button>

                <button
                  type="button"
                  onClick={nextFromAddress}
                  className="px-6 py-3 rounded-md bg-[#B97968] hover:bg-[#A66757] text-white text-xs font-semibold tracking-wider uppercase shadow-warm flex items-center gap-2 transition-all"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {currentStep === "review" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#453C35] mb-2">
                <FileCheck2 className="w-4 h-4 text-[#B97968]" />
                <h2 className="font-serif text-lg font-semibold">
                  3. Review Order Request
                </h2>
              </div>

              {/* Contact Snapshot */}
              <div className="p-4 rounded-xl bg-[#F8F4EC] border border-[#D8CCBE] space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#D8CCBE]/60">
                  <span className="font-semibold text-[#453C35]">Recipient & Delivery</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep("address")}
                    className="text-[#B97968] font-medium hover:underline text-[11px]"
                  >
                    Edit
                  </button>
                </div>
                <p className="font-medium text-[#453C35]">{getValues("fullName")}</p>
                <p className="text-[#7D726A]">+91 {getValues("phone")}</p>
                <p className="text-[#7D726A] leading-relaxed">
                  {getValues("houseBuilding")}, {getValues("streetLocality")}
                  {getValues("landmark") ? `, Near ${getValues("landmark")}` : ""},{" "}
                  {getValues("city")}, {getValues("district")},{" "}
                  {getValues("state")} - {getValues("pinCode")}
                </p>
                {getValues("orderNotes") && (
                  <p className="text-[#B97968] italic pt-1">
                    Note: "{getValues("orderNotes")}"
                  </p>
                )}
              </div>

              {/* Two-Stage Approval Explainer */}
              <div className="p-4 rounded-xl bg-[#E9DCCB]/50 border border-[#D8CCBE] space-y-2 text-xs text-[#453C35]">
                <div className="flex items-center gap-1.5 font-semibold text-[#B97968]">
                  <Sparkles className="w-4 h-4" />
                  <span>How Payment & Fulfillment Works</span>
                </div>
                <p className="leading-relaxed text-[#7D726A]">
                  1. You submit this provisional order request with no online payment needed.
                  <br />
                  2. The artisan personally reviews handcrafting capacity and scheduling.
                  <br />
                  3. Once confirmed, you will receive UPI / payment instructions and can track delivery progress online.
                </p>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep("address")}
                  className="inline-flex items-center gap-1.5 text-xs text-[#7D726A] hover:text-[#453C35]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Address</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-md bg-[#B97968] hover:bg-[#A66757] text-white text-xs font-semibold tracking-wider uppercase shadow-warm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting..." : "Submit Order Request"}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Right 5 cols: Item Review & Price Summary */}
      <div className="lg:col-span-5 bg-white/80 rounded-2xl border border-[#D8CCBE] shadow-warm p-6 space-y-5 sticky top-28">
        <div className="flex justify-between items-center pb-3 border-b border-[#D8CCBE]">
          <h2 className="font-serif text-lg font-semibold text-[#453C35]">
            Order Items ({activeItems.length})
          </h2>
          {isQuickPurchase && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#B97968] text-white">
              Quick Purchase
            </span>
          )}
        </div>

        {/* Item mini-list */}
        <div className="divide-y divide-[#D8CCBE]/60 max-h-72 overflow-y-auto pr-1">
          {activeItems.map((item, idx) => (
            <div
              key={`${item.productId}-${item.variantId || idx}`}
              className="py-3 flex gap-3 items-center"
            >
              <div className="relative w-14 h-14 rounded-md overflow-hidden bg-[#E9DCCB] shrink-0 border border-[#D8CCBE]">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#453C35] truncate">
                  {item.title}
                </p>
                {item.variantLabel && (
                  <p className="text-[11px] text-[#7D726A]">{item.variantLabel}</p>
                )}
                <p className="text-[11px] text-[#7D726A] mt-0.5">
                  Qty: {item.quantity} × {formatINR(item.unitPrice)}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#453C35]">
                {formatINR(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-3 border-t border-[#D8CCBE] space-y-2 text-xs">
          <div className="flex justify-between text-[#7D726A]">
            <span>Subtotal</span>
            <span className="font-medium text-[#453C35]">
              {formatINR(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-[#7D726A]">
            <span>Shipping</span>
            <span className="font-medium text-[#453C35]">
              {isFreeShipping ? "FREE" : formatINR(shippingCharge)}
            </span>
          </div>
          <div className="pt-3 border-t border-[#D8CCBE] flex justify-between font-semibold text-base text-[#453C35]">
            <span>Estimated Total</span>
            <span className="text-[#B97968]">{formatINR(estimatedTotal)}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#F8F4EC] border border-[#D8CCBE]/80 text-[11px] text-[#7D726A] leading-relaxed">
          Prices and delivery fees are re-calculated server-side for accuracy. No payment is taken until owner approval.
        </div>
      </div>
    </div>
  );
}

