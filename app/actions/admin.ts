"use server";

import { revalidatePath } from "next/cache";
import {
  approveOrder,
  rejectOrCancelOrder,
  advanceOrderStatus,
  updatePaymentStatus,
  createManualOrder,
} from "@/lib/services/admin-orders";
import {
  saveProduct,
  toggleArchiveProduct,
  purgeAllDemoData,
  type ProductFormData,
} from "@/lib/services/admin-products";
import { getAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus, PaymentStatus, OrderSource, CustomOrderStatus } from "@/lib/types/database";

export async function approveOrderAction(
  orderId: string,
  adjustmentAmount: number = 0,
  adjustmentReason?: string,
  ownerNote?: string
) {
  try {
    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "teacher@example.com";
    const res = await approveOrder(
      orderId,
      adminEmail,
      adjustmentAmount,
      adjustmentReason,
      ownerNote
    );
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true, data: res };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to approve order",
    };
  }
}

export async function rejectOrderAction(
  orderId: string,
  reason: string
) {
  try {
    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "teacher@example.com";
    const res = await rejectOrCancelOrder(orderId, "REJECTED", adminEmail, reason);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true, data: res };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reject order",
    };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
) {
  try {
    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "teacher@example.com";
    const res = await advanceOrderStatus(orderId, newStatus, adminEmail, note);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true, data: res };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to advance order status",
    };
  }
}

export async function updateOrderPaymentAction(
  orderId: string,
  paymentStatus: PaymentStatus
) {
  try {
    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "teacher@example.com";
    const res = await updatePaymentStatus(orderId, paymentStatus, adminEmail);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true, data: res };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update payment status",
    };
  }
}

export async function saveProductAction(data: ProductFormData) {
  try {
    const res = await saveProduct(data);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true, productId: res.productId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save product",
    };
  }
}

export async function toggleArchiveProductAction(productId: string, isArchived: boolean) {
  try {
    await toggleArchiveProduct(productId, isArchived);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update archive status",
    };
  }
}

export async function purgeDemoDataAction() {
  try {
    await purgeAllDemoData();
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to purge demo data",
    };
  }
}

export async function saveCategoryAction(input: {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  isHidden?: boolean;
}) {
  try {
    const supabase = getAdminClient();
    const data = {
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      display_order: input.displayOrder || 0,
      is_hidden: input.isHidden || false,
    };

    if (input.id) {
      await supabase.from("categories").update(data).eq("id", input.id);
    } else {
      await supabase.from("categories").insert(data);
    }

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save category",
    };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const supabase = getAdminClient();
    await supabase.from("products").update({ category_id: null }).eq("category_id", id);
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete category",
    };
  }
}

export async function createManualOrderAction(input: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  orderSource: OrderSource;
  subtotal: number;
  shippingCharge: number;
  finalTotal: number;
  ownerNotes?: string;
  items: Array<{
    productId: string;
    variantId?: string | null;
    title: string;
    variantLabel?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}) {
  try {
    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "teacher@example.com";
    const order = await createManualOrder({
      ...input,
      adminEmail,
    });
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true, orderNumber: order.order_number, orderId: order.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create manual order",
    };
  }
}

export async function updateInventoryAction(input: {
  productId: string;
  variantId?: string | null;
  newStock: number;
  reason: string;
}) {
  try {
    const supabase = getAdminClient();

    if (input.variantId) {
      const { data: v } = await supabase
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", input.variantId)
        .single();

      const prevStock = v?.stock_quantity ?? 0;
      await supabase
        .from("product_variants")
        .update({ stock_quantity: input.newStock })
        .eq("id", input.variantId);

      await supabase.from("inventory_adjustments").insert({
        product_id: input.productId,
        variant_id: input.variantId,
        previous_stock: prevStock,
        new_stock: input.newStock,
        previous_reserved: 0,
        new_reserved: 0,
        reason: input.reason || "Manual owner adjustment",
      });
    } else {
      const { data: p } = await supabase
        .from("products")
        .select("stock_quantity, reserved_quantity")
        .eq("id", input.productId)
        .single();

      const prevStock = p?.stock_quantity ?? 0;
      const prevRes = p?.reserved_quantity ?? 0;
      await supabase
        .from("products")
        .update({ stock_quantity: input.newStock })
        .eq("id", input.productId);

      await supabase.from("inventory_adjustments").insert({
        product_id: input.productId,
        previous_stock: prevStock,
        new_stock: input.newStock,
        previous_reserved: prevRes,
        new_reserved: prevRes,
        reason: input.reason || "Manual owner adjustment",
      });
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update inventory",
    };
  }
}

