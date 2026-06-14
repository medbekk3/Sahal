import type { DocumentData } from "firebase/firestore";
import type {
  Commission,
  CommissionStatus,
  CreateCommissionInput,
} from "@/domain/entities/commission";
import type { Currency } from "@/domain/entities/shared";
import { toRequiredDate } from "@/infrastructure/firebase/utils/firestore-utils";

export function mapCommissionFromFirestore(id: string, data: DocumentData): Commission {
  return {
    id,
    rideId: data.rideId ?? "",
    paymentId: data.paymentId ?? "",
    driverUserId: data.driverUserId ?? "",
    amount: data.amount ?? 0,
    rate: data.rate ?? 0,
    currency: (data.currency as Currency) ?? "SAR",
    status: (data.status as CommissionStatus) ?? "pending",
    createdAt: toRequiredDate(data.createdAt),
    updatedAt: toRequiredDate(data.updatedAt),
  };
}

export function mapCommissionToFirestore(input: CreateCommissionInput): DocumentData {
  const now = new Date();
  return {
    rideId: input.rideId,
    paymentId: input.paymentId,
    driverUserId: input.driverUserId,
    amount: input.amount,
    rate: input.rate,
    currency: input.currency ?? "SAR",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
}
