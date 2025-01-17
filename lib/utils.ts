import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert prisma object to plain object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  return num.toFixed(2);
}

// Format errors
export function formatError(
  error: unknown | ZodError | Prisma.PrismaClientKnownRequestError
) {
  if (error instanceof ZodError) {
    const fieldErrors = Object.keys(error.errors).map(
      (idx) => error.errors[+idx].message
    );

    return fieldErrors.join(".\n");
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const field = Array.isArray(error.meta?.target)
        ? (error.meta.target[0] as string)
        : "Field";
      return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
  }
  const err = error as Error;
  return typeof err.message === "string"
    ? err.message
    : JSON.stringify(err.message);
}

// Round number to 2 decimal places
export function round2(value: number | string) {
  if (!isNaN(Number(value))) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("Value is not a number or string");
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  style: "currency",
  minimumFractionDigits: 2,
});

// Format currency using the formatter above
export function formatCurrency(amount: number | string | null) {
  if (isNaN(Number(amount)) || amount === null) return "NaN";

  return CURRENCY_FORMATTER.format(Number(amount));
}
