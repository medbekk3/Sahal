import type { DocumentData } from "firebase/firestore";
import type {
  CreatePaymentInput,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "@/domain/entities/payment";
import type { Currency } from "@/domain/entities/shared";
import { toDate, toRequiredDate } from "@/infrastructure/firebase/utils/firestore-utils";

export function mapPaymentFromFirestore(id: string, data: DocumentData): Payment {
  return {
    id,
    rideId: data.rideId ?? "",
    passengerUserId: data.passengerUserId ?? "",
    driverUserId: data.driverUserId ?? "",
    amount: data.amount ?? 0,
    currency: (data.currency as Currency) ?? "SAR",
    status: (data.status as PaymentStatus) ?? "pending",
    method: (data.method as PaymentMethod) ?? "cash",
    providerRef: data.providerRef ?? null,
    paidAt: toDate(data.paidAt),
    createdAt: toRequiredDate(data.createdAt),
    updatedAt: toRequiredDate(data.updatedAt),
  };
}

export function mapPaymentToFirestore(input: CreatePaymentInput): DocumentData {
  const now = new Date();
  return {
    rideId: input.rideId,
    passengerUserId: input.passengerUserId,
    driverUserId: input.driverUserId,
    amount: input.amount,
    currency: input.currency ?? "SAR",
    status: "pending",
    method: input.method,
    providerRef: input.providerRef ?? null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
