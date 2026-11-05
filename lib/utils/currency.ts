/**
 * Formats numeric values to Indian Rupee representation (₹ with en-IN comma grouping).
 * Examples:
 * 899 -> "₹899"
 * 12500.5 -> "₹12,500.50"
 */
export function formatINR(
  amount: number | string | null | undefined,
  showDecimals: boolean = false
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0";
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num);
}

