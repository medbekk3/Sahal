import type { DirectionsResult, GeoPoint } from "@/domain/entities/location";
import type { IDirectionsRepository } from "@/domain/repositories/directions-repository";

interface DirectionsApiResponse {
  routes: Array<{
    overview_polyline: { points: string };
    legs: Array<{
      distance: { text: string };
      duration: { text: string };
      start_address: string;
      end_address: string;
    }>;
  }>;
  status: string;
  error_message?: string;
}

export class GoogleDirectionsRepository implements IDirectionsRepository {
  async getRoute(origin: GeoPoint, destination: GeoPoint): Promise<DirectionsResult> {
    const params = new URLSearchParams({
      originLat: String(origin.lat),
      originLng: String(origin.lng),
      destLat: String(destination.lat),
      destLng: String(destination.lng),
    });

    const response = await fetch(`/api/directions?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Directions API request failed");
    }

    const data = (await response.json()) as DirectionsApiResponse;

    if (data.status !== "OK" || !data.routes[0]) {
      throw new Error(data.error_message ?? `Directions API error: ${data.status}`);
    }

    const route = data.routes[0];

    return {
      origin: {
        id: "origin",
        name: "Origin",
        address: route.legs[0]?.start_address ?? "",
        location: origin,
      },
      destination: {
        id: "destination",
        name: "Destination",
        address: route.legs[route.legs.length - 1]?.end_address ?? "",
        location: destination,
      },
      legs: route.legs.map((leg) => ({
        distance: leg.distance.text,
        duration: leg.duration.text,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
      })),
      polyline: route.overview_polyline.points,
    };
  }
}
