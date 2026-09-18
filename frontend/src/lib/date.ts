import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export type DateInput = Date | string | number | null | undefined;

/**
 * Common standardized date formatting patterns across the platform.
 */
export const DATE_FORMATS = {
  // e.g. "Oct 24, 2026"
  DATE_MEDIUM: "MMM dd, yyyy",
  // e.g. "October 24, 2026"
  DATE_LONG: "MMMM dd, yyyy",
  // e.g. "24 Oct 2026"
  DATE_BRITISH: "dd MMM yyyy",
  // e.g. "2026-10-24"
  DATE_ISO: "yyyy-MM-dd",
  // e.g. "10:30 AM"
  TIME_12H: "hh:mm a",
  // e.g. "10:30:45 AM"
  TIME_12H_SEC: "hh:mm:ss a",
  // e.g. "14:30"
  TIME_24H: "HH:mm",
  // e.g. "Oct 24, 2026 • 10:30 AM"
  DATETIME_MEDIUM: "MMM dd, yyyy • hh:mm a",
  // e.g. "Oct 24, 2026, 10:30 AM"
  DATETIME_COMMA: "MMM dd, yyyy, hh:mm a",
  // e.g. "Saturday, Oct 24, 2026"
  DATETIME_FULL: "EEEE, MMM dd, yyyy",
} as const;

/**
 * Safely parses any date input into a valid Date object, or returns null if invalid.
 */
export function toValidDate(value: DateInput): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  if (typeof value === "number") {
    const d = new Date(value);
    return isValid(d) ? d : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    // Try ISO first
    const parsedIso = parseISO(trimmed);
    if (isValid(parsedIso)) return parsedIso;
    // Fallback to Date constructor
    const d = new Date(trimmed);
    return isValid(d) ? d : null;
  }
  return null;
}

/**
 * Formats a date into a clean date string.
 * @example formatDate("2026-10-24T10:00:00Z") => "Oct 24, 2026"
 * @example formatDate(new Date(), "yyyy-MM-dd") => "2026-10-24"
 */
export function formatDate(
  date: DateInput,
  pattern: string = DATE_FORMATS.DATE_MEDIUM,
  fallback = "—"
): string {
  const valid = toValidDate(date);
  if (!valid) return fallback;
  try {
    return format(valid, pattern);
  } catch {
    return fallback;
  }
}

/**
 * Formats a time into a clean 12-hour or custom format.
 * @example formatTime("2026-10-24T14:30:00Z") => "02:30 PM"
 */
export function formatTime(
  date: DateInput,
  pattern: string = DATE_FORMATS.TIME_12H,
  fallback = "—"
): string {
  const valid = toValidDate(date);
  if (!valid) return fallback;
  try {
    return format(valid, pattern);
  } catch {
    return fallback;
  }
}

/**
 * Formats a date and time together.
 * @example formatDateTime("2026-10-24T14:30:00Z") => "Oct 24, 2026, 02:30 PM"
 */
export function formatDateTime(
  date: DateInput,
  pattern: string = DATE_FORMATS.DATETIME_COMMA,
  fallback = "—"
): string {
  const valid = toValidDate(date);
  if (!valid) return fallback;
  try {
    return format(valid, pattern);
  } catch {
    return fallback;
  }
}

/**
 * Returns a relative time string.
 * @example formatRelativeTime(Date.now() - 60000) => "1 minute ago"
 */
export function formatRelativeTime(
  date: DateInput,
  addSuffix = true,
  fallback = "Just now"
): string {
  const valid = toValidDate(date);
  if (!valid) return fallback;
  try {
    return formatDistanceToNow(valid, { addSuffix });
  } catch {
    return fallback;
  }
}

/**
 * Formats a date range cleanly.
 * @example formatDateRange(start, end) => "Oct 24, 2026 – Oct 28, 2026"
 */
export function formatDateRange(
  startDate: DateInput,
  endDate: DateInput,
  pattern: string = DATE_FORMATS.DATE_MEDIUM,
  fallback = "—"
): string {
  const start = toValidDate(startDate);
  const end = toValidDate(endDate);

  if (!start && !end) return fallback;
  if (start && !end) return `From ${formatDate(start, pattern)}`;
  if (!start && end) return `Until ${formatDate(end, pattern)}`;

  return `${formatDate(start, pattern)} – ${formatDate(end, pattern)}`;
}
