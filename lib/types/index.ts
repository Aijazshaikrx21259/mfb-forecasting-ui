/**
 * Shared TypeScript types and interfaces
 */

export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FilterState {
  search?: string;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SortState {
  field: string;
  direction: "asc" | "desc";
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
