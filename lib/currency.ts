/**
 * Centralized Currency Configuration & Formatting Utilities
 * 
 * Provides unified currency configuration, Indian Rupee (INR / ₹) formatting,
 * and subunit (paise) conversions across frontend and backend.
 */

export const CURRENCY_CONFIG = {
  code: process.env.NEXT_PUBLIC_CURRENCY || "INR",
  symbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹",
  name: "Indian Rupee",
  subunit: "paise",
  subunitMultiplier: 100,
  locale: "en-IN",
} as const;

export const DEFAULT_CURRENCY = CURRENCY_CONFIG.code;
export const DEFAULT_CURRENCY_SYMBOL = CURRENCY_CONFIG.symbol;

export interface FormatCurrencyOptions {
  /** Include the currency symbol (e.g. ₹). Defaults to true. */
  showSymbol?: boolean;
  /** Force decimal display even for whole numbers. Defaults to false. */
  includeDecimals?: boolean;
  /** Custom fallback string when value is null, undefined, or NaN. Defaults to "₹0" */
  fallback?: string;
}

/**
 * Format a numeric amount into Indian Rupees format:
 * Examples:
 *   599    -> "₹599"
 *   1299   -> "₹1,299"
 *   10000  -> "₹10,000"
 *   89.99  -> "₹89.99"
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  const { showSymbol = true, includeDecimals = false, fallback = `${DEFAULT_CURRENCY_SYMBOL}0` } = options;

  if (amount === null || amount === undefined || amount === "") {
    return fallback;
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return fallback;
  }

  const hasFractions = num % 1 !== 0;
  const minDecimals = includeDecimals ? 2 : hasFractions ? 2 : 0;
  const maxDecimals = includeDecimals || hasFractions ? 2 : 0;

  const formattedNumber = new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(num);

  return showSymbol ? `${CURRENCY_CONFIG.symbol}${formattedNumber}` : formattedNumber;
}

/**
 * Convert Rupees to integer Paise (for Razorpay).
 * Example:
 *   599 -> 59900
 *   89.99 -> 8999
 */
export function toPaise(rupees: number | string | null | undefined): number {
  if (rupees === null || rupees === undefined || rupees === "") return 0;
  const num = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * CURRENCY_CONFIG.subunitMultiplier);
}

/**
 * Convert integer Paise to Rupees.
 * Example:
 *   59900 -> 599
 *   8999 -> 89.99
 */
export function fromPaise(paise: number | string | null | undefined): number {
  if (paise === null || paise === undefined || paise === "") return 0;
  const num = typeof paise === "string" ? parseInt(paise, 10) : paise;
  if (isNaN(num)) return 0;
  return num / CURRENCY_CONFIG.subunitMultiplier;
}

/**
 * Format integer paise directly into formatted currency string.
 * Example:
 *   59900 -> "₹599"
 *   129900 -> "₹1,299"
 */
export function formatPaise(
  paise: number | string | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  return formatCurrency(fromPaise(paise), options);
}
