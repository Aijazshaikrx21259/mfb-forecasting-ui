"use client";

import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";

interface ForecastDataPoint {
  period: string;
  actual?: number;
  forecast: number;
  p10: number;
  p90: number;
}

interface ForecastChartProps {
  data: ForecastDataPoint[];
  title?: string;
  showConfidenceBands?: boolean;
  height?: number;
}

export function ForecastChart({
  data,
  title = "Forecast with Confidence Bands",
  showConfidenceBands = true,
  height = 400,
}: ForecastChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-neutral-50 rounded-lg">
        <p className="text-neutral-600">No data available for chart</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: "Units", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
            formatter={(value: number) => [
              new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(value),
              "",
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
          />

          {/* Confidence Band (P10-P90) */}
          {showConfidenceBands && (
            <Area
              type="monotone"
              dataKey="p90"
              fill="#3b82f6"
              fillOpacity={0.1}
              stroke="none"
              name="P90 (Upper Bound)"
            />
          )}
          {showConfidenceBands && (
            <Area
              type="monotone"
              dataKey="p10"
              fill="#ffffff"
              fillOpacity={1}
              stroke="none"
              name="P10 (Lower Bound)"
            />
          )}

          {/* Actual Data (if available) */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            name="Actual"
            connectNulls={false}
          />

          {/* Forecast (P50) */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#3b82f6", r: 4 }}
            name="Forecast (P50)"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend Explanation */}
      <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
        <p className="text-sm text-neutral-700">
          <strong>Chart Guide:</strong>
        </p>
        <ul className="text-sm text-neutral-600 mt-2 space-y-1">
          <li>• <strong className="text-green-600">Green line:</strong> Actual historical demand</li>
          <li>• <strong className="text-blue-600">Blue dashed line:</strong> Forecasted demand (P50 - median)</li>
          <li>• <strong className="text-blue-400">Blue shaded area:</strong> 80% confidence interval (P10 to P90)</li>
          <li>• The wider the band, the higher the uncertainty in the forecast</li>
        </ul>
      </div>
    </div>
  );
}

interface SimpleForecastChartProps {
  data: Array<{
    period: string;
    value: number;
    label?: string;
  }>;
  title?: string;
  color?: string;
  height?: number;
}

export function SimpleForecastChart({
  data,
  title,
  color = "#3b82f6",
  height = 300,
}: SimpleForecastChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-neutral-50 rounded-lg">
        <p className="text-neutral-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
            formatter={(value: number) => [
              new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(value),
              "",
            ]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            name={data[0]?.label || "Value"}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
