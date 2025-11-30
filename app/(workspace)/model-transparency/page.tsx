"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, EmptyState } from "@/components/ui/loading-states";
import { BarChart3, TrendingUp, CheckCircle, XCircle } from "lucide-react";

interface ModelMethodInfo {
  item_id: string;
  champion_method: string;
  horizon_months: number;
  last_trained_at: string | null;
  mape: number | null;
  rmse: number | null;
  beats_benchmark: boolean;
  run_id: string;
}

interface ModelTransparencyResponse {
  total_items: number;
  method_distribution: Record<string, number>;
  items: ModelMethodInfo[];
  run_id: string;
}

export default function ModelTransparencyPage() {
  const [data, setData] = useState<ModelTransparencyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState(1);

  useEffect(() => {
    fetchModelTransparency();
  }, [horizon]);

  const fetchModelTransparency = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "change-me";

      const response = await fetch(
        `${baseUrl}/backtest/model-transparency?horizon=${horizon}&page_size=100`,
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
      setError(err instanceof Error ? err.message : "Failed to load model transparency data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      AutoETS: "bg-blue-500",
      "Croston-SBA": "bg-green-500",
      TSB: "bg-purple-500",
      "Seasonal Naive": "bg-gray-500",
    };
    return colors[method] || "bg-gray-400";
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
          <p className="font-semibold text-red-900">Error loading model transparency data</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.total_items === 0) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          title="No model data available"
          description="Run a backtest to see which forecasting methods are being used."
          icon={<BarChart3 className="h-12 w-12" />}
        />
      </div>
    );
  }

  const totalItems = data.total_items;
  const methodEntries = Object.entries(data.method_distribution).sort((a, b) => b[1] - a[1]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Model Transparency</h1>
        <p className="text-neutral-600 mt-2">
          View which forecasting methods are applied to each item and their performance metrics
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Items</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">{totalItems}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Methods Used</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">{methodEntries.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Beating Benchmark</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">
                {data.items.filter((i) => i.beats_benchmark).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Method Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Method Distribution</h2>
        <div className="space-y-3">
          {methodEntries.map(([method, count]) => {
            const percentage = ((count / totalItems) * 100).toFixed(1);
            return (
              <div key={method}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{method}</span>
                  <span className="text-sm text-neutral-600">
                    {count} items ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getMethodColor(method)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Items Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Items by Method</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                  Item ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                  Method
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                  Last Trained
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  MAPE
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  RMSE
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600">
                  Beats Benchmark
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.item_id} className="border-b hover:bg-neutral-50">
                  <td className="py-3 px-4 text-sm font-mono">{item.item_id}</td>
                  <td className="py-3 px-4">
                    <Badge className={getMethodColor(item.champion_method)}>
                      {item.champion_method}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600">
                    {formatDate(item.last_trained_at)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {formatPercent(item.mape)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {item.rmse?.toFixed(2) || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.beats_benchmark ? (
                      <CheckCircle className="h-5 w-5 text-green-500 inline" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 inline" />
                    )}
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
