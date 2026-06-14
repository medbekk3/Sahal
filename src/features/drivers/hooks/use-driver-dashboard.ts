"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, query, collection, where } from "firebase/firestore";
import { getFirebaseDb } from "@/infrastructure/firebase/config";
import {
  calculateCommission,
  formatDateLabel,
  safeAmount,
  sumAmounts,
} from "@/features/drivers/lib/commission";

export type DriverProfile = {
  id: string;
  fullName: string;
  status: string;
  totalDebt: number;
  totalTrips: number;
  lastPaymentDate: string;
};

export type DriverStats = {
  totalTrips: number;
  totalEarnings: number;
  owedCommissions: number;
  pendingBalance: number;
  lastPaymentDate: string;
  isOnTrip: boolean;
  activeRideId: string | null;
  passengerName?: string;
  passengerPhone?: string;
  destinationAddress?: string;
  price?: number;
};

const ACTIVE_RIDE_STATUSES = new Set(["accepted", "arriving", "in_progress"]);
const RIDE_REQUESTS_COLLECTION = "rideRequests";

export function useDriverDashboard(driverId: string | undefined) {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [rideStats, setRideStats] = useState({
    totalTrips: 0,
    totalEarnings: 0,
    owedCommissions: 0,
    isOnTrip: false,
    activeRideId: null as string | null,
    rideData: null as any | null, 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) {
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();

    // جلب ملف تعريف السائق
    const unsubscribeProfile = onSnapshot(
      doc(db, "drivers", driverId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setProfile(null);
          setLoading(false);
          return;
        }
        const data = snapshot.data();
        setProfile({
          id: snapshot.id,
          fullName: String(data.fullName ?? data.displayName ?? "Driver"),
          status: String(data.status ?? "offline"),
          totalDebt: safeAmount(data.totalDebt),
          totalTrips: safeAmount(data.totalTrips),
          lastPaymentDate: formatDateLabel(data.lastPaymentDate),
        });
        setLoading(false);
      }
    );

    // جلب بيانات الرحلات
    const ridesQuery = query(
      collection(db, RIDE_REQUESTS_COLLECTION),
      where("driverUserId", "==", driverId)
    );

    const unsubscribeRides = onSnapshot(
      ridesQuery,
      (snapshot) => {
        const completedRides = snapshot.docs.filter(
          (rideDoc) => String(rideDoc.data().status ?? "") === "completed"
        );

        const activeRide = snapshot.docs.find((rideDoc) =>
          ACTIVE_RIDE_STATUSES.has(String(rideDoc.data().status ?? ""))
        );

        setRideStats({
          totalTrips: completedRides.length,
          totalEarnings: sumAmounts(
            completedRides.map((rideDoc) => rideDoc.data().price ?? rideDoc.data().fare ?? 0)
          ),
          owedCommissions: sumAmounts(
            completedRides.map((rideDoc) => {
              const data = rideDoc.data();
              const price = data.price ?? data.fare ?? 0;
              return data.commissionAmount ?? calculateCommission(price);
            })
          ),
          isOnTrip: Boolean(activeRide),
          activeRideId: activeRide?.id ?? null,
          rideData: activeRide ? activeRide.data() : null,
        });
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribeRides();
    };
  }, [driverId]);

  // هنا التعديل الجوهري لقراءة الحقول الجديدة
  const stats: DriverStats = useMemo(
    () => ({
      totalTrips: rideStats.totalTrips,
      totalEarnings: rideStats.totalEarnings,
      owedCommissions: rideStats.owedCommissions,
      pendingBalance: profile?.totalDebt ?? 0,
      lastPaymentDate: profile?.lastPaymentDate ?? "—",
      isOnTrip: rideStats.isOnTrip || profile?.status === "on_trip",
      activeRideId: rideStats.activeRideId,
      
      // قراءة البيانات من هيكل Firestore المحدث
      passengerName: rideStats.rideData?.passengerName ?? "غير معروف",
      passengerPhone: rideStats.rideData?.passengerPhone ?? "غير متوفر",
      destinationAddress: rideStats.rideData?.dropoff?.address ?? "غير محددة",
      price: rideStats.rideData?.price ?? 0,
    }),
    [profile, rideStats]
  );

  const isAvailable = useMemo(() => {
    if (!profile) return false;
    return profile.status === "online" || profile.status === "approved";
  }, [profile]);

  return { profile, stats, loading, error, isAvailable };
}