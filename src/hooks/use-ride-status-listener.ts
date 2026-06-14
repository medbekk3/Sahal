"use client";

import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseDb } from "@/infrastructure/firebase/config";
import type { RideResult } from "@/services/rideService";

const RIDE_STATUSES = [
  "requested",
  "pending",
  "accepted",
  "driver_arrived",
  "arriving",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type RideStatus = (typeof RIDE_STATUSES)[number] | (string & {});

export type RideDocument = Omit<RideResult, "status"> & {
  status: RideStatus;
};

type RideStatusToastConfig = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

const STATUS_TOASTS: Record<(typeof RIDE_STATUSES)[number], RideStatusToastConfig> = {
  requested: {
    title: "Ride requested",
    description: "Your ride request has been created and is waiting for a driver.",
  },
  pending: {
    title: "Waiting for driver",
    description: "Your ride is in the queue and waiting for confirmation.",
  },
  accepted: {
    title: "Ride accepted",
    description: "A driver has accepted your ride request.",
  },
  driver_arrived: {
    title: "Driver arrived",
    description: "Your driver has arrived at the pickup point.",
  },
  arriving: {
    title: "Driver is on the way",
    description: "Your driver is heading to the pickup location.",
  },
  in_progress: {
    title: "Ride started",
    description: "Your trip is now in progress.",
  },
  completed: {
    title: "Ride completed",
    description: "Your ride has been completed successfully.",
  },
  cancelled: {
    title: "Ride cancelled",
    description: "This ride was cancelled.",
    variant: "destructive",
  },
};

function normalizeRideStatus(status: unknown): RideStatus {
  if (typeof status !== "string") return "requested";

  const normalized = status.trim().toLowerCase().replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "requested":
    case "pending":
    case "accepted":
    case "driver_arrived":
    case "arriving":
    case "in_progress":
    case "completed":
    case "cancelled":
      return normalized;
    case "driverarrived":
      return "driver_arrived";
    case "inprogress":
      return "in_progress";
    default:
      return normalized;
  }
}

function isKnownRideStatus(status: RideStatus): status is (typeof RIDE_STATUSES)[number] {
  return (RIDE_STATUSES as readonly string[]).includes(status);
}

function getRideLabel(ride: RideDocument | null) {
  if (!ride) return "your ride";
  const destination = ride.dropoff?.address || ride.destination || "your destination";
  return `your ride to ${destination}`;
}

function buildToastConfig(nextStatus: RideStatus, ride: RideDocument | null): RideStatusToastConfig {
  if (isKnownRideStatus(nextStatus)) {
    const base = STATUS_TOASTS[nextStatus];

    if (nextStatus === "accepted") {
      return {
        ...base,
        description: `A driver has accepted ${getRideLabel(ride)}.`,
      };
    }

    if (nextStatus === "driver_arrived") {
      return {
        ...base,
        description: `Your driver has arrived for ${getRideLabel(ride)}.`,
      };
    }

    if (nextStatus === "in_progress") {
      return {
        ...base,
        description: `The trip for ${getRideLabel(ride)} is now in progress.`,
      };
    }

    if (nextStatus === "completed") {
      return {
        ...base,
        description: `The trip for ${getRideLabel(ride)} has been completed.`,
      };
    }

    return base;
  }

  return {
    title: "Ride status updated",
    description: `The ride status changed to ${nextStatus}.`,
  };
}

/**
 * Subscribe to a ride document and toast whenever its status changes.
 */
export function useRideStatusListener(rideId: string | null | undefined) {
  const { toast } = useToast();
  const [ride, setRide] = useState<RideDocument | null>(null);
  const [status, setStatus] = useState<RideStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previousStatusRef = useRef<RideStatus | null>(null);

  useEffect(() => {
    if (!rideId) {
      setRide(null);
      setStatus(null);
      setError(null);
      previousStatusRef.current = null;
      return;
    }

    const db = getFirebaseDb();
    const rideRef = doc(db, "rideRequests", rideId);
    previousStatusRef.current = null;

    const unsubscribe = onSnapshot(
      rideRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setRide(null);
          setStatus(null);
          setError("Ride document not found.");
          return;
        }

        const rideData = snapshot.data() as Omit<RideResult, "id">;
        const nextStatus = normalizeRideStatus(rideData.status);
        const nextRide: RideDocument = {
          id: snapshot.id,
          ...rideData,
          status: nextStatus,
        };

        setRide(nextRide);
        setStatus(nextStatus);
        setError(null);

        // Skip the first snapshot so we only notify on real transitions.
        const previousStatus = previousStatusRef.current;
        previousStatusRef.current = nextStatus;

        if (previousStatus && previousStatus !== nextStatus) {
          const toastConfig = buildToastConfig(nextStatus, nextRide);

          toast({
            title: toastConfig.title,
            description: toastConfig.description,
            variant: toastConfig.variant,
          });
        }
      },
      (snapshotError) => {
        setError(snapshotError.message);
      }
    );

    return unsubscribe;
  }, [rideId, toast]);

  return {
    ride,
    status,
    previousStatus: previousStatusRef.current,
    error,
    hasRide: Boolean(ride),
    hasError: Boolean(error),
  };
}
