"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, EmptyState } from "@/components/ui/loading-states";
import { Package, TrendingUp, BarChart3 } from "lucide-react";

interface CategoryForecast {
  category: string;
  total_forecast: number;
  item_count: number;
  avg_forecast_per_item: number;
  horizon_months: number;
}

export default function CategoriesPage() {
  const [data, setData] = useState<CategoryForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState(1);

  useEffect(() => {
    fetchCategoryData();
  }, [horizon]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "change-me";

      const response = await fetch(`${baseUrl}/categories/forecast?horizon=${horizon}`, {
        headers: {
          "X-API-Key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load category data");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Produce: "bg-green-500",
      Dairy: "bg-blue-500",
      Meat: "bg-red-500",
      Bakery: "bg-yellow-500",
      "Canned Goods": "bg-orange-500",
      Frozen: "bg-cyan-500",
      Grains: "bg-amber-500",
      Snacks: "bg-purple-500",
      Other: "bg-gray-500",
    };
    return colors[category] || "bg-gray-400";
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
          <p className="font-semibold text-red-900">Error loading category data</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          title="No category data available"
          description="Category insights will appear here once forecasts are generated."
          icon={<Package className="h-12 w-12" />}
        />
      </div>
    );
  }

  const totalForecast = data.reduce((sum, cat) => sum + cat.total_forecast, 0);
  const totalItems = data.reduce((sum, cat) => sum + cat.item_count, 0);
  const sortedData = [...data].sort((a, b) => b.total_forecast - a.total_forecast);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Category Insights</h1>
        <p className="text-neutral-600 mt-2">
          Analyze demand trends and forecasts by product category
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
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Total Forecast</p>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">{formatNumber(totalForecast)}</p>
          <p className="text-xs text-neutral-600 mt-1">Units across all categories</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Categories</p>
            <Package className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">{data.length}</p>
          <p className="text-xs text-neutral-600 mt-1">Active product categories</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Total Items</p>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">{totalItems}</p>
          <p className="text-xs text-neutral-600 mt-1">Items being forecasted</p>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Forecast Distribution by Category</h2>
        <div className="space-y-3">
          {sortedData.map((category) => {
            const percentage = ((category.total_forecast / totalForecast) * 100).toFixed(1);
            return (
              <div key={category.category}>
                <div className="flex items-center justify-between mb-1">
                  <Badge className={getCategoryColor(category.category)}>
                    {category.category}
                  </Badge>
                  <span className="text-sm text-neutral-600">
                    {formatNumber(category.total_forecast)} units ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getCategoryColor(category.category)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Category Details Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Category Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                  Category
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Total Forecast
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Items
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  Avg per Item
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((category) => {
                const percentage = ((category.total_forecast / totalForecast) * 100).toFixed(1);
                return (
                  <tr key={category.category} className="border-b hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <Badge className={getCategoryColor(category.category)}>
                        {category.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium">
                      {formatNumber(category.total_forecast)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">{category.item_count}</td>
                    <td className="py-3 px-4 text-sm text-right">
                      {formatNumber(category.avg_forecast_per_item)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Category Insights</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>
            • <strong>Top Category:</strong> {sortedData[0]?.category} with{" "}
            {formatNumber(sortedData[0]?.total_forecast || 0)} units forecasted
          </li>
          <li>
            • <strong>Most Items:</strong>{" "}
            {[...sortedData].sort((a, b) => b.item_count - a.item_count)[0]?.category} with{" "}
            {[...sortedData].sort((a, b) => b.item_count - a.item_count)[0]?.item_count} items
          </li>
          <li>
            • <strong>Highest Avg Demand:</strong>{" "}
            {[...sortedData].sort((a, b) => b.avg_forecast_per_item - a.avg_forecast_per_item)[0]
              ?.category}{" "}
            with{" "}
            {formatNumber(
              [...sortedData].sort((a, b) => b.avg_forecast_per_item - a.avg_forecast_per_item)[0]
                ?.avg_forecast_per_item || 0
            )}{" "}
            units per item
          </li>
        </ul>
      </Card>
    </div>
  );
}
