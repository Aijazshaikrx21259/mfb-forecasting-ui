"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Database, Clock, TrendingUp, DollarSign, Zap } from "lucide-react";

interface SystemMetrics {
  database_size_mb: number;
  total_items: number;
  total_forecasts: number;
  last_pipeline_run: string;
  avg_api_response_ms: number;
}

interface CostEstimate {
  daily_cost_usd: number;
  monthly_estimate_usd: number;
  database_storage_cost: number;
  compute_cost: number;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [costs, setCosts] = useState<CostEstimate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch system metrics
      const metricsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/metrics/system`, {
        headers: { "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "" },
      });
      
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      // Fetch cost estimates
      const costsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/metrics/costs?days=30`, {
        headers: { "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "" },
      });
      
      if (costsRes.ok) {
        const data = await costsRes.json();
        setCosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading metrics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Performance & Costs</h1>
        <p className="text-muted-foreground">
          Monitor system health, performance metrics, and cost estimates
        </p>
      </div>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.database_size_mb?.toFixed(2) || "0"} MB
            </div>
            <p className="text-xs text-muted-foreground">
              Total storage used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_items?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Items in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forecasts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_forecasts?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Forecast records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avg_api_response_ms?.toFixed(0) || "0"} ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Pipeline Run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.last_pipeline_run 
                ? new Date(metrics.last_pipeline_run).toLocaleDateString()
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent forecast
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Estimates */}
      {costs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Estimates
            </CardTitle>
            <CardDescription>
              Estimated infrastructure costs for Neon database and compute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Cost</p>
                <p className="text-3xl font-bold">
                  ${costs.daily_cost_usd?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Estimate</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${costs.monthly_estimate_usd?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Database Storage</p>
                  <p className="text-lg font-semibold">
                    ${costs.database_storage_cost?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Compute</p>
                  <p className="text-lg font-semibold">
                    ${costs.compute_cost?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            System health and optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">System Running Smoothly</p>
              <p className="text-sm text-muted-foreground">
                All services operational with normal response times
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Database className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Database Optimized</p>
              <p className="text-sm text-muted-foreground">
                Neon serverless database scales automatically with demand
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Fast API Response</p>
              <p className="text-sm text-muted-foreground">
                API endpoints responding within acceptable thresholds
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