export async function updateCustomOrderAction(input: {
  id: string;
  status: CustomOrderStatus;
  quotedAmount?: number | null;
  ownerNotes?: string | null;
}) {
  try {
    const supabase = getAdminClient();
    const updateData: {
      status: CustomOrderStatus;
      quoted_amount?: number | null;
      owner_notes?: string | null;
    } = {
      status: input.status,
    };

    if (input.quotedAmount !== undefined) updateData.quoted_amount = input.quotedAmount;
    if (input.ownerNotes !== undefined) updateData.owner_notes = input.ownerNotes;

    const { error } = await supabase
      .from("custom_order_requests")
      .update(updateData)
      .eq("id", input.id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/custom");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update custom order",
    };
  }
}

export async function convertCustomOrderToOrderAction(input: {
  requestId: string;
  quotedAmount: number;
  advanceAmount?: number;
  shippingCharge?: number;
}) {
  try {
    const supabase = getAdminClient();
    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "teacher@example.com";

    const { data: request, error: reqErr } = await supabase
      .from("custom_order_requests")
      .select("*")
      .eq("id", input.requestId)
      .single();

    if (reqErr || !request) throw new Error("Custom order request not found");

    const shippingCharge = input.shippingCharge || 0;
    const finalTotal = input.quotedAmount + shippingCharge;

    const order = await createManualOrder({
      customerName: request.customer_name,
      customerPhone: request.customer_phone,
      customerEmail: request.customer_email || undefined,
      shippingAddress: {
        addressLine1: "To be confirmed with customer",
        city: "City",
        state: "State",
        pincode: "000000",
      },
      orderSource: "MANUAL_OTHER",
      subtotal: input.quotedAmount,
      shippingCharge,
      finalTotal,
      ownerNotes: `Converted from Custom Enquiry ${request.request_number}. Advance: ₹${input.advanceAmount || 0}. Details: ${request.description}`,
      items: [
        {
          productId: "00000000-0000-0000-0000-000000000000",
          title: `Custom Handmade Order (${request.request_number})`,
          variantLabel: request.preferred_colors ? `Colors: ${request.preferred_colors}` : null,
          quantity: request.quantity,
          unitPrice: Math.round(input.quotedAmount / (request.quantity || 1)),
          lineTotal: input.quotedAmount,
        },
      ],
      adminEmail,
    });

    await supabase
      .from("custom_order_requests")
      .update({
        status: "ACCEPTED",
        quoted_amount: input.quotedAmount,
        owner_notes: `Converted to Order ${order.order_number}`,
      })
      .eq("id", input.requestId);

    revalidatePath("/admin/custom");
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true, orderNumber: order.order_number, orderId: order.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to convert to order",
    };
  }
}

export async function markNotificationReadAction(id: string) {
  try {
    const supabase = getAdminClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to mark read" };
  }
}

export async function completeSetupAction(data: {
  businessName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  instagramUrl: string;
  address: string;
  defaultShippingCharge: number;
  freeShippingThreshold?: number | null;
  minOrderAmount: number;
}) {
  try {
    const supabase = getAdminClient();
    const { error } = await supabase
      .from("store_settings")
      .update({
        business_name: data.businessName,
        tagline: data.tagline,
        phone: data.phone,
        whatsapp_number: data.whatsappNumber,
        email: data.email,
        instagram_url: data.instagramUrl,
        address: data.address,
        default_shipping_charge: data.defaultShippingCharge,
        free_shipping_threshold: data.freeShippingThreshold ?? null,
        min_order_amount: data.minOrderAmount,
        is_setup_completed: true,
      })
      .eq("id", "00000000-0000-0000-0000-000000000001");

    if (error) throw new Error(error.message);

    revalidatePath("/admin");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to complete setup",
    };
  }
}

export async function uploadProductImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const supabase = getAdminClient();
    const ext = file.name.split(".").pop() || "jpg";
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const filePath = `products/${Date.now()}-${cleanFileName}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to upload image",
    };
  }
}

export async function deleteInventoryItemAction(input: {
  productId: string;
  variantId?: string | null;
}) {
  try {
    const supabase = getAdminClient();

    if (input.variantId) {
      // Delete variant
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", input.variantId);
      if (error) throw new Error(error.message);
    } else {
      // Delete product (cascades to images and variants)
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", input.productId);
      if (error) throw new Error(error.message);
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete item",
    };
  }
}

export async function deleteProductAction(productId: string) {
  return deleteInventoryItemAction({ productId });
}

