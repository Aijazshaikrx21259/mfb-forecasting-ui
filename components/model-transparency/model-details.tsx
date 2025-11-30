"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

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

interface ModelDetailsProps {
  item: ModelMethodInfo;
}

export function ModelDetails({ item }: ModelDetailsProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return "N/A";
    return `${value.toFixed(2)}%`;
  };

  const getPerformanceIcon = (mape: number | null) => {
    if (mape === null) return <Minus className="h-5 w-5 text-gray-400" />;
    if (mape < 20) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (mape < 30) return <Minus className="h-5 w-5 text-yellow-500" />;
    return <TrendingDown className="h-5 w-5 text-red-500" />;
  };

  const getPerformanceLabel = (mape: number | null) => {
    if (mape === null) return "Unknown";
    if (mape < 20) return "Excellent";
    if (mape < 30) return "Good";
    if (mape < 50) return "Fair";
    return "Poor";
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

  const getMethodDescription = (method: string) => {
    const descriptions: Record<string, string> = {
      AutoETS: "Exponential Smoothing with automatic parameter selection. Best for items with trend and/or seasonality.",
      "Croston-SBA": "Croston's method with Syntetos-Boylan Approximation. Optimized for intermittent demand patterns.",
      TSB: "Teunter-Syntetos-Babai method. Designed for items showing obsolescence or declining demand.",
      "Seasonal Naive": "Simple baseline using last year's demand. Used as a benchmark for comparison.",
    };
    return descriptions[method] || "Forecasting method selected by the system.";
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Item {item.item_id}</h3>
          <p className="text-sm text-neutral-600 mt-1">
            Horizon: {item.horizon_months} month{item.horizon_months > 1 ? "s" : ""}
          </p>
        </div>
        <Badge className={getMethodColor(item.champion_method)}>
          {item.champion_method}
        </Badge>
      </div>

      {/* Method Description */}
      <div className="bg-neutral-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-neutral-900 mb-2">Method Description</h4>
        <p className="text-sm text-neutral-700">{getMethodDescription(item.champion_method)}</p>
      </div>

      {/* Training Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-neutral-600 mb-1">Last Trained</p>
          <p className="text-sm font-medium text-neutral-900">{formatDate(item.last_trained_at)}</p>
        </div>
        <div>
          <p className="text-sm text-neutral-600 mb-1">Run ID</p>
          <p className="text-xs font-mono text-neutral-700">{item.run_id}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-900 mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* MAPE */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-neutral-600">MAPE</p>
              {getPerformanceIcon(item.mape)}
            </div>
            <p className="text-2xl font-bold text-neutral-900">{formatPercent(item.mape)}</p>
            <p className="text-xs text-neutral-600 mt-1">{getPerformanceLabel(item.mape)}</p>
          </div>

          {/* RMSE */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-neutral-600">RMSE</p>
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {item.rmse !== null ? item.rmse.toFixed(2) : "N/A"}
            </p>
            <p className="text-xs text-neutral-600 mt-1">Root Mean Squared Error</p>
          </div>

          {/* Benchmark Comparison */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-neutral-600">vs Benchmark</p>
              {item.beats_benchmark ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {item.beats_benchmark ? "Better" : "Worse"}
            </p>
            <p className="text-xs text-neutral-600 mt-1">Than Seasonal Naive</p>
          </div>
        </div>
      </div>

      {/* Performance Interpretation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Performance Interpretation</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>MAPE &lt; 20%:</strong> Excellent forecast accuracy</li>
          <li>• <strong>MAPE 20-30%:</strong> Good accuracy, suitable for planning</li>
          <li>• <strong>MAPE 30-50%:</strong> Fair accuracy, use with caution</li>
          <li>• <strong>MAPE &gt; 50%:</strong> Poor accuracy, consider manual review</li>
        </ul>
      </div>
    </Card>
  );
}

interface MethodComparisonProps {
  methods: Array<{
    method: string;
    count: number;
    avgMape: number | null;
    avgRmse: number | null;
    beatsBenchmarkCount: number;
  }>;
}

export function MethodComparison({ methods }: MethodComparisonProps) {
  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      AutoETS: "bg-blue-500",
      "Croston-SBA": "bg-green-500",
      TSB: "bg-purple-500",
      "Seasonal Naive": "bg-gray-500",
    };
    return colors[method] || "bg-gray-400";
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Method Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Method</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">Items</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">Avg MAPE</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">Avg RMSE</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                Beats Benchmark
              </th>
            </tr>
          </thead>
          <tbody>
            {methods.map((method) => {
              const beatRate = method.count > 0 
                ? ((method.beatsBenchmarkCount / method.count) * 100).toFixed(1) 
                : "0.0";
              
              return (
                <tr key={method.method} className="border-b hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <Badge className={getMethodColor(method.method)}>{method.method}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-right">{method.count}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    {method.avgMape !== null ? `${method.avgMape.toFixed(2)}%` : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {method.avgRmse !== null ? method.avgRmse.toFixed(2) : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {method.beatsBenchmarkCount} ({beatRate}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
