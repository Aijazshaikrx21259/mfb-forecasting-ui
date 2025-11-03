"use client";

import * as React from "react";

import type {
  ActualHistoryPoint,
  ForecastBandPoint,
} from "@/lib/item-insights";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface SeriesExportButtonProps {
  itemId: string;
  actuals: ActualHistoryPoint[];
  forecast: ForecastBandPoint[];
}

export function SeriesExportButton({
  itemId,
  actuals,
  forecast,
}: SeriesExportButtonProps) {
  const handleExport = React.useCallback(() => {
    const rows: Array<Record<string, string | number | boolean>> = [];

    for (const point of actuals) {
      rows.push({
        date: point.date,
        actual: point.value,
        forecast: "",
        pi80_lower: "",
        pi80_upper: "",
        pi95_lower: "",
        pi95_upper: "",
        is_flagged: point.isFlagged,
      });
    }

    for (const point of forecast) {
      rows.push({
        date: point.date,
        actual: "",
        forecast: point.point ?? "",
        pi80_lower: point.pi80Lower ?? "",
        pi80_upper: point.pi80Upper ?? "",
        pi95_lower: point.pi95Lower ?? "",
        pi95_upper: point.pi95Upper ?? "",
        is_flagged: "",
      });
    }

    const header = Object.keys(rows[0] ?? {});
    const csv = [
      header.join(","),
      ...rows.map((row) =>
        header
          .map((key) => {
            const value = row[key];
            if (value === "" || value === null || value === undefined) {
              return "";
            }
            if (typeof value === "string") {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value);
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${itemId}-series.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [actuals, forecast, itemId]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={actuals.length === 0 && forecast.length === 0}
      className="gap-2"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Export visible series (CSV)
    </Button>
  );
}
