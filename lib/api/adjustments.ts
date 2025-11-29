import { apiFetch } from "@/lib/api-client";

export enum AdjustmentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUPERSEDED = "SUPERSEDED",
}

export interface Adjustment {
  adjustment_id: string;
  item_id: string;
  run_id: string;
  horizon: number;
  period_start_date: string;
  original_p50: number | null;
  original_p10: number | null;
  original_p90: number | null;
  original_method: string | null;
  adjusted_p50: number;
  adjusted_p10: number | null;
  adjusted_p90: number | null;
  adjustment_reason: string;
  notes: string | null;
  confidence_level: number | null;
  adjusted_by: string;
  adjusted_at: string;
  status: AdjustmentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdjustmentCreate {
  item_id: string;
  run_id: string;
  horizon: number;
  period_start_date: string;
  original_p50?: number;
  original_p10?: number;
  original_p90?: number;
  original_method?: string;
  adjusted_p50: number;
  adjusted_p10?: number;
  adjusted_p90?: number;
  adjustment_reason: string;
  notes?: string;
  confidence_level?: number;
  adjusted_by: string;
}

export interface AdjustmentListResponse {
  adjustments: Adjustment[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdjustmentTemplate {
  template_id: string;
  template_name: string;
  description: string | null;
  adjustment_type: string;
  adjustment_value: number | null;
  adjustment_formula: string | null;
  default_reason: string | null;
  default_confidence: number | null;
}

export async function getAdjustments(params?: {
  item_id?: string;
  run_id?: string;
  status?: AdjustmentStatus;
  adjusted_by?: string;
  page?: number;
  page_size?: number;
}): Promise<AdjustmentListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.item_id) searchParams.set("item_id", params.item_id);
  if (params?.run_id) searchParams.set("run_id", params.run_id);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.adjusted_by) searchParams.set("adjusted_by", params.adjusted_by);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.page_size) searchParams.set("page_size", params.page_size.toString());

  const query = searchParams.toString();
  return apiFetch<AdjustmentListResponse>(`/adjustments${query ? `?${query}` : ""}`);
}

export async function getAdjustment(adjustmentId: string): Promise<Adjustment> {
  return apiFetch<Adjustment>(`/adjustments/${adjustmentId}`);
}

export async function createAdjustment(adjustment: AdjustmentCreate): Promise<Adjustment> {
  return apiFetch<Adjustment>("/adjustments", {
    method: "POST",
    body: JSON.stringify(adjustment),
  });
}

export async function updateAdjustment(
  adjustmentId: string,
  update: Partial<Pick<Adjustment, "adjusted_p50" | "adjusted_p10" | "adjusted_p90" | "adjustment_reason" | "notes" | "confidence_level">>
): Promise<Adjustment> {
  return apiFetch<Adjustment>(`/adjustments/${adjustmentId}`, {
    method: "PATCH",
    body: JSON.stringify(update),
  });
}

export async function reviewAdjustment(
  adjustmentId: string,
  review: {
    status: AdjustmentStatus.APPROVED | AdjustmentStatus.REJECTED;
    reviewed_by: string;
    review_notes?: string;
  }
): Promise<Adjustment> {
  return apiFetch<Adjustment>(`/adjustments/${adjustmentId}/review`, {
    method: "POST",
    body: JSON.stringify(review),
  });
}

export async function deleteAdjustment(adjustmentId: string): Promise<void> {
  return apiFetch<void>(`/adjustments/${adjustmentId}`, {
    method: "DELETE",
  });
}

export async function getAdjustmentHistory(adjustmentId: string): Promise<any[]> {
  return apiFetch<any[]>(`/adjustments/${adjustmentId}/history`);
}

export async function getActiveAdjustment(
  itemId: string,
  periodStartDate: string,
  runId?: string
): Promise<Adjustment | null> {
  const searchParams = new URLSearchParams({
    period_start_date: periodStartDate,
  });
  if (runId) searchParams.set("run_id", runId);

  return apiFetch<Adjustment | null>(`/adjustments/active/${itemId}?${searchParams.toString()}`);
}

export async function getAdjustmentTemplates(): Promise<AdjustmentTemplate[]> {
  return apiFetch<AdjustmentTemplate[]>("/adjustments/templates/list");
}

export async function applyTemplate(
  templateId: string,
  params: {
    item_id: string;
    run_id: string;
    horizon: number;
    period_start_date: string;
    original_p50: number;
    adjusted_by: string;
  }
): Promise<Adjustment> {
  const searchParams = new URLSearchParams({
    item_id: params.item_id,
    run_id: params.run_id,
    horizon: params.horizon.toString(),
    period_start_date: params.period_start_date,
    original_p50: params.original_p50.toString(),
    adjusted_by: params.adjusted_by,
  });

  return apiFetch<Adjustment>(`/adjustments/templates/${templateId}/apply?${searchParams.toString()}`, {
    method: "POST",
  });
}
