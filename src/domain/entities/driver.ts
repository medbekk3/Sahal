import type { GeoLocation } from "@/domain/entities/shared";

export type DriverStatus =
  | "pending"
  | "approved"
  | "suspended"
  | "offline"
  | "online"
  | "on_trip";

export interface Driver {
  /** Document ID — same as `userId` */
  id: string;
  userId: string;
  licenseNumber: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleYear: number;
  status: DriverStatus;
  totalDebt: number;
  currentLocation: GeoLocation | null;
  totalTrips: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDriverInput {
  userId: string;
  licenseNumber: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleYear: number;
}

export interface UpdateDriverInput {
  licenseNumber?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleYear?: number;
  status?: DriverStatus;
  totalDebt?: number;
  currentLocation?: GeoLocation | null;
  totalTrips?: number;
}
