"use client";

import { useCallback, useEffect, useState } from "react";
import { container } from "@/infrastructure/di/container";

export function useNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  const notificationService = container.getNotificationService();

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    const unsubscribe = notificationService.onMessage((payload) => {
      console.info("FCM message received:", payload);
    });
    return unsubscribe;
  }, [notificationService]);

  const enableNotifications = useCallback(async () => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    if (result === "granted") {
      const fcmToken = await notificationService.getToken();
      setToken(fcmToken);
    }
    return result;
  }, [notificationService]);

  return { token, permission, enableNotifications };
}
