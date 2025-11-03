"use client";

import * as React from "react";
import { format } from "date-fns";
import { Download, Info } from "lucide-react";

import type { SuggestionSummary } from "@/lib/item-insights";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface PurchaseSuggestionCardProps {
  suggestion: SuggestionSummary | null;
  itemId: string;
}

function formatQuantity(value: number | null): string {
  if (value == null) {
    return "Not available";
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatInterval(
  interval: [number | null, number | null],
  fallbackLabel = "—"
): string {
  const [lower, upper] = interval;
  if (lower == null || upper == null) {
    return fallbackLabel;
  }
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });
  return `${formatter.format(lower)} – ${formatter.format(upper)}`;
}

function formatMonth(date: string | null): string {
  if (!date) {
    return "next month";
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "next month";
  }
  return format(parsed, "MMM yyyy");
}

function ExportButton({
  suggestion,
  itemId,
}: {
  suggestion: SuggestionSummary | null;
  itemId: string;
}) {
  const handleExport = React.useCallback(() => {
    if (!suggestion) {
      return;
    }
    const rows = [
      ["Item ID", itemId],
      ["Horizon (months)", String(suggestion.horizonMonths)],
      ["Period start", suggestion.periodStartDate ?? ""],
      ["Method", suggestion.method ?? ""],
      ["Basis", suggestion.basis],
      ["Suggested quantity", suggestion.quantity ?? ""],
      ["80% PI lower", suggestion.pi80[0] ?? ""],
      ["80% PI upper", suggestion.pi80[1] ?? ""],
      ["95% PI lower", suggestion.pi95[0] ?? ""],
      ["95% PI upper", suggestion.pi95[1] ?? ""],
      ["Run ID", suggestion.runId ?? ""],
    ];
    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            typeof value === "number" ? value.toString() : `"${String(value)}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${itemId}-next-month-suggestion.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [suggestion, itemId]);

  return (
    <Button
      variant="outline"
      size="sm"
      type="button"
      onClick={handleExport}
      disabled={!suggestion}
      className="gap-2"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Export CSV
    </Button>
  );
}

export function PurchaseSuggestionCard({
  suggestion,
  itemId,
}: PurchaseSuggestionCardProps) {
  const primaryValue = formatQuantity(suggestion?.quantity ?? null);
  const periodLabel = formatMonth(suggestion?.periodStartDate ?? null);
  const pi80 = formatInterval(suggestion?.pi80 ?? [null, null]);
  const pi95 = formatInterval(
    suggestion?.pi95 ?? [null, null],
    "Unavailable"
  );

  return (
    <Card className="bg-gradient-to-br from-white via-white to-blue-50/80">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            Next Month Suggested Purchase
          </CardTitle>
          <CardDescription>
            Based on forecast median with uncertainty ranges.
          </CardDescription>
        </div>
        {suggestion?.method ? (
          <Badge variant="subtle" className="bg-blue-100 text-blue-700">
            {suggestion.method}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-neutral-600">
            Suggested order for {periodLabel}
          </p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-neutral-900">
            {primaryValue} cases
          </p>
        </div>
        <div className="grid gap-4 rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-900 md:grid-cols-2">
          <div>
            <p className="font-medium text-blue-800">80% prediction interval</p>
            <p className="mt-1 text-blue-900">{pi80}</p>
          </div>
          <div>
            <p className="font-medium text-blue-800">95% prediction interval</p>
            <p className="mt-1 text-blue-900">{pi95}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-2">
                <Info className="h-4 w-4" aria-hidden="true" />
                See calculation basis
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-l-xl">
              <DialogHeader>
                <DialogTitle>How we computed this suggestion</DialogTitle>
                <DialogDescription>
                  We surface the median forecast and prediction intervals so you
                  can balance upside and downside risk.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 overflow-auto p-6 pt-0 text-sm text-neutral-700">
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    Forecast basis
                  </h4>
                  <p className="mt-1">
                    {suggestion?.quantity != null
                      ? `Median forecast (p50): ${formatInterval([
                          suggestion.quantity,
                          suggestion.quantity,
                        ])} cases`
                      : "Median forecast (p50) was unavailable for this item."}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    Intervals
                  </h4>
                  <ul className="mt-1 space-y-1">
                    <li>
                      80%: {pi80} cases — shows likely swing under typical
                      volatility.
                    </li>
                    <li>
                      95%: {pi95} cases — useful for stress testing and safety
                      stock decisions.
                    </li>
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-neutral-900">Context</h4>
                  <p className="mt-1">
                    Inputs consider recent demand history and the champion model
                    for horizon 1. Intervals widen for volatile series so users
                    can gauge risk at a glance.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <p className="text-xs text-neutral-500">
                  {suggestion?.runId
                    ? `Forecast run: ${suggestion.runId}`
                    : "Run identifier unavailable."}
                </p>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ExportButton suggestion={suggestion} itemId={itemId} />
        </div>
      </CardContent>
    </Card>
  );
}
