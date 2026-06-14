"use client";

import { useEffect, useRef } from "react";
import { updateDriverLocationFromGeoPoint } from "@/features/drivers/services/driver-location-service";

type UseDriverLocationOptions = {
  driverId: string | undefined;
  enabled: boolean;
  intervalMs?: number;
};

export function useDriverLocation({
  driverId,
  enabled,
  intervalMs = 30_000,
}: UseDriverLocationOptions) {
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!driverId || !enabled || typeof window === "undefined" || !navigator.geolocation) {
      return;
    }

    const syncLocation = (position: GeolocationPosition) => {
      void updateDriverLocationFromGeoPoint(driverId, position).catch((error) => {
        console.warn("[useDriverLocation] Failed to sync driver location:", error);
      });
    };

    navigator.geolocation.getCurrentPosition(syncLocation, console.warn, {
      enableHighAccuracy: true,
      maximumAge: 10_000,
    });

    watchIdRef.current = navigator.geolocation.watchPosition(
      syncLocation,
      console.warn,
      { enableHighAccuracy: true, maximumAge: intervalMs }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [driverId, enabled, intervalMs]);
}
