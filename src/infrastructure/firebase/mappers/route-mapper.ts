import type { DocumentData } from "firebase/firestore";
import type { CreateRouteInput, Route } from "@/domain/entities/route";
import type { GeoLocation } from "@/domain/entities/shared";
import {
  mapGeoFromFirestore,
  mapGeoToFirestore,
  toRequiredDate,
} from "@/infrastructure/firebase/utils/firestore-utils";

function mapNamedGeo(data: DocumentData | undefined): GeoLocation {
  const geo = mapGeoFromFirestore(data);
  return geo ?? { lat: 0, lng: 0, address: "" };
}

export function mapRouteFromFirestore(id: string, data: DocumentData): Route {
  return {
    id,
    name: data.name ?? "",
    origin: mapNamedGeo(data.origin),
    destination: mapNamedGeo(data.destination),
    waypoints: (data.waypoints as Route["waypoints"]) ?? [],
    distanceMeters: data.distanceMeters ?? 0,
    durationSeconds: data.durationSeconds ?? 0,
    polyline: data.polyline ?? "",
    isActive: data.isActive ?? true,
    createdAt: toRequiredDate(data.createdAt),
    updatedAt: toRequiredDate(data.updatedAt),
  };
}

export function mapRouteToFirestore(input: CreateRouteInput): DocumentData {
  const now = new Date();
  return {
    name: input.name,
    origin: mapGeoToFirestore(input.origin),
    destination: mapGeoToFirestore(input.destination),
    waypoints: input.waypoints ?? [],
    distanceMeters: input.distanceMeters,
    durationSeconds: input.durationSeconds,
    polyline: input.polyline,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
}
