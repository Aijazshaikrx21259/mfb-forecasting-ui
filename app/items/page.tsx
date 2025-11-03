import Link from "next/link";
import { format } from "date-fns";
import { getBacktestItems } from "@/lib/api/backtest";
import { getPlan } from "@/lib/api/forecast";
import { ItemSearchForm } from "@/components/item/item-search-form";
import { ManualItemPicker } from "@/components/item/manual-item-picker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatMonth(period: string | null | undefined): string {
  if (!period) {
    return "—";
  }
  const parsed = new Date(period);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return format(parsed, "MMM yyyy");
}

function formatQuantity(value: number | null | undefined): string {
  if (value == null) {
    return "—";
  }
  return integerFormatter.format(value);
}

function formatInterval(
  lower: number | null | undefined,
  upper: number | null | undefined
): string {
  if (lower == null || upper == null) {
    return "—";
  }
  return `${integerFormatter.format(lower)} – ${integerFormatter.format(upper)}`;
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) {
    return "—";
  }
  return `${percentFormatter.format(value)}%`;
}

export default async function ItemsPage() {
  const [planResult, backtestResult] = await Promise.allSettled([
    getPlan(1),
    getBacktestItems({ pageSize: 100 }),
  ] as const);

  const plan = planResult.status === "fulfilled" ? planResult.value : null;
  const backtest =
    backtestResult.status === "fulfilled" ? backtestResult.value : null;

  const planError =
    planResult.status === "rejected" ? (planResult.reason as Error) : null;
  const rawBacktestError =
    backtestResult.status === "rejected"
      ? (backtestResult.reason as Error)
      : null;

  const backtestErrorMessage = rawBacktestError?.message ?? "";
  const backtestNotFound = backtestErrorMessage.includes("(404)");
  const backtestError = backtestNotFound ? null : rawBacktestError;

  const planItems = plan?.items ?? [];
  const planMap = new Map(planItems.map((item) => [item.item_id, item]));

  const backtestItems = backtest?.items ?? [];
  const backtestMap = new Map(
    backtestItems.map((item) => [item.item_id, item])
  );

  const orderedIds: string[] = [];
  const seen = new Set<string>();

  for (const item of planItems) {
    if (!seen.has(item.item_id)) {
      seen.add(item.item_id);
      orderedIds.push(item.item_id);
    }
  }

  for (const item of backtestItems) {
    if (!seen.has(item.item_id)) {
      seen.add(item.item_id);
      orderedIds.push(item.item_id);
    }
  }

  const rows = orderedIds.slice(0, 100).map((itemId) => ({
    itemId,
    plan: planMap.get(itemId),
    backtest: backtestMap.get(itemId),
  }));

  const hasRows = rows.length > 0;
  const hasSuggestions = planItems.length > 0;

  let errorBanner: string | null = null;
  if (planError) {
    errorBanner =
      "Unable to reach the forecasting API. Verify that the backend is running on port 8000 and that the UI has a matching API base URL and API key (see .env.example).";
  } else if (backtestError) {
    errorBanner =
      "Backtest summaries are unavailable right now. Once the backtest pipeline writes analytics.backtest_item_summary, this section will populate automatically.";
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Purchase planning items
        </h1>
        <p className="text-sm text-neutral-600">
          Select an item to view recent history, forecast bands, and ordering
          guidance.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-5 shadow-sm">
          <ItemSearchForm />
          <p className="mt-2 text-xs text-neutral-500">
            Navigate directly to any item ID, even if it is not listed in the
            suggestions below. Press enter after typing the identifier.
          </p>
        </div>
        <ManualItemPicker />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-neutral-900">
              Next-month suggestions
            </CardTitle>
            <p className="text-sm text-neutral-600">
              Showing up to 100 items from the forecast plan or latest backtest
              run.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              Horizon: 1 month
            </Badge>
            {plan?.run_id ? (
              <Badge variant="subtle" className="bg-neutral-100 text-neutral-700">
                Plan run {plan.run_id}
              </Badge>
            ) : null}
            {backtest?.run_id ? (
              <Badge variant="subtle" className="bg-neutral-100 text-neutral-700">
                Backtest run {backtest.run_id}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {errorBanner ? (
            <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
              {errorBanner}
            </div>
          ) : null}
          {backtestNotFound ? (
            <div className="border-b border-blue-100 bg-blue-50 px-6 py-4 text-sm text-blue-800">
              Backtest metrics have not been generated yet for this run. Once a
              backtest is stored in analytics.backtest_item_summary, accuracy
              columns will appear here.
            </div>
          ) : null}
          {!hasSuggestions && hasRows ? (
            <div className="border-b border-blue-100 bg-blue-50 px-6 py-4 text-sm text-blue-800">
              No next-month purchase suggestions are available yet. Showing the
              latest backtest items so you can still open an item page and view
              forecast bands.
            </div>
          ) : null}
          {hasRows ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-sm">
                <thead className="bg-neutral-50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-neutral-700">
                      Item ID
                    </th>
                    <th className="px-4 py-2 font-semibold text-neutral-700">
                      Suggested qty
                    </th>
                    <th className="px-4 py-2 font-semibold text-neutral-700">
                      80% interval
                    </th>
                    <th className="px-4 py-2 font-semibold text-neutral-700">
                      Period
                    </th>
                    <th className="px-4 py-2 font-semibold text-neutral-700">
                      Method
                    </th>
                    <th className="px-4 py-2 font-semibold text-neutral-700">
                      Backtest MAPE
                    </th>
                    <th className="px-4 py-2 font-semibold text-neutral-700">
                      Beats benchmark?
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {rows.map(({ itemId, plan: planRow, backtest: backtestRow }) => (
                    <tr key={itemId} className="hover:bg-neutral-50">
                      <td className="px-4 py-2">
                        <Link
                          href={`/items/${encodeURIComponent(itemId)}`}
                          className="font-medium text-blue-700 underline-offset-4 hover:text-blue-600 hover:underline"
                        >
                          {itemId}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-neutral-900">
                        {formatQuantity(planRow?.p50)}
                      </td>
                      <td className="px-4 py-2 text-neutral-600">
                        {formatInterval(planRow?.p10, planRow?.p90)}
                      </td>
                      <td className="px-4 py-2 text-neutral-600">
                        {formatMonth(planRow?.period_start_date)}
                      </td>
                      <td className="px-4 py-2 text-neutral-600">
                        {planRow?.method ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-neutral-600">
                        {formatPercent(backtestRow?.mape)}
                      </td>
                      <td className="px-4 py-2 text-neutral-600">
                        {backtestRow
                          ? backtestRow.beats_benchmark
                            ? "Yes"
                            : "No"
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-neutral-600">
              No planning suggestions are available yet. Run the forecast
              pipeline to populate this view.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
