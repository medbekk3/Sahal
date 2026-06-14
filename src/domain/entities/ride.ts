import type { Currency, GeoLocation } from "@/domain/entities/shared";

export type RideStatus =
  | "requested"
  | "accepted"
  | "arriving"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Ride {
  id: string;
  /** FK → passengers.id */
  passengerId: string;
  /** Denormalized FK → users.id */
  passengerUserId: string;
  /** FK → drivers.id — null until a driver accepts */
  driverId: string | null;
  /** Denormalized FK → users.id */
  driverUserId: string | null;
  /** FK → routes.id — optional predefined route */
  routeId: string | null;
  pickup: GeoLocation;
  dropoff: GeoLocation;
  status: RideStatus;
  fare: number;
  price: number;
  commissionRate?: number;
  commissionAmount?: number;
  commissionAppliedAt?: Date | null;
  currency: Currency;
  distanceMeters: number;
  durationSeconds: number;
  requestedAt: Date;
  acceptedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRideInput {
  passengerId: string;
  passengerUserId: string;
  routeId?: string | null;
  pickup: GeoLocation;
  dropoff: GeoLocation;
  fare: number;
  price?: number;
  commissionRate?: number;
  commissionAmount?: number;
  commissionAppliedAt?: Date | null;
  currency?: Currency;
  distanceMeters: number;
  durationSeconds: number;
}

export interface UpdateRideInput {
  driverId?: string | null;
  driverUserId?: string | null;
  status?: RideStatus;
  fare?: number;
  price?: number;
  acceptedAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  cancelReason?: string | null;
  commissionRate?: number;
  commissionAmount?: number;
  commissionAppliedAt?: Date | null;
}
