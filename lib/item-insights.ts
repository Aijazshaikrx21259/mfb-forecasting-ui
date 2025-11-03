import { addMonths, format as formatDate, parseISO } from "date-fns";

import {
  getBacktestItemDetail,
  type BacktestWindowError,
} from "@/lib/api/backtest";
import {
  getItemFlags,
  type MonthFlagResponse,
} from "@/lib/api/data-quality";
import {
  getItemForecast,
  getLatestRunMetadata,
  getPlan,
  type ChampionSummary,
  type ForecastPoint,
  type ItemForecastResponse,
  type PlanItem,
  type RunMetadataResponse,
} from "@/lib/api/forecast";

export interface ActualHistoryPoint {
  date: string;
  value: number;
  isFlagged: boolean;
}

export interface ForecastBandPoint {
  date: string;
  horizon: number;
  method: string;
  point: number | null;
  pi80Lower: number | null;
  pi80Upper: number | null;
  pi95Lower: number | null;
  pi95Upper: number | null;
}

export interface SuggestionSummary {
  quantity: number | null;
  horizonMonths: number;
  periodStartDate: string | null;
  method: string | null;
  basis: string;
  pi80: [number | null, number | null];
  pi95: [number | null, number | null];
  runId: string | null;
}

export interface ItemInsightData {
  itemId: string;
  suggestion: SuggestionSummary | null;
  forecastBands: ForecastBandPoint[];
  actualHistory: ActualHistoryPoint[];
  runMetadata: RunMetadataResponse | null;
  champions: ChampionSummary[];
  forecastOriginDate: string | null;
  notes: {
    limitedHistory: boolean;
    hasActuals: boolean;
    forecastUnavailable: boolean;
    forecastErrorMessage: string | null;
  };
}

function safeParseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthKey(date: Date): string {
  return formatDate(date, "yyyy-MM");
}

function computeActualHistory(
  windows: BacktestWindowError[],
  flags: MonthFlagResponse[]
): ActualHistoryPoint[] {
  const horizonOne = windows.filter((window) => window.horizon_months === 1);
  if (horizonOne.length === 0) {
    return [];
  }

  const flagSet = new Set(
    flags.filter((flag) => flag.is_active).map((flag) => flag.month_key)
  );

  const historyMap = new Map<string, ActualHistoryPoint>();

  for (const window of horizonOne) {
    const origin = safeParseDate(window.origin_month);
    if (!origin) {
      continue;
    }
    const periodDate = addMonths(origin, window.horizon_months);
    const key = monthKey(periodDate);
    historyMap.set(key, {
      date: formatDate(periodDate, "yyyy-MM-dd"),
      value: window.y_true,
      isFlagged: flagSet.has(key),
    });
  }

  return Array.from(historyMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

function computePi95(
  point: number | null,
  pi80Lower: number | null,
  pi80Upper: number | null,
  rmse: number | null
): [number | null, number | null] {
  if (point == null) {
    return [null, null];
  }

  if (rmse != null) {
    const lower = Math.max(0, point - 1.96 * rmse);
    const upper = Math.max(0, point + 1.96 * rmse);
    return [lower, upper];
  }

  if (pi80Lower != null && pi80Upper != null) {
    const halfWidth = (pi80Upper - pi80Lower) / 2;
    if (halfWidth > 0) {
      const zFor80 = 1.28155;
      const sigma = halfWidth / zFor80;
      const lower = Math.max(0, point - 1.96 * sigma);
      const upper = Math.max(0, point + 1.96 * sigma);
      return [lower, upper];
    }
  }

  return [null, null];
}

function buildForecastBands(
  response: ItemForecastResponse,
  champions: Record<number, ChampionSummary>
): ForecastBandPoint[] {
  return response.forecasts
    .map((entry: ForecastPoint) => {
      const rmse = champions[entry.horizon]?.rmse ?? null;
      const pi80Lower = entry.p10 ?? null;
      const pi80Upper = entry.p90 ?? null;
      const [pi95Lower, pi95Upper] = computePi95(
        entry.p50 ?? null,
        pi80Lower,
        pi80Upper,
        rmse
      );
      return {
        date: entry.period_start_date,
        horizon: entry.horizon,
        method: entry.method,
        point: entry.p50 ?? null,
        pi80Lower,
        pi80Upper,
        pi95Lower,
        pi95Upper,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function deriveSuggestion(
  planItem: PlanItem | undefined,
  firstForecast: ForecastBandPoint | undefined,
  runId: string | null
): SuggestionSummary | null {
  if (!planItem) {
    return null;
  }

  const pi80: [number | null, number | null] = [
    planItem.p10 ?? null,
    planItem.p90 ?? null,
  ];

  let pi95: [number | null, number | null] = [null, null];
  if (firstForecast) {
    pi95 = [
      firstForecast.pi95Lower ?? null,
      firstForecast.pi95Upper ?? null,
    ];
  }

  return {
    quantity: planItem.p50 ?? null,
    horizonMonths: 1,
    periodStartDate: planItem.period_start_date ?? null,
    method: planItem.method ?? null,
    basis: "Median (p50)",
    pi80,
    pi95,
    runId,
  };
}

function determineForecastOrigin(
  actualHistory: ActualHistoryPoint[],
  forecastBands: ForecastBandPoint[]
): string | null {
  if (actualHistory.length === 0) {
    const firstForecastDate = safeParseDate(forecastBands[0]?.date);
    return firstForecastDate ? formatDate(addMonths(firstForecastDate, -1), "yyyy-MM-dd") : null;
  }
  const lastActualDate = actualHistory[actualHistory.length - 1];
  return lastActualDate.date;
}

export async function loadItemInsight(itemId: string): Promise<ItemInsightData> {
  let forecastError: Error | null = null;

  const forecastPromise = getItemForecast(itemId).catch((error) => {
    forecastError = error as Error;
    return null;
  });

  const [forecast, plan, backtest, flags, runMetadata] = await Promise.all([
    forecastPromise,
    getPlan(1).catch(() => null),
    getBacktestItemDetail(itemId, [1]).catch(() => null),
    getItemFlags(itemId).catch(() => []),
    getLatestRunMetadata().catch(() => null),
  ]);

  const championMap = Object.fromEntries(
    (forecast?.champions ?? []).map((champion) => [champion.horizon, champion])
  );

  const forecastBands = forecast
    ? buildForecastBands(forecast, championMap)
    : [];

  const backtestHistory =
    backtest?.windows && backtest.windows.length > 0 ? backtest.windows : [];
  const flagsForItem = flags ?? [];
  const actualHistory = computeActualHistory(backtestHistory, flagsForItem);

  const planItem = plan?.items?.find((item) => item.item_id === itemId);
  const suggestionRunId = (forecast?.run_id ?? plan?.run_id) ?? null;

  const suggestion = deriveSuggestion(
    planItem,
    forecastBands[0],
    suggestionRunId
  );

  const forecastOriginDate = determineForecastOrigin(
    actualHistory,
    forecastBands
  );

  const forecastUnavailable = !forecast || forecastBands.length === 0;

  return {
    itemId,
    suggestion,
    forecastBands,
    actualHistory,
    runMetadata,
    champions: forecast?.champions ?? [],
    forecastOriginDate,
    notes: {
      limitedHistory: actualHistory.length > 0 && actualHistory.length < 6,
      hasActuals: actualHistory.length > 0,
      forecastUnavailable,
      forecastErrorMessage: (forecastError as Error | null)?.message ?? null,
    },
  };
}
