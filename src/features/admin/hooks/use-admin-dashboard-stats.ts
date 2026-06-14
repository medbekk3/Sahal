"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/infrastructure/firebase/config";

export type AdminDashboardStats = {
  totalRides: number;
  activeDrivers: number;
  totalPlatformEarnings: number;
  totalPendingDebts: number;
};

type SnapshotState = "idle" | "loading" | "ready" | "error";

const ACTIVE_DRIVER_STATUSES = new Set(["approved", "active", "online", "on_trip"]);
const COLLECTED_COMMISSION_STATUSES = new Set(["collected", "paid", "settled"]);
const RIDE_REQUESTS_COLLECTION = "rideRequests";

function formatNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export function useAdminDashboardStats() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalRides: 0,
    activeDrivers: 0,
    totalPlatformEarnings: 0,
    totalPendingDebts: 0,
  });
  const [state, setState] = useState<SnapshotState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    let mounted = true;
    let readyListeners = 0;
    const markReady = () => {
      readyListeners += 1;
      if (mounted && readyListeners >= 3) {
        setState("ready");
      }
    };

    setState("loading");
    setError(null);

    const unsubscribeRides = onSnapshot(
      collection(db, RIDE_REQUESTS_COLLECTION),
      (snapshot) => {
        if (!mounted) return;
        setStats((current) => ({ ...current, totalRides: snapshot.size }));
        markReady();
      },
      (snapshotError) => {
        if (!mounted) return;
        setError(snapshotError.message);
        setState("error");
      }
    );

    const unsubscribeDrivers = onSnapshot(
      collection(db, "drivers"),
      (snapshot) => {
        if (!mounted) return;

        const activeDrivers = snapshot.docs.filter((driverDoc) =>
          ACTIVE_DRIVER_STATUSES.has(String(driverDoc.data().status ?? "").toLowerCase())
        ).length;
        const totalPendingDebts = snapshot.docs.reduce(
          (sum, driverDoc) => sum + Number(driverDoc.data().totalDebt ?? 0),
          0
        );

        setStats((current) => ({
          ...current,
          activeDrivers,
          totalPendingDebts: formatNumber(totalPendingDebts),
        }));
        markReady();
      },
      (snapshotError) => {
        if (!mounted) return;
        setError(snapshotError.message);
        setState("error");
      }
    );

    const unsubscribeCommissions = onSnapshot(
      collection(db, "commissions"),
      (snapshot) => {
        if (!mounted) return;

        const totalPlatformEarnings = snapshot.docs.reduce((sum, commissionDoc) => {
          const data = commissionDoc.data();
          const amount = Number(data.amount ?? 0);
          const status = String(data.status ?? "pending").toLowerCase();
          return COLLECTED_COMMISSION_STATUSES.has(status) ? sum + amount : sum;
        }, 0);

        setStats((current) => ({
          ...current,
          totalPlatformEarnings: formatNumber(totalPlatformEarnings),
        }));
        markReady();
      },
      (snapshotError) => {
        if (!mounted) return;
        setError(snapshotError.message);
        setState("error");
      }
    );

    return () => {
      mounted = false;
      unsubscribeRides();
      unsubscribeDrivers();
      unsubscribeCommissions();
    };
  }, []);

  return {
    stats,
    loading: state === "loading",
    error,
  };
}
