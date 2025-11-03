"use client";

import * as React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

import type {
  ActualHistoryPoint,
  ForecastBandPoint,
} from "@/lib/item-insights";

interface ChartDatum {
  date: Date;
  label: string;
  actual?: number;
  forecast?: number;
  pi80Lower?: number;
  pi80Range?: number;
  pi95Lower?: number;
  pi95Range?: number;
  isFlagged?: boolean;
}

interface ChartTooltipPayload {
  payload?: ChartDatum;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
}

interface ItemForecastChartProps {
  actuals: ActualHistoryPoint[];
  forecast: ForecastBandPoint[];
  forecastOriginDate: string | null;
}

const legendPayload = [
  { value: "Actuals", type: "line", color: "#111827" },
  { value: "Forecast", type: "line", color: "#2563eb" },
  { value: "80% interval", type: "square", color: "rgba(37, 99, 235, 0.28)" },
  { value: "95% interval", type: "square", color: "rgba(165, 180, 252, 0.38)" },
];

function createChartData(
  actuals: ActualHistoryPoint[],
  forecast: ForecastBandPoint[]
): ChartDatum[] {
  const byKey = new Map<string, ChartDatum>();

  for (const point of actuals) {
    const date = new Date(point.date);
    const key = format(date, "yyyy-MM");
    byKey.set(key, {
      date,
      label: format(date, "MMM yyyy"),
      actual: point.value,
      isFlagged: point.isFlagged,
    });
  }

  for (const point of forecast) {
    const date = new Date(point.date);
    const key = format(date, "yyyy-MM");
    const existing = byKey.get(key) ?? {
      date,
      label: format(date, "MMM yyyy"),
    };

    const pi80Lower =
      point.pi80Lower != null ? Math.max(0, point.pi80Lower) : undefined;
    const pi80Upper =
      point.pi80Upper != null ? Math.max(0, point.pi80Upper) : undefined;
    const pi95Lower =
      point.pi95Lower != null ? Math.max(0, point.pi95Lower) : undefined;
    const pi95Upper =
      point.pi95Upper != null ? Math.max(0, point.pi95Upper) : undefined;

    byKey.set(key, {
      ...existing,
      forecast: point.point ?? undefined,
      pi80Lower,
      pi80Range:
        pi80Lower != null && pi80Upper != null
          ? Math.max(pi80Upper - pi80Lower, 0)
          : undefined,
      pi95Lower,
      pi95Range:
        pi95Lower != null && pi95Upper != null
          ? Math.max(pi95Upper - pi95Lower, 0)
          : undefined,
    });
  }

  return Array.from(byKey.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}

function formatNumber(value: number | null | undefined): string {
  if (value == null) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

const tooltipStyles: React.CSSProperties = {
  backgroundColor: "white",
  border: "1px solid rgba(229, 231, 235, 1)",
  borderRadius: "0.75rem",
  padding: "0.75rem 1rem",
  boxShadow:
    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
};

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) {
    return null;
  }

  return (
    <div style={tooltipStyles}>
      <div className="text-sm font-medium text-neutral-900">{label}</div>
      <dl className="mt-2 space-y-1 text-xs text-neutral-600">
        <div className="flex items-center justify-between gap-6">
          <dt>Actual</dt>
          <dd className="font-semibold text-neutral-900">
            {formatNumber(datum.actual)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6">
          <dt>Forecast</dt>
          <dd className="font-semibold text-blue-600">
            {formatNumber(datum.forecast)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6">
          <dt>80% PI</dt>
          <dd>
            {formatNumber(
              datum.pi80Lower != null ? datum.pi80Lower : undefined
            )}
            {" – "}
            {formatNumber(
              datum.pi80Lower != null && datum.pi80Range != null
                ? datum.pi80Lower + datum.pi80Range
                : undefined
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6">
          <dt>95% PI</dt>
          <dd>
            {formatNumber(
              datum.pi95Lower != null ? datum.pi95Lower : undefined
            )}
            {" – "}
            {formatNumber(
              datum.pi95Lower != null && datum.pi95Range != null
                ? datum.pi95Lower + datum.pi95Range
                : undefined
            )}
          </dd>
        </div>
      </dl>
      {datum.isFlagged ? (
        <p className="mt-3 text-xs text-amber-600">
          Flagged for review (data quality issue)
        </p>
      ) : null}
    </div>
  );
}

function ActualDot({
  cx,
  cy,
  payload,
}: {
  cx?: number;
  cy?: number;
  payload?: ChartDatum;
}) {
  if (cx == null || cy == null) {
    return null;
  }
  const isFlagged = payload?.isFlagged;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={isFlagged ? "#f97316" : "#111827"}
        stroke={isFlagged ? "#fb923c" : "#fff"}
        strokeWidth={isFlagged ? 2 : 1.5}
      />
    </g>
  );
}

export function ItemForecastChart({
  actuals,
  forecast,
  forecastOriginDate,
}: ItemForecastChartProps) {
  const chartData = React.useMemo(
    () => createChartData(actuals, forecast),
    [actuals, forecast]
  );

  const originLabel = React.useMemo(() => {
    if (!forecastOriginDate) {
      return null;
    }
    const date = new Date(forecastOriginDate);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return format(date, "MMM yyyy");
  }, [forecastOriginDate]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed border-neutral-200 text-sm text-neutral-500">
        No history available for this item.
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 16, right: 24, left: 8, bottom: 16 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
            height={40}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="left"
            height={48}
            iconType="circle"
            payload={legendPayload}
          />
          {originLabel ? (
            <ReferenceLine
              x={originLabel}
              stroke="#6b7280"
              strokeDasharray="6 6"
              label={{
                value: "Forecast begins",
                position: "insideTop",
                fill: "#6b7280",
                fontSize: 12,
                dy: -6,
              }}
            />
          ) : null}
          <Area
            type="monotone"
            dataKey="pi95Lower"
            stackId="pi95"
            stroke="none"
            fill="transparent"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="pi95Range"
            stackId="pi95"
            stroke="none"
            fill="rgba(165, 180, 252, 0.38)"
            isAnimationActive={false}
            name="95% interval"
          />
          <Area
            type="monotone"
            dataKey="pi80Lower"
            stackId="pi80"
            stroke="none"
            fill="transparent"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="pi80Range"
            stackId="pi80"
            stroke="none"
            fill="rgba(37, 99, 235, 0.28)"
            isAnimationActive={false}
            name="80% interval"
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#2563eb"
            strokeDasharray="6 4"
            strokeWidth={2}
            dot={false}
            name="Forecast"
            activeDot={{ r: 5, strokeWidth: 2, fill: "#2563eb" }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#111827"
            strokeWidth={2}
            dot={<ActualDot />}
            connectNulls
            name="Actuals"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
