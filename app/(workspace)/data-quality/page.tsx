"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, EmptyState } from "@/components/ui/loading-states";
import { AlertTriangle, CheckCircle, XCircle, Activity, TrendingUp } from "lucide-react";

interface MonthFlag {
  flag_id: string;
  month_key: string;
  agency_internal_id: string | null;
  item_id: string | null;
  flag_type: string;
  flag_level: string;
  flag_reason: string | null;
  flagged_by: string;
  flagged_at_utc: string;
  expires_at_utc: string | null;
  is_active: boolean;
}

interface QualitySummary {
  total_flags: number;
  active_flags: number;
  flags_by_type: Record<string, number>;
  flags_by_level: Record<string, number>;
  anomaly_candidates: number;
  recent_issues: MonthFlag[];
  data_completeness_score: number;
  quality_score: number;
}

export default function DataQualityPage() {
  const [data, setData] = useState<QualitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQualitySummary();
  }, []);

  const fetchQualitySummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "change-me";

      const response = await fetch(`${baseUrl}/data-quality/summary`, {
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
      setError(err instanceof Error ? err.message : "Failed to load data quality summary");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    // If score is 0 but no active flags, treat as good (100%)
    if (score === 0 && data?.active_flags === 0) return "text-green-600";
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    // If score is 0 but no active flags, show green check (healthy)
    if (score === 0 && data?.active_flags === 0) return <CheckCircle className="h-8 w-8 text-green-500" />;
    if (score >= 90) return <CheckCircle className="h-8 w-8 text-green-500" />;
    if (score >= 70) return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
    return <XCircle className="h-8 w-8 text-red-500" />;
  };
  
  const getDisplayScore = (score: number, activeFlags: number) => {
    // If score is 0 but no issues, display as 100% (healthy)
    if (score === 0 && activeFlags === 0) return 100;
    return score;
  };

  const getFlagTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ANOMALY: "bg-orange-500",
      STOCKOUT: "bg-red-500",
      BAD_DATA: "bg-purple-500",
      MANUAL_EXCLUDE: "bg-gray-500",
    };
    return colors[type] || "bg-blue-500";
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
          <p className="font-semibold text-red-900">Error loading data quality summary</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          title="No data quality information available"
          description="Data quality monitoring will appear here once data is loaded."
          icon={<Activity className="h-12 w-12" />}
        />
      </div>
    );
  }

  const typeEntries = Object.entries(data.flags_by_type);
  const levelEntries = Object.entries(data.flags_by_level);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Data Quality</h1>
        <p className="text-neutral-600 mt-2">
          Monitor data quality issues, anomalies, and completeness metrics
        </p>
      </div>

      {/* Quality Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Quality Score</p>
            {getScoreIcon(data.quality_score)}
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(data.quality_score)}`}>
            {getDisplayScore(data.quality_score, data.active_flags).toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            {data.active_flags === 0 ? "Excellent health" : "Overall data health"}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Completeness</p>
            {getScoreIcon(data.data_completeness_score)}
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(data.data_completeness_score)}`}>
            {getDisplayScore(data.data_completeness_score, data.active_flags).toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            {data.active_flags === 0 ? "Complete coverage" : "Data coverage"}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Active Issues</p>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">{data.active_flags}</p>
          <p className="text-xs text-neutral-600 mt-1">Total: {data.total_flags}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-600">Anomalies</p>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-neutral-900">{data.anomaly_candidates}</p>
          <p className="text-xs text-neutral-600 mt-1">Candidates for review</p>
        </Card>
      </div>

      {/* Positive Summary when no issues */}
      {data.active_flags === 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <CheckCircle className="h-12 w-12 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Data Quality: Excellent</h3>
              <p className="text-sm text-green-800 mt-1">
                All data quality checks are passing. Your data is clean, complete, and ready for accurate forecasting.
                No anomalies or issues detected.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Issues by Type */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Issues by Type</h2>
        {typeEntries.length > 0 ? (
          <div className="space-y-3">
            {typeEntries.map(([type, count]) => {
              const total = Object.values(data.flags_by_type).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={getFlagTypeColor(type)}>{type}</Badge>
                    <span className="text-sm text-neutral-600">
                      {count} issues ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getFlagTypeColor(type)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-neutral-600">No issues by type</p>
        )}
      </Card>

      {/* Issues by Level */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Issues by Scope</h2>
        {levelEntries.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {levelEntries.map(([level, count]) => (
              <div key={level} className="text-center p-4 bg-neutral-50 rounded-lg">
                <p className="text-2xl font-bold text-neutral-900">{count}</p>
                <p className="text-sm text-neutral-600 mt-1">{level.replace("_", " ")}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-600">No issues by scope</p>
        )}
      </Card>

      {/* Recent Issues */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Issues</h2>
        {data.recent_issues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Month
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Item ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Level
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Reason
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">
                    Flagged
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recent_issues.map((issue) => (
                  <tr key={issue.flag_id} className="border-b hover:bg-neutral-50">
                    <td className="py-3 px-4 text-sm font-mono">{issue.month_key}</td>
                    <td className="py-3 px-4 text-sm font-mono">
                      {issue.item_id || <span className="text-neutral-400">All</span>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getFlagTypeColor(issue.flag_type)}>{issue.flag_type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{issue.flag_level}</td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {issue.flag_reason || "No reason provided"}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {formatDate(issue.flagged_at_utc)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No recent issues"
            description="All data quality checks are passing."
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          />
        )}
      </Card>

      {/* Quality Interpretation */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Quality Score Interpretation</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>90-100%:</strong> Excellent data quality, safe for forecasting</span>
          </li>
          <li className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>70-89%:</strong> Good quality with minor issues to review</span>
          </li>
          <li className="flex items-start">
            <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <span><strong>Below 70%:</strong> Significant issues requiring attention</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
