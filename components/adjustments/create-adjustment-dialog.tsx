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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/adjustments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({
          item_id: formData.item_id,
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Forecast Adjustment</DialogTitle>
            <DialogDescription>
              Override the system forecast with your expert judgment
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="adjustment_reason">Reason *</Label>
              <Input
                id="adjustment_reason"
                placeholder="e.g., Upcoming promotion, seasonal demand"
                value={formData.adjustment_reason}
                onChange={(e) => setFormData({ ...formData, adjustment_reason: e.target.value })}
                required
              />
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

          <DialogFooter>
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
