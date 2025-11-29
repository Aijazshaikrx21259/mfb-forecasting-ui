/**
 * Formatting utilities for numbers, percentages, and metrics
 */

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatQuantity(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return formatNumber(value, 0);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatMetric(value: number, type: "mape" | "rmse" | "percentage" | "quantity"): string {
  switch (type) {
    case "mape":
    case "percentage":
      return formatPercentage(value);
    case "rmse":
      return formatNumber(value, 2);
    case "quantity":
      return formatQuantity(value);
    default:
      return formatNumber(value);
  }
}

export function formatConfidenceLevel(level: number): string {
  const labels = ["Very Low", "Low", "Medium", "High", "Very High"];
  return labels[level - 1] || "Unknown";
}

export function formatPriority(priority: string): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function parseNumber(value: string): number | null {
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
  return isNaN(parsed) ? null : parsed;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundToDecimal(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / oldValue) * 100;
}

export function formatPercentageChange(oldValue: number, newValue: number): string {
  const change = calculatePercentageChange(oldValue, newValue);
  const sign = change > 0 ? "+" : "";
  return `${sign}${formatPercentage(change)}`;
}

export function abbreviateNumber(value: number): string {
  const suffixes = ["", "K", "M", "B", "T"];
  let suffixIndex = 0;
  let abbreviated = value;

  while (abbreviated >= 1000 && suffixIndex < suffixes.length - 1) {
    abbreviated /= 1000;
    suffixIndex++;
  }

  return `${roundToDecimal(abbreviated, 1)}${suffixes[suffixIndex]}`;
}
