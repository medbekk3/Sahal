import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/infrastructure/firebase/config";
import { encodeGeohash } from "@/features/dispatch/lib/geohash";

export async function updateDriverLocation(
  driverId: string,
  lat: number,
  lng: number
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), "drivers", driverId), {
    coordinates: { lat, lng },
    geohash: encodeGeohash(lat, lng),
    locationUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateDriverLocationFromGeoPoint(
  driverId: string,
  position: GeolocationPosition
): Promise<void> {
  return updateDriverLocation(
    driverId,
    position.coords.latitude,
    position.coords.longitude
  );
}
