import type { DirectionsResult, GeoPoint } from "@/domain/entities/location";
import type { IDirectionsRepository } from "@/domain/repositories/directions-repository";

export async function getDirectionsUseCase(
  directionsRepository: IDirectionsRepository,
  origin: GeoPoint,
  destination: GeoPoint
): Promise<DirectionsResult> {
  return directionsRepository.getRoute(origin, destination);
}
