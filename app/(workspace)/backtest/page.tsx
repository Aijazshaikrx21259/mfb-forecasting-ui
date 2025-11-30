"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, EmptyState } from "@/components/ui/loading-states";
import { TrendingUp, TrendingDown, Activity, Target, BarChart3 } from "lucide-react";

interface PerformanceTrendPoint {
  run_id: string;
  created_at: string;
  horizon_months: number;
  mean_mape: number | null;
  mean_rmse: number | null;
  items_evaluated: number;
  pct_items_beating_sn: number | null;
}

interface PerformanceSummaryResponse {
  current_run: {
    horizon_months: number;
    items_evaluated: number;
    pct_items_mape_lt_30: number | null;
    pct_items_beating_sn: number | null;
    mean_mape: number | null;
    mean_rmse: number | null;
    run_id: string;
    created_at: string;
  } | null;
  historical_trend: PerformanceTrendPoint[];
  method_performance: Record<string, { avg_mape: number; avg_rmse: number; count: number }>;
  accuracy_distribution: Record<string, number>;
  total_runs: number;
}

export default function BacktestDashboardPage() {
  const [data, setData] = useState<PerformanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState(1);

  useEffect(() => {
    fetchPerformanceSummary();
  }, [horizon]);

  const fetchPerformanceSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "change-me";

      const response = await fetch(
        `${baseUrl}/backtest/performance-summary?horizon=${horizon}&limit_runs=10`,
        {
          headers: {
            "X-API-Key": apiKey,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 503) {
          setError("Database not configured. Please set up the database connection.");
        } else if (response.status === 404) {
          setError("No backtest data found. Run a backtest first.");
        } else {
          throw new Error(`API error: ${response.status}`);
        }
        return;
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Cannot connect to API. Make sure the API server is running at " + (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"));
      } else {
        setError(err instanceof Error ? err.message : "Failed to load performance data");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-semibold text-red-900">Error loading backtest data</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.current_run) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          title="No backtest data available"
          description="Run a backtest to see forecast performance metrics."
          icon={<Activity className="h-12 w-12" />}
        />
      </div>
    );
  }

  const currentRun = data.current_run;
  const methodEntries = Object.entries(data.method_performance).sort(
    (a, b) => a[1].avg_mape - b[1].avg_mape
  );
  const accuracyEntries = Object.entries(data.accuracy_distribution);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Forecast Performance</h1>
        <p className="text-neutral-600 mt-2">
          Track forecast accuracy and compare performance across methods
        </p>
      </div>

      {/* Horizon Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Forecast Horizon:</label>
        <select
          value={horizon}
          onChange={(e) => setHorizon(Number(e.target.value))}
          className="px-3 py-2 border rounded-md"
        >
          <option value={1}>1 Month</option>
          <option value={2}>2 Months</option>
          <option value={3}>3 Months</option>
          <option value={4}>4 Months</option>
        </select>
        <span className="text-sm text-neutral-600 ml-4">
          Last updated: {formatDate(currentRun.created_at)}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Mean MAPE</p>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {formatPercent(currentRun.mean_mape)}
          </p>
          <p className="text-xs text-neutral-600 mt-1">Average error rate</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Mean RMSE</p>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {currentRun.mean_rmse?.toFixed(2) || "N/A"}
          </p>
          <p className="text-xs text-neutral-600 mt-1">Root mean squared error</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Beating Benchmark</p>
            <Target className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {formatPercent(currentRun.pct_items_beating_sn)}
          </p>
          <p className="text-xs text-neutral-600 mt-1">Better than Seasonal Naive</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Items Evaluated</p>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">{currentRun.items_evaluated}</p>
          <p className="text-xs text-neutral-600 mt-1">Total runs: {data.total_runs}</p>
        </Card>
      </div>

      {/* Accuracy Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Accuracy Distribution</h2>
        <p className="text-sm text-neutral-600 mb-4">
          Distribution of items by MAPE accuracy ranges
        </p>
        <div className="space-y-3">
          {accuracyEntries.map(([range, count]) => {
            const total = Object.values(data.accuracy_distribution).reduce((a, b) => a + b, 0);
            const percentage = ((count / total) * 100).toFixed(1);
            
            const getColor = (range: string) => {
              if (range === "0-10%") return "bg-green-500";
              if (range === "10-20%") return "bg-blue-500";
              if (range === "20-30%") return "bg-yellow-500";
              if (range === "30-50%") return "bg-orange-500";
              return "bg-red-500";
            };

            return (
              <div key={range}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">MAPE {range}</span>
                  <span className="text-sm text-neutral-600">
                    {count} items ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getColor(range)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Method Performance Comparison */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance by Method</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                  Method
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Items
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Avg MAPE
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Avg RMSE
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {methodEntries.map(([method, metrics]) => {
                const isGood = metrics.avg_mape < 30;
                return (
                  <tr key={method} className="border-b hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <Badge className="bg-blue-500">{method}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-right">{metrics.count}</td>
                    <td className="py-3 px-4 text-sm text-right">
                      {metrics.avg_mape.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {metrics.avg_rmse.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isGood ? (
                        <TrendingUp className="h-5 w-5 text-green-500 inline" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500 inline" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Historical Trend */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Historical Performance Trend</h2>
        <p className="text-sm text-neutral-600 mb-4">
          Last {data.historical_trend.length} backtest runs
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Date</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Items
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Mean MAPE
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Mean RMSE
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Beating SN
                </th>
              </tr>
            </thead>
            <tbody>
              {data.historical_trend.map((point) => (
                <tr key={point.run_id} className="border-b hover:bg-neutral-50">
                  <td className="py-3 px-4 text-sm">{formatDate(point.created_at)}</td>
                  <td className="py-3 px-4 text-sm text-right">{point.items_evaluated}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    {formatPercent(point.mean_mape)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {point.mean_rmse?.toFixed(2) || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {formatPercent(point.pct_items_beating_sn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
