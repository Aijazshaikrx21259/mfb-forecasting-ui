"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, CheckCircle, Clock, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { CreateAdjustmentDialog } from "@/components/adjustments/create-adjustment-dialog";
import { deleteAdjustment } from "@/lib/api/adjustments";

interface Adjustment {
  adjustment_id: string;
  item_id: string;
  original_p50: number;
  adjusted_p50: number;
  adjustment_reason: string;
  notes: string;
  status: string;
  adjusted_by: string;
  adjusted_at: string;
}

export default function AdjustmentsPage() {
  const { user } = useUser();
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/adjustments`, {
        headers: {
          "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Adjustments data:", data);
        setAdjustments(data.adjustments || data || []);
      }
    } catch (error) {
      console.error("Failed to fetch adjustments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adjustmentId: string, status: string) => {
    // Only allow deleting PENDING or REJECTED adjustments
    if (status !== "PENDING" && status !== "REJECTED") {
      alert(`Cannot delete ${status} adjustments. Only PENDING or REJECTED adjustments can be deleted.`);
      return;
    }

    if (!confirm("Are you sure you want to delete this adjustment?")) {
      return;
    }

    try {
      setDeletingId(adjustmentId);
      await deleteAdjustment(adjustmentId);
      // Refresh the list
      await fetchAdjustments();
    } catch (error) {
      console.error("Failed to delete adjustment:", error);
      alert("Failed to delete adjustment. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      PENDING: { color: "bg-yellow-500", icon: Clock },
      APPROVED: { color: "bg-green-500", icon: CheckCircle },
      REJECTED: { color: "bg-red-500", icon: X },
    };

    const variant = variants[status] || variants.PENDING;
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to view forecast adjustments.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forecast Adjustments</h1>
          <p className="text-muted-foreground">
            Manually adjust forecasted quantities and add expert notes
          </p>
        </div>
        <CreateAdjustmentDialog onSuccess={fetchAdjustments} />
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading adjustments...</p>
          </CardContent>
        </Card>
      ) : adjustments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Edit className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">No adjustments yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first forecast adjustment to override system predictions
                </p>
              </div>
              <CreateAdjustmentDialog onSuccess={fetchAdjustments} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {adjustments.map((adj) => (
            <Card key={adj.adjustment_id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{adj.item_id}</CardTitle>
                    <CardDescription>
                      Adjusted by {adj.adjusted_by} on{" "}
                      {new Date(adj.adjusted_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(adj.status)}
                    {(adj.status === "PENDING" || adj.status === "REJECTED") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(adj.adjustment_id, adj.status)}
                        disabled={deletingId === adj.adjustment_id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Original Forecast
                    </p>
                    <p className="text-2xl font-bold">
                      {adj.original_p50?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Adjusted Forecast
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {adj.adjusted_p50.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Reason</p>
                  <p className="text-sm text-muted-foreground">{adj.adjustment_reason}</p>
                </div>

                {adj.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{adj.notes}</p>
                  </div>
                )}

                {/* Approval workflow buttons removed - US #18 focuses on creating adjustments and notes */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
