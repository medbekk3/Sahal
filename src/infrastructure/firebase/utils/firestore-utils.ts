import type { DocumentData, Timestamp } from "firebase/firestore";
import { GeoPoint } from "firebase/firestore";
import type { GeoLocation } from "@/domain/entities/shared";

export function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return value.toDate();
}

export function toRequiredDate(value: Timestamp | Date | null | undefined): Date {
  return toDate(value) ?? new Date();
}

export function mapGeoFromFirestore(data: DocumentData | undefined): GeoLocation | null {
  if (!data) return null;
  const point = data.location as GeoPoint | undefined;
  if (!point) return null;
  return {
    lat: point.latitude,
    lng: point.longitude,
    address: (data.address as string) ?? "",
  };
}

export function mapGeoToFirestore(geo: GeoLocation): DocumentData {
  return {
    location: new GeoPoint(geo.lat, geo.lng),
    address: geo.address,
  };
}

export function snapshotToEntity<T>(
  docs: Array<{ id: string; data: () => DocumentData }>,
  mapper: (id: string, data: DocumentData) => T
): T[] {
  return docs.map((doc) => mapper(doc.id, doc.data()));
}
