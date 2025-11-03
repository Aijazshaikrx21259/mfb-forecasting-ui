import { apiFetch } from "@/lib/api-client";

export interface MonthFlagResponse {
  flag_id: string;
  month_key: string;
  agency_internal_id: string | null;
  item_id: string | null;
  flag_type: "ANOMALY" | "STOCKOUT" | "BAD_DATA" | "MANUAL_EXCLUDE";
  flag_level: string;
  flag_reason: string | null;
  flagged_by: string;
  flagged_at_utc: string;
  expires_at_utc: string | null;
  is_active: boolean;
  detected_issue_id: string | null;
}

export async function getItemFlags(
  itemId: string
): Promise<MonthFlagResponse[]> {
  const params = new URLSearchParams({ item_id: itemId });
  return apiFetch<MonthFlagResponse[]>(
    `/data-quality/flags?${params.toString()}`
  );
}
