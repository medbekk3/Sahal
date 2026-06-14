import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import {
  DEFAULT_DISPATCH_RADIUS_METERS,
  distanceKmBetween,
  extractDriverCoordinates,
  getGeohashQueryRanges,
  isWithinRadiusKm,
} from "@/features/dispatch/lib/geohash";
import { updateRideStatus } from "@/services/rideService";

const RIDE_REQUESTS_COLLECTION = "rideRequests";
const NOTIFICATIONS_COLLECTION = "notifications";

export type NearestDriverResult = {
  driverId: string;
  distanceKm: number;
  geohash: string;
};

export type FindNearestDriverOptions = {
  radiusMeters?: number;
  excludeDriverIds?: string[];
};

export async function findNearestDriver(
  db: Firestore,
  pickup: { lat: number; lng: number },
  options: FindNearestDriverOptions = {}
): Promise<NearestDriverResult | null> {
  const radiusMeters = options.radiusMeters ?? DEFAULT_DISPATCH_RADIUS_METERS;
  const exclude = new Set(options.excludeDriverIds ?? []);
  const bounds = getGeohashQueryRanges(pickup, radiusMeters);
  const candidates = new Map<string, Record<string, unknown>>();

  for (const [startHash, endHash] of bounds) {
    const driversQuery = query(
      collection(db, "drivers"),
      where("status", "==", "online"),
      where("geohash", ">=", startHash),
      where("geohash", "<=", endHash)
    );

    const snapshot = await getDocs(driversQuery);
    snapshot.docs.forEach((driverDoc) => {
      candidates.set(driverDoc.id, driverDoc.data());
    });
  }

  let nearest: NearestDriverResult | null = null;

  for (const [driverId, data] of candidates) {
    if (exclude.has(driverId)) continue;

    const coords = extractDriverCoordinates(data);
    if (!coords) continue;
    if (!isWithinRadiusKm(pickup, coords, radiusMeters)) continue;

    const distanceKm = distanceKmBetween(pickup, coords);
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = {
        driverId,
        distanceKm: Number(distanceKm.toFixed(3)),
        geohash: String(data.geohash ?? ""),
      };
    }
  }

  return nearest;
}

export type AssignNearestDriverOptions = FindNearestDriverOptions & {
  pickupAddress?: string;
};

export async function assignNearestDriver(
  db: Firestore,
  rideId: string,
  pickup: { lat: number; lng: number },
  options: AssignNearestDriverOptions = {}
): Promise<NearestDriverResult | null> {
  const nearest = await findNearestDriver(db, pickup, options);
  if (!nearest) return null;

  const batch = writeBatch(db);

  batch.update(doc(db, RIDE_REQUESTS_COLLECTION, rideId), {
    assignedDriverId: nearest.driverId,
    driverId: nearest.driverId,
    driverUserId: nearest.driverId,
    assignedDistanceKm: nearest.distanceKm,
    dispatchStatus: "pending",
    dispatchedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(collection(db, NOTIFICATIONS_COLLECTION)), {
    userId: nearest.driverId,
    type: "ride_dispatch",
    title: "New ride request",
    body: options.pickupAddress
      ? `You have a nearby ride request from: ${options.pickupAddress}`
      : "You have a new ride request in your area.",
    data: { rideId },
    read: false,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
  return nearest;
}

export async function redispatchRide(
  db: Firestore,
  rideId: string,
  pickup: { lat: number; lng: number },
  excludeDriverIds: string[] = [],
  options: AssignNearestDriverOptions = {}
): Promise<NearestDriverResult | null> {
  await updateDoc(doc(db, RIDE_REQUESTS_COLLECTION, rideId), {
    assignedDriverId: null,
    driverId: null,
    driverUserId: null,
    dispatchStatus: "searching",
    updatedAt: serverTimestamp(),
  });

  return assignNearestDriver(db, rideId, pickup, {
    ...options,
    excludeDriverIds,
  });
}

export async function completeRideAndSetAvailable(
  db: Firestore,
  rideId: string,
  driverUserId: string
): Promise<void> {
  await updateRideStatus(rideId, "completed", {
    driverUserId,
  });

  await updateDoc(doc(db, "drivers", driverUserId), {
    status: "online",
    updatedAt: serverTimestamp(),
  });
}
