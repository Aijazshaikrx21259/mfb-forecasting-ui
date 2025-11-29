/**
 * Application constants
 */

export const APP_NAME = "MFB Forecasting";
export const APP_DESCRIPTION = "Demand forecasting and purchase planning for Maryland Food Bank";

export const API_TIMEOUT_MS = 30000;
export const ALERT_POLL_INTERVAL_MS = 30000;

export const FORECAST_HORIZONS = [1, 2, 3, 4] as const;
export const MAX_HORIZON = 12;

export const CONFIDENCE_LEVELS = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
} as const;

export const PRIORITY_COLORS = {
  LOW: "bg-gray-500",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
} as const;

export const STATUS_COLORS = {
  PENDING: "bg-yellow-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-red-500",
  SUPERSEDED: "bg-gray-500",
  UNREAD: "bg-blue-500",
  READ: "bg-gray-400",
  DISMISSED: "bg-gray-300",
  ARCHIVED: "bg-gray-200",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const ROUTES = {
  HOME: "/",
  ITEMS: "/items",
  PURCHASE_PLAN: "/purchase-plan",
  ALERTS: "/alerts",
  ALERT_PREFERENCES: "/alerts/preferences",
  FAQ: "/faq",
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
} as const;

export const FORECAST_METHODS = {
  ETS: "Exponential Smoothing",
  CROSTON_SBA: "Croston SBA",
  TSB: "Teunter-Syntetos-Babai",
  SEASONAL_NAIVE: "Seasonal Naive",
} as const;

export const DEMAND_CLASSIFICATIONS = {
  SMOOTH: "Smooth",
  ERRATIC: "Erratic",
  INTERMITTENT: "Intermittent",
  LUMPY: "Lumpy",
} as const;

export const FILE_SIZE_LIMITS = {
  CSV_MAX_SIZE_MB: 10,
  EXCEL_MAX_SIZE_MB: 25,
} as const;

export const DATE_FORMATS = {
  DISPLAY: "MMM d, yyyy",
  DISPLAY_WITH_TIME: "MMM d, yyyy h:mm a",
  API: "yyyy-MM-dd",
  MONTH_KEY: "yyyy-MM",
} as const;
