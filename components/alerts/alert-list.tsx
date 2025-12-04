"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { X, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  getAlerts,
  markAlertAsRead,
  dismissAlert,
  markAllAsRead,
  Alert,
  AlertStatus,
  AlertPriority,
} from "@/lib/api/alerts";

interface AlertListProps {
  userId: string;
  onClose?: () => void;
}

export function AlertList({ userId, onClose }: AlertListProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await getAlerts(userId, {
        page: 1,
        page_size: 20,
      });
      setAlerts(response.alerts);
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [userId]);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId, userId);
      await fetchAlerts();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      await dismissAlert(alertId, userId);
      await fetchAlerts();
    } catch (error) {
      console.error("Failed to dismiss:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(userId);
      await fetchAlerts();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getPriorityColor = (priority: AlertPriority) => {
    switch (priority) {
      case AlertPriority.CRITICAL:
        return "bg-red-500";
      case AlertPriority.HIGH:
        return "bg-orange-500";
      case AlertPriority.MEDIUM:
        return "bg-blue-500";
      case AlertPriority.LOW:
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-neutral-500">Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-neutral-500">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {alerts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-neutral-500">No notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {alerts.map((alert) => (
              <div
                key={alert.alert_id}
                className={`p-4 hover:bg-neutral-50 transition-colors ${
                  alert.status === AlertStatus.UNREAD ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getPriorityColor(
                      alert.priority
                    )}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium">{alert.title}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => handleDismiss(alert.alert_id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-neutral-500">
                        {formatDistanceToNow(new Date(alert.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {alert.status === AlertStatus.UNREAD && (
                        <Badge variant="outline" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    {alert.action_url && alert.action_label && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 mt-2 text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          handleMarkAsRead(alert.alert_id);
                          if (onClose) onClose();
                          window.location.href = alert.action_url!;
                        }}
                      >
                        {alert.action_label}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            if (onClose) onClose();
            window.location.href = "/alerts";
          }}
        >
          View all notifications
        </Button>
      </div>
    </div>
  );
}
