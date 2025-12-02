"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface CreateAdjustmentDialogProps {
  onSuccess?: () => void;
}

export function CreateAdjustmentDialog({ onSuccess }: CreateAdjustmentDialogProps) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    item_id: "",
    adjusted_p50: "",
    adjustment_reason: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please sign in to create adjustments");
      return;
    }

    setLoading(true);

    try {
      // First, get the latest run_id and forecast data for this item
      const forecastRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/forecast/forecasts/items/${formData.item_id.trim()}?h=1`,
        {
          headers: { "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "" },
        }
      );

      if (!forecastRes.ok) {
        alert("Item not found or no forecast available. Please check the Item ID.");
        setLoading(false);
        return;
      }

      const forecastData = await forecastRes.json();
      const forecast = forecastData.forecasts?.[0];
      
      if (!forecast) {
        alert("No forecast data available for this item.");
        setLoading(false);
        return;
      }

      // Create adjustment with all required fields
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/adjustments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({
          item_id: formData.item_id.trim(),
          run_id: forecastData.run_id,
          horizon: forecast.horizon,
          period_start_date: forecast.period_start_date,
          original_p50: forecast.p50,
          original_p10: forecast.p10,
          original_p90: forecast.p90,
          adjusted_p50: parseFloat(formData.adjusted_p50),
          adjustment_reason: formData.adjustment_reason,
          notes: formData.notes,
          adjusted_by: user.primaryEmailAddress?.emailAddress || user.id,
        }),
      });

      if (response.ok) {
        setOpen(false);
        setFormData({
          item_id: "",
          adjusted_p50: "",
          adjustment_reason: "",
          notes: "",
        });
        onSuccess?.();
      } else {
        const error = await response.text();
        alert(`Failed to create adjustment: ${error}`);
      }
    } catch (error) {
      console.error("Failed to create adjustment:", error);
      alert("Failed to create adjustment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          New Adjustment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] h-[95vh] flex flex-col p-6">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create Forecast Adjustment</DialogTitle>
            <DialogDescription>
              Override the system forecast with your expert judgment
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 flex-1 overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="item_id">Item ID *</Label>
              <Input
                id="item_id"
                placeholder="e.g., P-906104"
                value={formData.item_id}
                onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjusted_p50">Adjusted Forecast Quantity *</Label>
              <Input
                id="adjusted_p50"
                type="number"
                step="0.01"
                placeholder="e.g., 1500"
                value={formData.adjusted_p50}
                onChange={(e) => setFormData({ ...formData, adjusted_p50: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the new forecasted quantity
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjustment_reason">Reason * (min 10 characters)</Label>
              <Textarea
                id="adjustment_reason"
                placeholder="e.g., Upcoming promotion expected to increase demand, seasonal demand pattern observed"
                value={formData.adjustment_reason}
                onChange={(e) => setFormData({ ...formData, adjustment_reason: e.target.value })}
                required
                minLength={10}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Provide a detailed reason for this adjustment (minimum 10 characters)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional context or details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
