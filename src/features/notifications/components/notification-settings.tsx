"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { ar } from "@/lib/i18n/ar";

export function NotificationSettings() {
  const { permission, token, enableNotifications } = useNotifications();

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        الإذن: <span className="font-medium text-foreground">{permission}</span>
      </p>
      <Button variant="outline" onClick={() => enableNotifications()}>
        <Bell className="ms-2 h-4 w-4" />
        {ar.enableNotifications}
      </Button>
      {token && (
        <p className="truncate text-xs text-muted-foreground" title={token}>
          تم تسجيل رمز FCM
        </p>
      )}
    </div>
  );
}
