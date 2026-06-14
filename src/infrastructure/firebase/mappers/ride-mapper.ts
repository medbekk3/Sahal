import type { DocumentData } from "firebase/firestore";
import type { CreateRideInput, Ride, RideStatus } from "@/domain/entities/ride";
import type { Currency } from "@/domain/entities/shared";
import {
  mapGeoFromFirestore,
  mapGeoToFirestore,
  toDate,
  toRequiredDate,
} from "@/infrastructure/firebase/utils/firestore-utils";

export function mapRideFromFirestore(id: string, data: DocumentData): Ride {
  return {
    id,
    passengerId: data.passengerId ?? "",
    passengerUserId: data.passengerUserId ?? "",
    driverId: data.driverId ?? null,
    driverUserId: data.driverUserId ?? null,
    routeId: data.routeId ?? null,
    pickup: mapGeoFromFirestore(data.pickup) ?? { lat: 0, lng: 0, address: "" },
    dropoff: mapGeoFromFirestore(data.dropoff) ?? { lat: 0, lng: 0, address: "" },
    status: (data.status as RideStatus) ?? "requested",
    fare: data.fare ?? 0,
    price: data.price ?? data.fare ?? 0,
    commissionRate: data.commissionRate ?? 0.1,
    commissionAmount: data.commissionAmount ?? 0,
    commissionAppliedAt: toDate(data.commissionAppliedAt),
    currency: (data.currency as Currency) ?? "SAR",
    distanceMeters: data.distanceMeters ?? 0,
    durationSeconds: data.durationSeconds ?? 0,
    requestedAt: toRequiredDate(data.requestedAt),
    acceptedAt: toDate(data.acceptedAt),
    startedAt: toDate(data.startedAt),
    completedAt: toDate(data.completedAt),
    cancelledAt: toDate(data.cancelledAt),
    cancelReason: data.cancelReason ?? null,
    createdAt: toRequiredDate(data.createdAt),
    updatedAt: toRequiredDate(data.updatedAt),
  };
}

export function mapRideToFirestore(input: CreateRideInput): DocumentData {
  const now = new Date();
  return {
    passengerId: input.passengerId,
    passengerUserId: input.passengerUserId,
    driverId: null,
    driverUserId: null,
    routeId: input.routeId ?? null,
    pickup: mapGeoToFirestore(input.pickup),
    dropoff: mapGeoToFirestore(input.dropoff),
    status: "requested",
    fare: input.fare,
    price: input.price ?? input.fare,
    commissionRate: input.commissionRate ?? 0.1,
    commissionAmount: input.commissionAmount ?? 0,
    commissionAppliedAt: input.commissionAppliedAt ?? null,
    currency: input.currency ?? "SAR",
    distanceMeters: input.distanceMeters,
    durationSeconds: input.durationSeconds,
    requestedAt: now,
    acceptedAt: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    cancelReason: null,
    createdAt: now,
    updatedAt: now,
  };
}
