"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { AlertList } from "@/components/alerts/alert-list";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";

export default function AlertsPage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Please sign in to view alerts.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-neutral-600 mt-1">
            Stay updated on forecast events and system alerts
          </p>
        </div>
        <Link href="/alerts/preferences">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
        </Link>
      </div>

      <Card>
        <AlertList userId="all-users" />
      </Card>
    </div>
  );
}
