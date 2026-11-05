"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Instagram,
  MessageCircle,
  Store,
} from "lucide-react";
import { createManualOrderAction } from "@/app/actions/admin";
import type { OrderSource } from "@/lib/types/database";
import type { ProductWithDetails } from "@/lib/services/admin-products";

interface ManualOrderFormProps {
  products: ProductWithDetails[];
}

interface OrderItemRow {
  productId: string;
  variantId?: string | null;
  title: string;
  variantLabel?: string | null;
  quantity: number;
  unitPrice: number;
}

export function ManualOrderForm({ products }: ManualOrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [orderSource, setOrderSource] = useState<OrderSource>("MANUAL_INSTAGRAM");
  const [ownerNotes, setOwnerNotes] = useState("");
  const [shippingCharge, setShippingCharge] = useState(0);

  // Items
  const [items, setItems] = useState<OrderItemRow[]>([]);

  // Item Picker State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [pickerQuantity, setPickerQuantity] = useState(1);
  const [pickerPrice, setPickerPrice] = useState(0);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    setSelectedVariantId("");
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setCustomTitle(prod.title);
      setPickerPrice(prod.base_price);
    } else {
      setCustomTitle("");
      setPickerPrice(0);
    }
  };

  const handleVariantSelect = (vId: string) => {
    setSelectedVariantId(vId);
    if (!selectedProduct) return;
    const variant = selectedProduct.variants.find((v) => v.id === vId);
    if (variant) {
      setPickerPrice(selectedProduct.base_price + (variant.price_modifier || 0));
    } else {
      setPickerPrice(selectedProduct.base_price);
    }
  };

  const addItemToOrder = () => {
    if (!customTitle.trim()) {
      alert("Please select or enter an item title");
      return;
    }
    if (pickerQuantity <= 0 || pickerPrice < 0) {
      alert("Quantity and price must be valid");
      return;
    }

    let variantLabel: string | null = null;
    if (selectedProduct && selectedVariantId) {
      const v = selectedProduct.variants.find((varItem) => varItem.id === selectedVariantId);
      if (v) variantLabel = `${v.option_name}: ${v.option_value}`;
    }

    setItems([
      ...items,
      {
        productId: selectedProductId || "00000000-0000-0000-0000-000000000000",
        variantId: selectedVariantId || null,
        title: customTitle,
        variantLabel,
        quantity: pickerQuantity,
        unitPrice: pickerPrice,
      },
    ]);

    // Reset picker
    setSelectedProductId("");
    setSelectedVariantId("");
    setCustomTitle("");
    setPickerQuantity(1);
    setPickerPrice(0);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const finalTotal = subtotal + Number(shippingCharge || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Customer name and phone number are required.");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least one item to the order.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await createManualOrderAction({
      customerName,
      customerPhone,
      customerEmail: customerEmail.trim() || undefined,
      shippingAddress: {
        addressLine1: addressLine1.trim() || "Local pickup / provided offline",
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || "City",
        state: state.trim() || "State",
        pincode: pincode.trim() || "000000",
      },
      orderSource,
      subtotal,
      shippingCharge: Number(shippingCharge || 0),
      finalTotal,
      ownerNotes: ownerNotes.trim() || undefined,
      items: items.map((i) => ({
        ...i,
        lineTotal: i.quantity * i.unitPrice,
      })),
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to log manual order");
    } else {
      setSuccess(`Order ${res.orderNumber} successfully recorded! Redirecting...`);
      setTimeout(() => {
        router.push(`/admin/orders/${res.orderId}`);
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Log Manual Sale</h1>
          <p className="text-sm text-gray-500">
            Record orders placed directly via Instagram DM, WhatsApp chat, or exhibitions.
          </p>
        </div>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Sale Channel */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            1. Sale Channel / Source
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setOrderSource("MANUAL_INSTAGRAM")}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition text-left ${
                orderSource === "MANUAL_INSTAGRAM"
                  ? "border-[#B97968] bg-[#F8F4EC] text-[#B97968] font-medium"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <Instagram className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm">Instagram DM</p>
                <p className="text-xs text-gray-400">Direct message order</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setOrderSource("MANUAL_WHATSAPP")}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition text-left ${
                orderSource === "MANUAL_WHATSAPP"
                  ? "border-[#B97968] bg-[#F8F4EC] text-[#B97968] font-medium"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm">WhatsApp Chat</p>
                <p className="text-xs text-gray-400">Direct chat / enquiry</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setOrderSource("MANUAL_OTHER")}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition text-left ${
                orderSource === "MANUAL_OTHER"
                  ? "border-[#B97968] bg-[#F8F4EC] text-[#B97968] font-medium"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <Store className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm">Exhibition / In-Person</p>
                <p className="text-xs text-gray-400">Pop-up stall or friends</p>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Customer Contact */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            2. Customer Information
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone Number (10 digits) *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email Address (Optional)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. priya@example.com"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Address Line 1</label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="House / Flat No., Street Name"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Landmark, Area"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 560001"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Order Items */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            3. Order Items
          </label>

          {/* Add item bar */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <p className="text-xs font-medium text-gray-600">Add Item to this Order</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] text-gray-400 mb-0.5">Pick Product or Type Name</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                >
                  <option value="">-- Select from Catalog or Custom --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (₹{p.base_price})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Item Name (e.g. Custom Hair Scrunchie)"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-0.5">Variant (Optional)</label>
                {selectedProduct && selectedProduct.variants.length > 0 ? (
                  <select
                    value={selectedVariantId}
                    onChange={(e) => handleVariantSelect(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                  >
                    <option value="">-- Standard Base --</option>
                    {selectedProduct.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.option_name}: {v.option_value} (
                        {v.price_modifier >= 0 ? `+₹${v.price_modifier}` : `-₹${Math.abs(v.price_modifier)}`})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-gray-400 pt-2 italic">No variants available</p>
                )}
              </div>

              <div className="flex gap-2 items-end">
                <div className="w-16">
                  <label className="block text-[11px] text-gray-400 mb-0.5">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={pickerQuantity}
                    onChange={(e) => setPickerQuantity(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[11px] text-gray-400 mb-0.5">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={pickerPrice}
                    onChange={(e) => setPickerPrice(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
                  />
                </div>
                <button
                  type="button"
                  onClick={addItemToOrder}
                  className="px-3 py-1.5 bg-[#453C35] text-white rounded-lg text-xs font-medium hover:bg-black transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Added items table */}
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 text-center italic">No items added yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    {item.variantLabel && <p className="text-gray-500">{item.variantLabel}</p>}
                    <p className="text-gray-400 text-[11px]">
                      ₹{item.unitPrice} × {item.quantity} = ₹{item.unitPrice * item.quantity}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pricing summary & shipping */}
          <div className="pt-4 border-t border-gray-100 flex flex-col items-end gap-2 text-sm">
            <div className="flex justify-between w-64 text-gray-600">
              <span>Subtotal:</span>
              <span className="font-medium text-gray-900">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center w-64 text-gray-600">
              <span>Delivery Charge (₹):</span>
              <input
                type="number"
                min="0"
                value={shippingCharge}
                onChange={(e) => setShippingCharge(Number(e.target.value))}
                className="w-20 px-2 py-1 text-right text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
              />
            </div>
            <div className="flex justify-between w-64 pt-2 border-t border-gray-200 text-base font-bold text-gray-900">
              <span>Total Payable:</span>
              <span className="text-[#B97968]">₹{finalTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Step 4: Notes */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            4. Owner Internal Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={ownerNotes}
            onChange={(e) => setOwnerNotes(e.target.value)}
            placeholder="e.g. Customer paid ₹500 advance via Google Pay, promised dispatch by Friday."
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#B97968]"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/orders"
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="px-6 py-2.5 rounded-xl bg-[#B97968] text-white text-sm font-semibold hover:bg-[#a66858] transition shadow disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save & Confirm Manual Order
          </button>
        </div>
      </form>
    </div>
  );
}

