import type { GeoLocation } from "@/domain/entities/shared";

export interface RouteWaypoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface Route {
  id: string;
  name: string;
  origin: GeoLocation;
  destination: GeoLocation;
  waypoints: RouteWaypoint[];
  distanceMeters: number;
  durationSeconds: number;
  polyline: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRouteInput {
  name: string;
  origin: GeoLocation;
  destination: GeoLocation;
  waypoints?: RouteWaypoint[];
  distanceMeters: number;
  durationSeconds: number;
  polyline: string;
  isActive?: boolean;
}

export interface UpdateRouteInput {
  name?: string;
  origin?: GeoLocation;
  destination?: GeoLocation;
  waypoints?: RouteWaypoint[];
  distanceMeters?: number;
  durationSeconds?: number;
  polyline?: string;
  isActive?: boolean;
}
