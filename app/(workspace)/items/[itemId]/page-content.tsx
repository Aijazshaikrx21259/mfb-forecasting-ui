"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { CalendarDays, Database } from "lucide-react";

import { type ItemInsightData } from "@/lib/item-insights";
import { PurchaseSuggestionCard } from "@/components/item/purchase-suggestion-card";
import { ItemForecastChart } from "@/components/item/item-forecast-chart";
import { SeriesExportButton } from "@/components/item/series-export-button";
import { RunProvenanceButton } from "@/components/item/run-provenance-button";
import { AutoForecastTrigger } from "@/components/item/auto-forecast-trigger";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface PageContentProps {
  itemId: string;
  initialInsight: ItemInsightData;
}

function formatRunTimestamp(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const distance = formatDistanceToNow(parsed, { addSuffix: true });
  return `${format(parsed, "MMM d, yyyy")} • ${distance}`;
}

export function PageContent({ itemId, initialInsight }: PageContentProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insight = initialInsight;

  const handleForecastComplete = () => {
    setIsRefreshing(true);
    // Refresh the page to show the new forecast
    router.refresh();
  };

  const runTimestamp =
    insight.runMetadata?.forecast_generated_at ??
    insight.runMetadata?.updated_at ??
    null;
  const runTimestampLabel = formatRunTimestamp(runTimestamp);

  const forecastUnavailableMessage = (() => {
    if (!insight.notes.forecastUnavailable) {
      return null;
    }
    const detail = insight.notes.forecastErrorMessage ?? "";
    if (detail.includes("(404)")) {
      return "auto-trigger"; // Special flag to show auto-trigger component
    }
    if (detail) {
      return detail;
    }
    return "The forecasting API did not return data for this item. Verify that the forecasting run exists and the API key/base URL are configured.";
  })();

  const showAutoTrigger = forecastUnavailableMessage === "auto-trigger";
  const showStaticError =
    forecastUnavailableMessage && forecastUnavailableMessage !== "auto-trigger";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-12 pt-6">
      <div className="space-y-4">
        <nav className="text-sm text-neutral-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link
                href="/items"
                className="text-neutral-500 underline-offset-4 hover:text-neutral-800 hover:underline"
              >
                Items
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="font-medium text-neutral-900">{itemId}</span>
            </li>
          </ol>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          {runTimestampLabel ? (
            <Badge variant="subtle" className="gap-2 bg-neutral-100 text-neutral-700">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Last forecast run {runTimestampLabel}
            </Badge>
          ) : null}
          {insight.runMetadata?.run_id ? (
            <Badge variant="subtle" className="gap-2 bg-neutral-100 text-neutral-700">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Run ID {insight.runMetadata.run_id}
            </Badge>
          ) : null}
          <Badge variant="outline" className="border-blue-200 text-blue-700">
            Data source: Forecasting warehouse
          </Badge>
        </div>
      </div>

      <PurchaseSuggestionCard suggestion={insight.suggestion} itemId={itemId} />

      {showAutoTrigger && !isRefreshing ? (
        <AutoForecastTrigger
          itemId={itemId}
          onComplete={handleForecastComplete}
        />
      ) : null}

      {showStaticError ? (
        <Alert>
          <p className="font-semibold">Forecast unavailable</p>
          <p className="mt-1 text-sm">{forecastUnavailableMessage}</p>
        </Alert>
      ) : null}

      {isRefreshing ? (
        <Alert className="border-blue-200 bg-blue-50/50">
          <p className="font-semibold">Refreshing forecast data...</p>
          <p className="mt-1 text-sm">Loading updated forecast information.</p>
        </Alert>
      ) : null}

      {insight.notes.limitedHistory ? (
        <Alert>
          <div>
            <p className="font-semibold">Limited history</p>
            <p className="mt-1">
              We only have {insight.actualHistory.length} months of recent
              actuals. Prediction intervals are widened to reflect the higher
              uncertainty.
            </p>
          </div>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-900">
            History and forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insight.forecastBands.length === 0 && insight.actualHistory.length === 0 ? (
            <p className="text-sm text-neutral-600">
              No historical actuals or forecast bands are available yet for this item.
            </p>
          ) : (
            <>
              <ItemForecastChart
                actuals={insight.actualHistory}
                forecast={insight.forecastBands}
                forecastOriginDate={insight.forecastOriginDate}
              />
              <p className="mt-4 text-xs text-neutral-500">
                Actuals use calendar month demand. Forecast intervals show 80% and 95%
                prediction bands; opacity increases as uncertainty narrows.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-900">
            Champion models
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insight.champions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-sm">
                <thead className="bg-neutral-50 text-left">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-semibold text-neutral-700">
                      Horizon (months)
                    </th>
                    <th scope="col" className="px-4 py-2 font-semibold text-neutral-700">
                      Method
                    </th>
                    <th scope="col" className="px-4 py-2 font-semibold text-neutral-700">
                      MAPE
                    </th>
                    <th scope="col" className="px-4 py-2 font-semibold text-neutral-700">
                      RMSE
                    </th>
                    <th scope="col" className="px-4 py-2 font-semibold text-neutral-700">
                      Beats benchmark?
                    </th>
                    <th scope="col" className="px-4 py-2 font-semibold text-neutral-700">
                      Needs review?
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {insight.champions.map((champion) => (
                    <tr key={`${champion.horizon}-${champion.method}`}>
                      <td className="px-4 py-2 text-neutral-900">
                        {champion.horizon}
                      </td>
                      <td className="px-4 py-2 text-neutral-700">
                        {champion.method}
                      </td>
                      <td className="px-4 py-2">
                        {champion.mape != null
                          ? `${champion.mape.toFixed(2)}%`
                          : "-"}
                      </td>
                      <td className="px-4 py-2">
                        {champion.rmse != null
                          ? champion.rmse.toFixed(2)
                          : "-"}
                      </td>
                      <td className="px-4 py-2">
                        {champion.beats_baseline ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-2">
                        {champion.needs_review ? (
                          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                            Needs review
                          </Badge>
                        ) : (
                          "No"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-neutral-600">
              Champion summary is unavailable for this item.
            </p>
          )}
          <p className="text-xs text-neutral-500">
            Metrics derive from rolling-origin cross validation. RMSE anchors the
            wider 95% prediction interval when available.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white/70 p-4">
        <div className="space-y-1 text-sm text-neutral-600">
          <p className="font-medium text-neutral-900">
            Need to take this offline?
          </p>
          <p>
            Export the visible series or reference the forecasting run for audit
            trails.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SeriesExportButton
            itemId={itemId}
            actuals={insight.actualHistory}
            forecast={insight.forecastBands}
          />
          {insight.runMetadata?.run_id ? (
            <RunProvenanceButton runId={insight.runMetadata.run_id} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

