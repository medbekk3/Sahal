import {
  collection,
  doc,
  GeoPoint,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/infrastructure/firebase/config";

const RIDE_REQUESTS = "rideRequests";

const STATUS_TIMESTAMPS = {
  accepted: "acceptedAt",
  arriving: "acceptedAt",
  in_progress: "startedAt",
  completed: "completedAt",
  cancelled: "cancelledAt",
};

function mapGeoToFirestore(geo) {
  if (!geo || typeof geo === "string") {
    return {
      location: null,
      address: typeof geo === "string" ? geo : "",
    };
  }

  const lat = Number(geo.lat ?? 0);
  const lng = Number(geo.lng ?? 0);

  return {
    location: Number.isFinite(lat) && Number.isFinite(lng) ? new GeoPoint(lat, lng) : null,
    address: geo.address ?? "",
  };
}

function mapGeoFromFirestore(data) {
  if (!data?.location) {
    return {
      lat: 0,
      lng: 0,
      address: data?.address ?? "",
    };
  }
  return {
    lat: data.location.latitude,
    lng: data.location.longitude,
    address: data.address ?? "",
  };
}

function mapRideFromFirestore(id, data) {
  return {
    id,
    passengerId: data.passengerId ?? "",
    passengerUserId: data.passengerUserId ?? "",
    passengerName: data.passengerName ?? "",
    passengerPhone: data.passengerPhone ?? "",
    driverId: data.driverId ?? null,
    driverUserId: data.driverUserId ?? null,
    routeId: data.routeId ?? null,
    pickup: mapGeoFromFirestore(data.pickup),
    dropoff: mapGeoFromFirestore(data.dropoff),
    destination: data.destination ?? data.dropoff?.address ?? "",
    status: data.status ?? "requested",
    fare: data.fare ?? 0,
    price: data.price ?? data.fare ?? 0,
    commissionRate: data.commissionRate ?? 0.1,
    commissionAmount: data.commissionAmount ?? 0,
    commissionAppliedAt: data.commissionAppliedAt?.toDate?.() ?? data.commissionAppliedAt ?? null,
    currency: data.currency ?? "SAR",
    distanceMeters: data.distanceMeters ?? 0,
    durationSeconds: data.durationSeconds ?? 0,
    requestedAt: data.requestedAt?.toDate?.() ?? data.requestedAt,
    acceptedAt: data.acceptedAt?.toDate?.() ?? data.acceptedAt ?? null,
    startedAt: data.startedAt?.toDate?.() ?? data.startedAt ?? null,
    completedAt: data.completedAt?.toDate?.() ?? data.completedAt ?? null,
    cancelledAt: data.cancelledAt?.toDate?.() ?? data.cancelledAt ?? null,
    cancelReason: data.cancelReason ?? null,
    assignedDriverId: data.assignedDriverId ?? null,
    assignedDistanceKm: data.assignedDistanceKm ?? null,
    dispatchStatus: data.dispatchStatus ?? null,
    dispatchedAt: data.dispatchedAt?.toDate?.() ?? data.dispatchedAt ?? null,
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
  };
}

/**
 * Create a new ride request.
 * @param {{
 *   passengerId: string,
 *   passengerUserId: string,
 *   passengerName?: string,
 *   passengerPhone?: string,
 *   pickup: { lat: number, lng: number, address?: string } | string,
 *   dropoff: { lat: number, lng: number, address?: string } | string,
 *   destination?: string,
 *   fare: number,
 *   price?: number,
 *   commissionRate?: number,
 *   commissionAmount?: number,
 *   commissionAppliedAt?: Date | null,
 *   currency?: string,
 *   distanceMeters: number,
 *   durationSeconds: number,
 *   routeId?: string|null
 * }} input
 */
export async function createRideRequest(input) {
  const db = getFirebaseDb();
  const rideRef = doc(collection(db, RIDE_REQUESTS));
  const now = new Date();
  const selectedDriverId = input.driverId ?? input.driverUserId ?? input.assignedDriverId ?? null;
  const pickupSource = input.pickup ?? "";
  const dropoffSource = input.dropoff ?? input.destination ?? "";
  const normalizedPickup = mapGeoToFirestore(pickupSource);
  const normalizedDropoff = mapGeoToFirestore(dropoffSource);
  const normalizedDestination =
    typeof input.destination === "string" && input.destination.trim()
      ? input.destination.trim()
      : normalizedDropoff.address;

  const app = db?.app ?? null;

  console.groupCollapsed("[rideService.createRideRequest] start");
  console.log("app name:", app?.name ?? "unknown");
  console.log("projectId:", app?.options?.projectId ?? "unknown");
  console.log("write target collection:", RIDE_REQUESTS);
  console.log("incoming payload:", input);

  const rideData = {
    passengerId: input.passengerId,
    passengerUserId: input.passengerUserId,
    passengerName: input.passengerName ?? "",
    passengerPhone: input.passengerPhone ?? "",
    driverId: selectedDriverId,
    driverUserId: selectedDriverId,
    assignedDriverId: selectedDriverId,
    routeId: input.routeId ?? null,
    pickup: normalizedPickup,
    dropoff: normalizedDropoff,
    destination: normalizedDestination,
    status: input.status ?? "requested",
    fare: input.fare ?? input.price ?? 0,
    price: input.price ?? input.fare ?? 0,
    commissionRate: input.commissionRate ?? 0.1,
    commissionAmount: input.commissionAmount ?? 0,
    commissionAppliedAt: input.commissionAppliedAt ?? null,
    currency: input.currency ?? "DZD",
    distanceMeters: input.distanceMeters ?? 0,
    durationSeconds: input.durationSeconds ?? 0,
    dispatchStatus: selectedDriverId ? "pending" : "unassigned",
    dispatchedAt: selectedDriverId ? now : null,
    requestedAt: now,
    acceptedAt: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    cancelReason: null,
    createdAt: now,
    updatedAt: now,
  };

  console.log("normalized payload:", rideData);

  try {
    await setDoc(rideRef, rideData);
    console.log("initial ride document written:", {
      path: rideRef.path,
      id: rideRef.id,
    });

    const saved = await getDoc(rideRef);
    console.log("verification exists:", saved.exists());
    if (saved.exists()) {
      console.log("verification data:", saved.data());
    }

    return mapRideFromFirestore(saved.id, saved.data());
  } catch (error) {
    console.error("[rideService.createRideRequest] failed:", error);
    throw error;
  } finally {
    console.groupEnd();
  }
}

/**
 * Update ride status and related fields.
 * @param {string} rideId
 * @param {string} status - requested | accepted | arriving | in_progress | completed | cancelled
 * @param {{ driverId?: string, driverUserId?: string, cancelReason?: string, fare?: number, price?: number }} [options]
 */
export async function updateRideStatus(rideId, status, options = {}) {
  const db = getFirebaseDb();
  const rideRef = doc(db, RIDE_REQUESTS, rideId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(rideRef);

    if (!snapshot.exists()) {
      throw new Error(`Ride not found: ${rideId}`);
    }

    const rideData = snapshot.data();
    const updates = {
      status,
      updatedAt: serverTimestamp(),
      ...options,
    };

    const timestampField = STATUS_TIMESTAMPS[status];
    if (timestampField) {
      updates[timestampField] = serverTimestamp();
    }

    if (status === "cancelled") {
      if (updates.dispatchStatus == null) {
        updates.dispatchStatus = "cancelled";
      }
      if (updates.assignedDriverId === undefined) {
        updates.assignedDriverId = null;
      }
    }

    if (status === "completed") {
      const driverUserId =
        options.driverUserId ?? rideData.driverUserId ?? rideData.driverId ?? null;

      if (!driverUserId) {
        throw new Error(`Cannot complete ride without a driver: ${rideId}`);
      }

      const alreadyApplied =
        rideData.commissionAppliedAt != null || Number(rideData.commissionAmount ?? 0) > 0;
      const ridePrice = Number(rideData.price ?? rideData.fare ?? options.fare ?? 0);
      const commissionRate = Number(rideData.commissionRate ?? 0.1);
      const commissionAmount = Number((ridePrice * commissionRate).toFixed(2));

      updates.price = ridePrice;
      updates.commissionRate = commissionRate;
      updates.commissionAmount = commissionAmount;

      if (!alreadyApplied) {
        const driverRef = doc(db, "drivers", driverUserId);
        const driverSnapshot = await transaction.get(driverRef);

        if (!driverSnapshot.exists()) {
          throw new Error(`Driver not found: ${driverUserId}`);
        }

        const currentDebt = Number(driverSnapshot.data().totalDebt ?? 0);
        const commissionRef = doc(collection(db, "commissions"));

        transaction.set(commissionRef, {
          rideId,
          paymentId: rideId,
          driverUserId,
          amount: commissionAmount,
          rate: commissionRate,
          currency: rideData.currency ?? "DZD",
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        transaction.update(driverRef, {
          totalDebt: Number((currentDebt + commissionAmount).toFixed(2)),
          updatedAt: serverTimestamp(),
        });

        updates.commissionAppliedAt = serverTimestamp();
      }
    }

    transaction.update(rideRef, updates);
  });

  const updated = await getDoc(rideRef);
  return mapRideFromFirestore(updated.id, updated.data());
}

/**
 * Fetch rides with status "requested" (available for drivers).
 * @param {number} [max=50]
 */
export async function getAvailableRides(max = 50) {
  const db = getFirebaseDb();
  const q = query(
    collection(db, RIDE_REQUESTS),
    where("status", "==", "requested"),
    orderBy("requestedAt", "desc"),
    limit(max)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapRideFromFirestore(d.id, d.data()));
}

/**
 * Fetch a single ride by ID.
 * @param {string} rideId
 */
export async function getRideById(rideId) {
  const db = getFirebaseDb();
  const snapshot = await getDoc(doc(db, RIDE_REQUESTS, rideId));
  if (!snapshot.exists()) return null;
  return mapRideFromFirestore(snapshot.id, snapshot.data());
}
