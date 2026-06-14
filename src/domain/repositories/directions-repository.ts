import type { DirectionsResult, GeoPoint } from "@/domain/entities/location";

export interface IDirectionsRepository {
  getRoute(origin: GeoPoint, destination: GeoPoint): Promise<DirectionsResult>;
}
