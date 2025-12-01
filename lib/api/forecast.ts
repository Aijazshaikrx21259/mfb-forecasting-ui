import { apiFetch } from "@/lib/api-client";

export interface ChampionSummary {
  horizon: number;
  method: string;
  mape: number | null;
  rmse: number | null;
  beats_baseline: boolean;
  needs_review: boolean;
}

export interface ForecastPoint {
  horizon: number;
  period_start_date: string;
  method: string;
  p50: number | null;
  p10: number | null;
  p90: number | null;
}

export interface ItemForecastResponse {
  item_id: string;
  run_id: string;
  champions: ChampionSummary[];
  forecasts: ForecastPoint[];
}

export interface PlanItem {
  item_id: string;
  period_start_date: string;
  method: string;
  p50: number | null;
  p10: number | null;
  p90: number | null;
}

export interface PlanResponse {
  run_id: string;
  horizon: number;
  items: PlanItem[];
}

// Enhanced plan item for UI with computed/enriched fields
export interface EnhancedPlanItem extends PlanItem {
  item_name?: string;
  category?: string;
  vendor?: string;
  suggested_qty: number; // p50
  pi80_low: number | null; // p10
  pi80_high: number | null; // p90
  lead_time_days?: number;
  unit_cost?: number;
  priority: number; // computed 0-1 score
  flags: string[]; // ["risk", "anomaly", "stockout_suspect"]
  notes?: string;
}

export interface RunMetadataResponse {
  run_id: string;
  horizons: number[];
  status: string;
  items_evaluated: number | null;
  items_with_champion: number | null;
  items_beating_baseline: number | null;
  items_forecasted: number | null;
  champion_counts: Record<string, number> | null;
  created_at: string;
  updated_at: string;
  forecast_generated_at: string | null;
}

export async function getItemForecast(
  itemId: string,
  horizons?: number[]
): Promise<ItemForecastResponse> {
  const params = new URLSearchParams();
  if (horizons && horizons.length > 0) {
    params.set("h", horizons.join(","));
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<ItemForecastResponse>(
    `/forecasts/items/${encodeURIComponent(itemId)}${suffix}`
  );
}

export async function getPlan(
  horizon: number = 1
): Promise<PlanResponse> {
  const params = new URLSearchParams({ horizon: String(horizon) });
  return apiFetch<PlanResponse>(`/forecast/plan?${params.toString()}`);
}

export async function getLatestRunMetadata(): Promise<RunMetadataResponse> {
  return apiFetch<RunMetadataResponse>("/forecast/runs/latest");
}
