"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { format as formatDate } from "date-fns";
import { getPlan, getLatestRunMetadata, type EnhancedPlanItem, type PlanResponse, type RunMetadataResponse } from "@/lib/api/forecast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";

type SortField = "priority" | "suggested_qty" | "risk" | "unit_cost" | "name";
type SortDirection = "asc" | "desc";

export default function PurchasePlanPage() {
  const [items, setItems] = useState<EnhancedPlanItem[]>([]);
  const [runMetadata, setRunMetadata] = useState<RunMetadataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50; // Show 50 items per page (backend returns ALL items, no limit)

  // Fetch ALL data for next month on mount (horizon=1)
  // The backend returns ALL items for the forecast run (no SQL LIMIT)
  // We handle pagination client-side to show 50 items per page
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch ALL items for next month (horizon=1)
        const [planResponse, metadataResponse] = await Promise.all([
          getPlan(1), // Returns ALL items for next month
          getLatestRunMetadata(),
        ]);

        // Transform API response to enhanced items with computed priority
        const enhanced = transformToEnhancedItems(planResponse);
        setItems(enhanced);
        setRunMetadata(metadataResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load purchase plan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform plan items to enhanced items with priority calculation
  const transformToEnhancedItems = (response: PlanResponse): EnhancedPlanItem[] => {
    return response.items.map((item) => {
      const suggested_qty = item.p50 ?? 0;
      const pi80_low = item.p10;
      const pi80_high = item.p90;
      
      // Calculate priority (0-1) based on quantity and uncertainty
      // Higher quantity + higher uncertainty = higher priority
      const uncertainty = pi80_high && pi80_low ? (pi80_high - pi80_low) / Math.max(suggested_qty, 1) : 0;
      const qtyScore = Math.min(suggested_qty / 1000, 1); // normalize by 1000 units
      const priority = Math.min((qtyScore * 0.6 + uncertainty * 0.4), 1);
      
      // Flag items with high uncertainty or low confidence
      const flags: string[] = [];
      if (uncertainty > 0.5) flags.push("risk");
      if (suggested_qty > 5000) flags.push("high_volume");
      
      return {
        ...item,
        item_name: undefined, // Will be enriched later
        suggested_qty,
        pi80_low,
        pi80_high,
        priority,
        flags,
      };
    });
  };

  // Debounced search with filtering
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      return (
        item.item_id.toLowerCase().includes(query) ||
        item.item_name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.vendor?.toLowerCase().includes(query)
      );
    });
  }, [items, searchQuery]);

  // Sorted items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    
    sorted.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortField) {
        case "priority":
          compareValue = a.priority - b.priority;
          break;
        case "suggested_qty":
          compareValue = a.suggested_qty - b.suggested_qty;
          break;
        case "risk":
          compareValue = a.flags.length - b.flags.length;
          break;
        case "unit_cost":
          compareValue = (a.unit_cost ?? 0) - (b.unit_cost ?? 0);
          break;
        case "name":
          compareValue = (a.item_name || a.item_id).localeCompare(b.item_name || b.item_id);
          break;
      }
      
      return sortDirection === "asc" ? compareValue : -compareValue;
    });
    
    return sorted;
  }, [filteredItems, sortField, sortDirection]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, currentPage]);

  const totalPages = Math.ceil(sortedItems.length / pageSize);

  // Handle sort column click
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    }
    setCurrentPage(1);
  }, [sortField, sortDirection]);

  // Export to CSV
  const handleExport = useCallback(() => {
    const headers = [
      "Item ID",
      "Item Name",
      "Category",
      "Vendor",
      "Suggested Qty",
      "80% PI (Low)",
      "80% PI (High)",
      "Lead Time (Days)",
      "Unit Cost",
      "Priority",
      "Flags",
      "Method",
      "Period Start",
    ];
    
    const rows = sortedItems.map((item) => [
      item.item_id,
      item.item_name || "",
      item.category || "",
      item.vendor || "",
      item.suggested_qty.toFixed(2),
      item.pi80_low?.toFixed(2) || "",
      item.pi80_high?.toFixed(2) || "",
      item.lead_time_days?.toString() || "",
      item.unit_cost?.toFixed(2) || "",
      item.priority.toFixed(3),
      item.flags.join("; "),
      item.method,
      item.period_start_date,
    ]);
    
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase-plan-${formatDate(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedItems]);

  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-10 w-96 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <p className="font-semibold">Unable to load purchase plan</p>
          <p className="mt-1 text-sm">{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Purchase Plan - Next Month
        </h1>
        <div className="flex gap-2 flex-wrap">
          {runMetadata && (
            <>
              <Badge variant="secondary">
                Forecast run {formatDate(new Date(runMetadata.forecast_generated_at || runMetadata.created_at), "MMM d, yyyy h:mm a")}
              </Badge>
              <Badge variant="outline">
                {runMetadata.items_forecasted || 0} items
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Control bar */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              type="text"
              placeholder="Search item, vendor, category…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
              aria-label="Search purchase plan items"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        
        {searchQuery && (
          <p className="text-sm text-neutral-600 mt-3">
            {items.length.toLocaleString()} items • {sortedItems.length.toLocaleString()} match
          </p>
        )}
      </Card>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead className="bg-neutral-50 border-b sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center font-medium text-sm text-neutral-700 hover:text-neutral-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-neutral-950"
                    aria-sort={sortField === "name" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Item
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("suggested_qty")}
                    className="flex items-center font-medium text-sm text-neutral-700 hover:text-neutral-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-neutral-950"
                    aria-sort={sortField === "suggested_qty" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Suggested Qty
                    <SortIcon field="suggested_qty" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-medium text-sm text-neutral-700">
                    80% Interval
                  </span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-medium text-sm text-neutral-700">
                    Method
                  </span>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("priority")}
                    className="flex items-center font-medium text-sm text-neutral-700 hover:text-neutral-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-neutral-950"
                    aria-sort={sortField === "priority" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Priority
                    <SortIcon field="priority" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("risk")}
                    className="flex items-center font-medium text-sm text-neutral-700 hover:text-neutral-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-neutral-950"
                    aria-sort={sortField === "risk" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                  >
                    Flags
                    <SortIcon field="risk" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                    {searchQuery ? "No items match your search." : "Plan not published yet."}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.item_id}
                    className="hover:bg-neutral-50 focus-within:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {item.item_name || item.item_id}
                        </span>
                        {item.item_name && (
                          <span className="text-xs text-neutral-500">
                            {item.item_id}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {item.suggested_qty.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {item.pi80_low !== null && item.pi80_high !== null
                        ? `${item.pi80_low.toLocaleString(undefined, { maximumFractionDigits: 0 })} - ${item.pi80_high.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {item.method}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {item.flags.map((flag) => (
                          <FlagBadge key={flag} flag={flag} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedItems.length)} of {sortedItems.length.toLocaleString()} items
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: number }) {
  if (priority >= 0.7) {
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
        High
      </Badge>
    );
  }
  if (priority >= 0.4) {
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
        Medium
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
      Low
    </Badge>
  );
}

function FlagBadge({ flag }: { flag: string }) {
  const labels: Record<string, string> = {
    risk: "High Risk",
    high_volume: "High Volume",
    anomaly: "Anomaly",
    stockout_suspect: "Stockout Risk",
  };
  
  const colors: Record<string, string> = {
    risk: "bg-red-50 text-red-700 border-red-200",
    high_volume: "bg-blue-50 text-blue-700 border-blue-200",
    anomaly: "bg-orange-50 text-orange-700 border-orange-200",
    stockout_suspect: "bg-purple-50 text-purple-700 border-purple-200",
  };
  
  return (
    <Badge variant="outline" className={`text-xs ${colors[flag] || "bg-neutral-50 text-neutral-700"}`}>
      {labels[flag] || flag}
    </Badge>
  );
}

