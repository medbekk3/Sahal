import type { DocumentData } from "firebase/firestore";
import type { CreatePassengerInput, Passenger } from "@/domain/entities/passenger";
import { toRequiredDate } from "@/infrastructure/firebase/utils/firestore-utils";

export function mapPassengerFromFirestore(id: string, data: DocumentData): Passenger {
  return {
    id,
    userId: data.userId ?? id,
    defaultPickupAddress: data.defaultPickupAddress ?? null,
    totalRides: data.totalRides ?? 0,
    createdAt: toRequiredDate(data.createdAt),
    updatedAt: toRequiredDate(data.updatedAt),
  };
}

export function mapPassengerToFirestore(input: CreatePassengerInput): DocumentData {
  const now = new Date();
  return {
    userId: input.userId,
    defaultPickupAddress: input.defaultPickupAddress ?? null,
    totalRides: 0,
    createdAt: now,
    updatedAt: now,
  };
}
