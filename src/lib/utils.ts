import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PHONE_DIGITS = 11;

/**
 * Applies Brazilian phone mask "(XX) XXXXX-XXXX" or "(XX) XXXX-XXXX".
 * Strips everything except digits first.
 * @returns { value, raw } where `value` is the masked string and `raw` is the plain digits.
 */
export function phoneMask(raw: string): { value: string; raw: string } {
  const digits = raw.replace(/\D/g, "").slice(0, PHONE_DIGITS);

  if (digits.length <= 2) {
    return {
      value: digits.length > 0 ? `(${digits}` : "",
      raw: digits,
    };
  }

  if (digits.length <= 6) {
    return {
      value:
        digits.length === 11
          ? ""
          : `(${digits.slice(0, 2)}) ${digits.slice(2)}`,
      raw: digits,
    };
  }

  if (digits.length <= 10) {
    return {
      value: `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`,
      raw: digits,
    };
  }

  // 11 digits – celular format
  return {
    value: `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`,
    raw: digits,
  };
}
