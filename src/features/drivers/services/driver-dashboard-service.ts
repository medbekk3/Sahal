import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/infrastructure/firebase/config";
import { updateRideStatus } from "@/services/rideService";

export type DriverAvailabilityStatus = "online" | "offline" | "on_trip";
const RIDE_REQUESTS_COLLECTION = "rideRequests";

export async function setDriverAvailability(
  driverId: string,
  available: boolean
): Promise<void> {
  const nextStatus: DriverAvailabilityStatus = available ? "online" : "offline";
  await updateDoc(doc(getFirebaseDb(), "drivers", driverId), {
    status: nextStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function acceptRideRequest(rideId: string, driverUserId: string): Promise<void> {
  await updateRideStatus(rideId, "accepted", {
    driverId: driverUserId,
    driverUserId,
  });

  const db = getFirebaseDb();
  await updateDoc(doc(db, RIDE_REQUESTS_COLLECTION, rideId), {
    dispatchStatus: "accepted",
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "drivers", driverUserId), {
    status: "on_trip",
    updatedAt: serverTimestamp(),
  });
}

// --- هذه هي الدالة الجديدة التي ستحل مشكلتك ---
export async function completeRideAndSetAvailable(rideId: string, driverUserId: string): Promise<void> {
  const db = getFirebaseDb();

  // 1. إنهاء الرحلة وتحديث حالتها في خدمة الرحلات
  await updateRideStatus(rideId, "completed", {
    driverUserId,
  });

  // 2. تحديث حالة السائق إلى "online" ليكون متاحاً لرحلة جديدة
  await updateDoc(doc(db, "drivers", driverUserId), {
    status: "online", 
    updatedAt: serverTimestamp(),
  });

  console.log(`[DispatchService] الرحلة ${rideId} انتهت والسائق ${driverUserId} أصبح متاحاً.`);
}

export async function rejectRideRequest(rideId: string, driverUserId: string): Promise<void> {
  const db = getFirebaseDb();
  const rideRef = doc(db, RIDE_REQUESTS_COLLECTION, rideId);
  const rideSnapshot = await getDoc(rideRef);

  if (!rideSnapshot.exists()) {
    throw new Error("Ride not found");
  }

  await updateRideStatus(rideId, "cancelled", {
    assignedDriverId: null,
    dispatchStatus: "cancelled",
    cancelReason: `Rejected by driver ${driverUserId}`,
  });

  await updateDoc(rideRef, {
    [`rejectedBy.${driverUserId}`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
