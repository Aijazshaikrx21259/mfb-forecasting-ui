import { apiFetch } from "@/lib/api-client";

export enum AlertType {
  FORECAST_READY = "FORECAST_READY",
  HIGH_DEMAND_SPIKE = "HIGH_DEMAND_SPIKE",
  LOW_DEMAND_DROP = "LOW_DEMAND_DROP",
  STOCKOUT_RISK = "STOCKOUT_RISK",
  HIGH_PRIORITY_ITEMS = "HIGH_PRIORITY_ITEMS",
  MODEL_PERFORMANCE_ALERT = "MODEL_PERFORMANCE_ALERT",
  DATA_QUALITY_ISSUE = "DATA_QUALITY_ISSUE",
  PIPELINE_FAILURE = "PIPELINE_FAILURE",
  SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE",
}

export enum AlertPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum AlertStatus {
  UNREAD = "UNREAD",
  READ = "READ",
  DISMISSED = "DISMISSED",
  ARCHIVED = "ARCHIVED",
}

export interface Alert {
  alert_id: string;
  user_id: string;
  alert_type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  message: string;
  metadata: Record<string, any> | null;
  action_url: string | null;
  action_label: string | null;
  created_at: string;
  read_at: string | null;
  dismissed_at: string | null;
  expires_at: string | null;
}

export interface AlertListResponse {
  alerts: Alert[];
  total: number;
  page: number;
  page_size: number;
  unread_count: number;
}

export interface AlertPreferences {
  user_id: string;
  enabled_alert_types: AlertType[];
  min_priority: AlertPriority;
  weekly_digest_enabled: boolean;
  weekly_digest_day: number;
  in_app_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertStatsResponse {
  total_alerts: number;
  unread_count: number;
  by_priority: Record<string, number>;
  by_type: Record<string, number>;
  recent_alerts: Alert[];
}

export async function getAlerts(
  userId: string,
  params?: {
    status?: AlertStatus;
    alert_type?: AlertType;
    priority?: AlertPriority;
    page?: number;
    page_size?: number;
  }
): Promise<AlertListResponse> {
  const searchParams = new URLSearchParams({ user_id: userId });
  
  if (params?.status) searchParams.set("status", params.status);
  if (params?.alert_type) searchParams.set("alert_type", params.alert_type);
  if (params?.priority) searchParams.set("priority", params.priority);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.page_size) searchParams.set("page_size", params.page_size.toString());

  return apiFetch<AlertListResponse>(`/alerts?${searchParams.toString()}`);
}

export async function getAlert(alertId: string, userId: string): Promise<Alert> {
  return apiFetch<Alert>(`/alerts/${alertId}?user_id=${userId}`);
}

export async function markAlertAsRead(alertId: string, userId: string): Promise<Alert> {
  return apiFetch<Alert>(`/alerts/${alertId}?user_id=${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: AlertStatus.READ }),
  });
}

export async function dismissAlert(alertId: string, userId: string): Promise<Alert> {
  return apiFetch<Alert>(`/alerts/${alertId}?user_id=${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: AlertStatus.DISMISSED }),
  });
}

export async function markAllAsRead(userId: string): Promise<{ marked_read: number }> {
  return apiFetch<{ marked_read: number }>(`/alerts/mark-all-read?user_id=${userId}`, {
    method: "POST",
  });
}

export async function deleteAlert(alertId: string, userId: string): Promise<void> {
  return apiFetch<void>(`/alerts/${alertId}?user_id=${userId}`, {
    method: "DELETE",
  });
}

export async function getAlertStats(userId: string): Promise<AlertStatsResponse> {
  return apiFetch<AlertStatsResponse>(`/alerts/stats/summary?user_id=${userId}`);
}

export async function getAlertPreferences(userId: string): Promise<AlertPreferences> {
  return apiFetch<AlertPreferences>(`/alert-preferences?user_id=${userId}`);
}

export async function updateAlertPreferences(
  userId: string,
  preferences: Partial<Omit<AlertPreferences, "user_id" | "created_at" | "updated_at">>
): Promise<AlertPreferences> {
  return apiFetch<AlertPreferences>(`/alert-preferences?user_id=${userId}`, {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
}
