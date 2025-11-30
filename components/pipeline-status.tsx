"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface RunMetadata {
  run_id: string;
  status: string;
  horizons: number[];
  items_forecasted: number | null;
  forecast_generated_at: string | null;
  created_at: string;
}

export function PipelineStatus() {
  const [metadata, setMetadata] = useState<RunMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "change-me";

      const response = await fetch(`${baseUrl}/forecast/runs/latest`, {
        headers: {
          "X-API-Key": apiKey,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setMetadata(result);
      }
    } catch (err) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "FORECASTED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "TRAINED":
        return <Activity className="h-4 w-4 text-blue-500" />;
      case "RUNNING":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "FORECASTED":
        return "bg-green-500";
      case "TRAINED":
        return "bg-blue-500";
      case "RUNNING":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-neutral-200 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  if (!metadata) {
    return (
      <Card className="p-4 bg-neutral-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-10 w-10 text-neutral-400" />
          <div>
            <p className="font-medium text-neutral-700">No Pipeline Data</p>
            <p className="text-sm text-neutral-500">Waiting for first forecast run</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getStatusIcon(metadata.status)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-neutral-900">Pipeline Status</p>
            <Badge className={getStatusColor(metadata.status)}>
              {metadata.status || "Unknown"}
            </Badge>
          </div>
          <div className="text-sm text-neutral-600 space-y-1">
            <p>
              Last refresh: {formatDate(metadata.forecast_generated_at || metadata.created_at)}
            </p>
            {metadata.items_forecasted && (
              <p>{metadata.items_forecasted} items forecasted</p>
            )}
            {metadata.horizons && metadata.horizons.length > 0 && (
              <p>Horizons: {metadata.horizons.join(", ")} months</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
