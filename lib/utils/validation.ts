/**
 * Validation utilities for form inputs and data
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateItemId(itemId: string): boolean {
  // Allow alphanumeric, hyphens, and underscores
  const itemIdRegex = /^[A-Za-z0-9_-]+$/;
  return itemIdRegex.test(itemId) && itemId.length <= 50;
}

export function validateQuantity(quantity: number): boolean {
  return quantity >= 0 && Number.isFinite(quantity);
}

export function validateHorizon(horizon: number): boolean {
  return Number.isInteger(horizon) && horizon >= 1 && horizon <= 12;
}

export function validateConfidenceLevel(level: number): boolean {
  return Number.isInteger(level) && level >= 1 && level <= 5;
}

export function validateDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function validateMonthKey(monthKey: string): boolean {
  const monthKeyRegex = /^\d{4}-\d{2}$/;
  if (!monthKeyRegex.test(monthKey)) return false;
  
  const [year, month] = monthKey.split("-").map(Number);
  return year >= 2000 && year <= 2100 && month >= 1 && month <= 12;
}

export function validatePercentage(value: number): boolean {
  return value >= 0 && value <= 100 && Number.isFinite(value);
}

export function validatePositiveNumber(value: number): boolean {
  return value > 0 && Number.isFinite(value);
}

export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max && Number.isFinite(value);
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, maxLength);
}

export function validateAdjustmentBounds(p10: number | null, p50: number, p90: number | null): boolean {
  if (p10 !== null && p10 > p50) return false;
  if (p90 !== null && p90 < p50) return false;
  if (p10 !== null && p90 !== null && p10 > p90) return false;
  return true;
}

export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function validateMinLength(value: string, minLength: number): boolean {
  return value.trim().length >= minLength;
}

export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateAdjustmentReason(reason: string): ValidationResult {
  if (!validateRequired(reason)) {
    return { isValid: false, error: "Adjustment reason is required" };
  }
  if (!validateMinLength(reason, 10)) {
    return { isValid: false, error: "Adjustment reason must be at least 10 characters" };
  }
  if (!validateMaxLength(reason, 500)) {
    return { isValid: false, error: "Adjustment reason must be less than 500 characters" };
  }
  return { isValid: true };
}

export function validateAdjustmentValue(value: number, original: number): ValidationResult {
  if (!validateQuantity(value)) {
    return { isValid: false, error: "Adjustment value must be a non-negative number" };
  }
  if (value === original) {
    return { isValid: false, error: "Adjusted value must be different from original" };
  }
  return { isValid: true };
}
