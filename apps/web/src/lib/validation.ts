import { z } from "zod";

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(
    /^(\+?254|0)[17]\d{8}$/,
    "Must be a valid Kenyan phone number (e.g. +254712345678)"
  );

export const emailSchema = z
  .string()
  .email("Enter a valid institutional email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const amountSchema = z
  .string()
  .refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  );

export const transactionTitleSchema = z
  .string()
  .min(5, "Title must be at least 5 characters for legal clarity");

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters");

export function sanitizePhone(phone: string): string {
  return phone.replace(/^0/, "254").replace(/^\+/, "");
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
}

export function filterPhoneInput(value: string): string {
  const allowedChars = value.replace(/[^0-9+]/g, "");
  const cleaned = allowedChars.replace(/(?!^)\+/g, "");
  return cleaned;
}
