"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { ForecastChart } from "@/components/charts/forecast-chart";
import { Package, TrendingUp, AlertCircle } from "lucide-react";

interface ForecastPoint {
  horizon: number;
  period_start_date: string;
  method: string;
  p50: number | null;
  p10: number | null;
  p90: number | null;
}

interface ItemForecast {
  item_id: string;
  run_id: string;
  champions: Array<{
    horizon: number;
    method: string;
    mape: number | null;
    rmse: number | null;
    beats_baseline: boolean;
  }>;
  forecasts: ForecastPoint[];
}

export default function ItemDetailPage() {
  const params = useParams();
  const itemId = params.id as string;
  
  const [data, setData] = useState<ItemForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemId) {
      fetchItemForecast();
    }
  }, [itemId]);

  const fetchItemForecast = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "change-me";

      const response = await fetch(
        `${baseUrl}/forecast/forecasts/items/${encodeURIComponent(itemId)}`,
        {
          headers: {
            "X-API-Key": apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load item forecast");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number | null) => {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-semibold text-red-900">Error loading item forecast</p>
          <p className="text-sm text-red-700 mt-1">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.forecasts.map((point) => ({
    period: formatDate(point.period_start_date),
    forecast: point.p50 || 0,
    p10: point.p10 || 0,
    p90: point.p90 || 0,
  }));

  // Get next month forecast (horizon 1)
  const nextMonthForecast = data.forecasts.find((f) => f.horizon === 1);
  const champion = data.champions.find((c) => c.horizon === 1);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-neutral-900">{itemId}</h1>
          </div>
          <p className="text-neutral-600 mt-2">Item forecast details and purchase recommendation</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Next Month</p>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {formatNumber(nextMonthForecast?.p50 || 0)}
          </p>
          <p className="text-xs text-neutral-600 mt-1">Suggested quantity</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Low Estimate</p>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {formatNumber(nextMonthForecast?.p10 || 0)}
          </p>
          <p className="text-xs text-neutral-600 mt-1">P10 (conservative)</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">High Estimate</p>
            <AlertCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {formatNumber(nextMonthForecast?.p90 || 0)}
          </p>
          <p className="text-xs text-neutral-600 mt-1">P90 (optimistic)</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Method</p>
          </div>
          <p className="text-xl font-bold text-neutral-900">
            {champion?.method || "N/A"}
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            MAPE: {formatNumber(champion?.mape || null)}%
          </p>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="p-6">
        <ForecastChart
          data={chartData}
          title="Forecast with Confidence Bands (Next 4 Months)"
          showConfidenceBands={true}
          height={400}
        />
      </Card>

      {/* Champion Methods by Horizon */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Champion Methods by Horizon</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                  Horizon
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                  Method
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  MAPE
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  RMSE
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                  Beats Baseline
                </th>
              </tr>
            </thead>
            <tbody>
              {data.champions.map((champ) => (
                <tr key={champ.horizon} className="border-b hover:bg-neutral-50">
                  <td className="py-3 px-4 text-sm">{champ.horizon} month(s)</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-500">{champ.method}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {formatNumber(champ.mape)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {formatNumber(champ.rmse)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {champ.beats_baseline ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Forecast Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Forecasts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                  Period
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                  Horizon
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  P10
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  P50 (Forecast)
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  P90
                </th>
              </tr>
            </thead>
            <tbody>
              {data.forecasts.map((forecast, idx) => (
                <tr key={idx} className="border-b hover:bg-neutral-50">
                  <td className="py-3 px-4 text-sm">
                    {formatDate(forecast.period_start_date)}
                  </td>
                  <td className="py-3 px-4 text-sm">{forecast.horizon} month(s)</td>
                  <td className="py-3 px-4 text-sm text-right">
                    {formatNumber(forecast.p10)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium">
                    {formatNumber(forecast.p50)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {formatNumber(forecast.p90)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Purchase Recommendation */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Purchase Recommendation</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Suggested Order Quantity:</strong> {formatNumber(nextMonthForecast?.p50 || 0)}{" "}
            units for next month
          </p>
          <p>
            <strong>Safety Range:</strong> {formatNumber(nextMonthForecast?.p10 || 0)} to{" "}
            {formatNumber(nextMonthForecast?.p90 || 0)} units (80% confidence)
          </p>
          <p>
            <strong>Forecasting Method:</strong> {champion?.method || "N/A"} with{" "}
            {formatNumber(champion?.mape || null)}% average error
          </p>
        </div>
      </Card>
    </div>
  );
}
