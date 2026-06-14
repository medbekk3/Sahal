import { geohashForLocation, geohashQueryBounds, distanceBetween } from "geofire-common";

/** Default search radius: 5 km */
export const DEFAULT_DISPATCH_RADIUS_METERS = 5000;

export function encodeGeohash(lat: number, lng: number): string {
  return geohashForLocation([lat, lng]);
}

export function distanceKmBetween(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  return distanceBetween([from.lat, from.lng], [to.lat, to.lng]);
}

export function isWithinRadiusKm(
  center: { lat: number; lng: number },
  point: { lat: number; lng: number },
  radiusMeters: number
): boolean {
  return distanceKmBetween(center, point) * 1000 <= radiusMeters;
}

export function getGeohashQueryRanges(
  center: { lat: number; lng: number },
  radiusMeters: number
): Array<[string, string]> {
  return geohashQueryBounds([center.lat, center.lng], radiusMeters);
}

export function extractDriverCoordinates(data: Record<string, unknown>): {
  lat: number;
  lng: number;
} | null {
  const coordinates = data.coordinates as { lat?: number; lng?: number } | undefined;
  if (
    coordinates &&
    Number.isFinite(coordinates.lat) &&
    Number.isFinite(coordinates.lng)
  ) {
    return { lat: coordinates.lat!, lng: coordinates.lng! };
  }

  const currentLocation = data.currentLocation as
    | { location?: { latitude?: number; longitude?: number } }
    | undefined;
  const lat = currentLocation?.location?.latitude;
  const lng = currentLocation?.location?.longitude;

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat: lat!, lng: lng! };
  }

  return null;
}
