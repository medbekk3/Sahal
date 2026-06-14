export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  location: GeoPoint;
}

export interface RouteLeg {
  distance: string;
  duration: string;
  startAddress: string;
  endAddress: string;
}

export interface DirectionsResult {
  origin: Place;
  destination: Place;
  legs: RouteLeg[];
  polyline: string;
}
