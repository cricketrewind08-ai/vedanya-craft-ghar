"use server";

import { revalidatePath } from "next/cache";
import {
  approveOrder,
  rejectOrCancelOrder,
  advanceOrderStatus,
  updatePaymentStatus,
} from "@/lib/services/admin-orders";
import {
  saveProduct,
  toggleArchiveProduct,
  purgeAllDemoData,
  type ProductFormData,
} from "@/lib/services/admin-products";
import { getAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus, PaymentStatus } from "@/lib/types/database";

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

