import { apiFetch } from "@/lib/api-client";

export interface BacktestItemSummary {
  item_id: string;
  model_name: string;
  horizon_months: number;
  n_windows: number;
  n_windows_mape_den: number | null;
  mape: number | null;
  rmse: number | null;
  beats_benchmark: boolean;
  run_id: string;
  created_at: string;
}

export interface BacktestItemSummaryPage {
  items: BacktestItemSummary[];
  total_count: number;
  page: number;
  page_size: number;
  run_id: string;
}

export interface BacktestWindowError {
  item_id: string;
  origin_month: string;
  horizon_months: number;
  model_name: string;
  y_true: number;
  y_pred: number;
  err: number;
  abs_pct_err: number | null;
  run_id: string;
  created_at: string;
}

export interface BacktestItemDetailResponse {
  item_id: string;
  summaries: BacktestItemSummary[];
  windows: BacktestWindowError[];
  run_id: string;
}

interface GetBacktestItemsParams {
  page?: number;
  pageSize?: number;
  horizons?: number[];
  modelName?: string;
  beatsBenchmark?: boolean;
}

export async function getBacktestItems(
  params: GetBacktestItemsParams = {}
): Promise<BacktestItemSummaryPage> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("page_size", String(params.pageSize ?? 50));

  if (params.horizons && params.horizons.length > 0) {
    searchParams.set("h", params.horizons.join(","));
  }

  if (typeof params.beatsBenchmark === "boolean") {
    searchParams.set("beats_benchmark", String(params.beatsBenchmark));
  }

  if (params.modelName) {
    searchParams.set("model_name", params.modelName);
  }

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<BacktestItemSummaryPage>(`/backtest/items${suffix}`);
}

export async function getBacktestItemDetail(
  itemId: string,
  horizons?: number[]
): Promise<BacktestItemDetailResponse> {
  const params = new URLSearchParams();
  if (horizons && horizons.length > 0) {
    params.set("h", horizons.join(","));
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<BacktestItemDetailResponse>(
    `/backtest/items/${encodeURIComponent(itemId)}${suffix}`
  );
}
