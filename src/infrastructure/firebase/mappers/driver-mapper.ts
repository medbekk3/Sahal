import type { DocumentData } from "firebase/firestore";
import type {
  CreateDriverInput,
  Driver,
  DriverStatus,
  UpdateDriverInput,
} from "@/domain/entities/driver";
import {
  mapGeoFromFirestore,
  mapGeoToFirestore,
  toRequiredDate,
} from "@/infrastructure/firebase/utils/firestore-utils";

export function mapDriverFromFirestore(id: string, data: DocumentData): Driver {
  return {
    id,
    userId: data.userId ?? id,
    licenseNumber: data.licenseNumber ?? "",
    vehiclePlate: data.vehiclePlate ?? "",
    vehicleModel: data.vehicleModel ?? "",
    vehicleColor: data.vehicleColor ?? "",
    vehicleYear: data.vehicleYear ?? 0,
    status: (data.status as DriverStatus) ?? "pending",
    totalDebt: data.totalDebt ?? 0,
    currentLocation: mapGeoFromFirestore(data.currentLocation),
    totalTrips: data.totalTrips ?? 0,
    createdAt: toRequiredDate(data.createdAt),
    updatedAt: toRequiredDate(data.updatedAt),
  };
}

export function mapDriverToFirestore(input: CreateDriverInput): DocumentData {
  const now = new Date();
  return {
    userId: input.userId,
    licenseNumber: input.licenseNumber,
    vehiclePlate: input.vehiclePlate,
    vehicleModel: input.vehicleModel,
    vehicleColor: input.vehicleColor,
    vehicleYear: input.vehicleYear,
    status: "pending",
    totalDebt: 0,
    currentLocation: null,
    totalTrips: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function mapDriverUpdateToFirestore(data: UpdateDriverInput): DocumentData {
  const { currentLocation, ...rest } = data;
  const payload: DocumentData = { ...rest };
  if (currentLocation !== undefined) {
    payload.currentLocation = currentLocation
      ? mapGeoToFirestore(currentLocation)
      : null;
  }
  return payload;
}
