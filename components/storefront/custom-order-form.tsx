"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { submitCustomOrderAction } from "@/app/actions/custom-order";
import { indianPhoneRegex } from "@/lib/validators/checkout";

const formSchema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  customerPhone: z.string().trim().regex(indianPhoneRegex, "Enter a valid 10-digit mobile number"),
  customerEmail: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  description: z.string().trim().min(10, "Please describe what piece you'd like made").max(1000),
  preferredColors: z.string().trim().max(200).optional().or(z.literal("")),
  quantity: z.number().int().min(1, "Minimum quantity is 1").max(50),
  targetDate: z.string().optional().or(z.literal("")),
  honeypot: z.string().max(0, ""),
});

type FormValues = z.infer<typeof formSchema>;

export function CustomOrderForm() {
  const [submitted, setSubmitted] = useState<{
    requestNumber: string;
    whatsappNumber: string | null;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      description: "",
      preferredColors: "",
      quantity: 1,
      targetDate: "",
      honeypot: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const res = await submitCustomOrderAction(data);
    if (!res.success) {
      setServerError(res.error || "Failed to submit custom request");
      return;
    }
    setSubmitted({
      requestNumber: res.requestNumber!,
      whatsappNumber: res.whatsappNumber || null,
    });
  };

  if (submitted) {
    const waText = encodeURIComponent(
      `Hello Vedanya Craft Ghar! I submitted a custom order request (${submitted.requestNumber}). I would love to discuss colors, pricing, and feasibility with you!`
    );

    return (
      <div className="bg-white/80 p-8 sm:p-12 rounded-2xl border border-[#D8CCBE] shadow-warm text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#A3AA8C]/20 text-[#A3AA8C] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-semibold tracking-wider uppercase text-[#B97968]">
          Enquiry Received
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#453C35] mt-1 mb-3">
          Thank you for reaching out!
        </h2>
        <p className="text-sm text-[#7D726A] leading-relaxed mb-6">
          Your request ID is{" "}
          <span className="font-mono font-bold text-[#453C35] bg-[#E9DCCB] px-2 py-0.5 rounded">
            {submitted.requestNumber}
          </span>
          . The artisan will review your design idea and reach out to you directly with a personalized quote.
        </p>

        {submitted.whatsappNumber && (
          <div className="pt-4 border-t border-[#D8CCBE]/70">
            <p className="text-xs text-[#7D726A] mb-3">
              Want a faster response? Send this request directly to our studio on WhatsApp:
            </p>
            <a
              href={`https://wa.me/91${submitted.whatsappNumber}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#25D366] hover:bg-[#20BE5C] text-white font-medium text-xs tracking-wider uppercase shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with Artisan on WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white/70 p-6 sm:p-10 rounded-2xl border border-[#D8CCBE] shadow-warm space-y-6 max-w-2xl mx-auto"
    >
      {/* Honeypot field (hidden from genuine users) */}
      <input
        type="text"
        {...register("honeypot")}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
      />

      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {serverError}
        </div>
      )}

      {/* Row 1: Contact Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
            Your Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Ananya Sharma"
            {...register("customerName")}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
          />
          {errors.customerName && (
            <p className="text-red-600 text-[11px] mt-1">
              {errors.customerName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
            10-Digit Mobile Number *
          </label>
          <input
            type="tel"
            placeholder="e.g. 9876543210"
            maxLength={10}
            {...register("customerPhone")}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
          />
          {errors.customerPhone && (
            <p className="text-red-600 text-[11px] mt-1">
              {errors.customerPhone.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
          Email Address (Optional)
        </label>
        <input
          type="email"
          placeholder="For copy of quote & details"
          {...register("customerEmail")}
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
        />
        {errors.customerEmail && (
          <p className="text-red-600 text-[11px] mt-1">
            {errors.customerEmail.message}
          </p>
        )}
      </div>

      {/* Row 2: Idea Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
          Describe Your Custom Piece *
        </label>
        <textarea
          rows={4}
          placeholder="Tell us what you have in mind! (e.g. A crochet tulip bouquet with lavender wrap, specific dimensions, initials embroidery...)"
          {...register("description")}
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
        />
        {errors.description && (
          <p className="text-red-600 text-[11px] mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Row 3: Colors & Quantities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
            Preferred Colors / Palette
          </label>
          <input
            type="text"
            placeholder="e.g. Pastel Pink, Terracotta, Sage Green"
            {...register("preferredColors")}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            max={50}
            {...register("quantity", { valueAsNumber: true })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
          />
        </div>
      </div>

      {/* Target Date */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#453C35] mb-1.5">
          Needed by Date (Optional - e.g. for birthday/anniversary)
        </label>
        <input
          type="date"
          {...register("targetDate")}
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CCBE] bg-white text-xs text-[#453C35] focus:outline-none focus:ring-1 focus:ring-[#B97968]"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 rounded-md bg-[#B97968] hover:bg-[#A66757] text-white font-medium text-xs tracking-wider uppercase shadow-warm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        <span>{isSubmitting ? "Submitting..." : "Send Custom Order Enquiry"}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-[11px] text-[#7D726A] text-center italic">
        * Submitting an enquiry does not require any advance payment. The owner will review feasibility and coordinate with you.
      </p>
    </form>
  );
}

