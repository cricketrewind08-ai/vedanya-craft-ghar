/**
 * Formats a Date or timestamp string into Indian Standard Time (IST) DD MMM YYYY.
 */
export function formatDateIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Formats date and time in IST (e.g., "16 Feb 2026, 04:30 PM").
 */
export function formatDateTimeIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Masks customer phone number for safe non-admin/public display.
 * Example: "9876543210" -> "98****3210"
 */
export function maskPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "—";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 10) {
    return `${clean.slice(0, 2)}****${clean.slice(6)}`;
  }
  return phone.slice(0, 2) + "****" + phone.slice(-2);
}

/**
 * Sanitizes spreadsheet cell strings to prevent CSV/Formula injection attacks.
 * Prepends a single quote if the value starts with =, +, -, @, or tab/CR.
 */
export function sanitizeForCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str = String(value).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape double quotes
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

