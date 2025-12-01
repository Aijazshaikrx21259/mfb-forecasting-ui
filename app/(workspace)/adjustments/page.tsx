"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, CheckCircle, Clock } from "lucide-react";
import { useUser } from "@clerk/nextjs";

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

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/adjustments", {
        headers: {
          "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdjustments(data.adjustments || []);
      }
    } catch (error) {
      console.error("Failed to fetch adjustments:", error);
    } finally {
      setLoading(false);
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
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          New Adjustment
        </Button>
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
              <Button>Create Adjustment</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {adjustments.map((adj) => (
            <Card key={adj.adjustment_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{adj.item_id}</CardTitle>
                    <CardDescription>
                      Adjusted by {adj.adjusted_by} on{" "}
                      {new Date(adj.adjusted_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(adj.status)}
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

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {adj.status === "PENDING" && (
                    <>
                      <Button variant="outline" size="sm" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
