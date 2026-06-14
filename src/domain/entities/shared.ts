export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

export type UserRole = "passenger" | "driver" | "admin" | "both";

export type Currency = "SAR" | "USD" | "EUR";
