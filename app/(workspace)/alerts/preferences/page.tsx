"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAlertPreferences, updateAlertPreferences, AlertType, AlertPriority } from "@/lib/api/alerts";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AlertPreferencesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState<AlertType[]>([]);
  const [minPriority, setMinPriority] = useState<AlertPriority>(AlertPriority.MEDIUM);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [digestDay, setDigestDay] = useState(1);

  useEffect(() => {
    if (!user) return;

    const fetchPreferences = async () => {
      try {
        const prefs = await getAlertPreferences(user.id);
        setEnabledTypes(prefs.enabled_alert_types);
        setMinPriority(prefs.min_priority);
        setWeeklyDigest(prefs.weekly_digest_enabled);
        setDigestDay(prefs.weekly_digest_day);
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await updateAlertPreferences(user.id, {
        enabled_alert_types: enabledTypes,
        min_priority: minPriority,
        weekly_digest_enabled: weeklyDigest,
        weekly_digest_day: digestDay,
      });
      router.push("/alerts");
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleAlertType = (type: AlertType) => {
    setEnabledTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  if (!user || loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <h1 className="text-3xl font-bold mb-2">Alert Preferences</h1>
      <p className="text-neutral-600 mb-6">Customize your notification settings</p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Alert Types</CardTitle>
            <CardDescription>Choose which types of alerts you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.values(AlertType).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={enabledTypes.includes(type)}
                  onCheckedChange={() => toggleAlertType(type)}
                />
                <Label htmlFor={type} className="cursor-pointer">
                  {type.replace(/_/g, " ")}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Filter</CardTitle>
            <CardDescription>Minimum priority level to show</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={minPriority} onValueChange={(v) => setMinPriority(v as AlertPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AlertPriority.LOW}>Low and above</SelectItem>
                <SelectItem value={AlertPriority.MEDIUM}>Medium and above</SelectItem>
                <SelectItem value={AlertPriority.HIGH}>High and above</SelectItem>
                <SelectItem value={AlertPriority.CRITICAL}>Critical only</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Digest</CardTitle>
            <CardDescription>Receive a summary of top priority items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="weekly-digest"
                checked={weeklyDigest}
                onCheckedChange={(checked) => setWeeklyDigest(checked as boolean)}
              />
              <Label htmlFor="weekly-digest" className="cursor-pointer">
                Enable weekly digest
              </Label>
            </div>
            {weeklyDigest && (
              <Select value={digestDay.toString()} onValueChange={(v) => setDigestDay(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                  <SelectItem value="7">Sunday</SelectItem>
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
