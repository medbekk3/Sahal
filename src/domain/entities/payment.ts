import type { Currency } from "@/domain/entities/shared";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";
export type PaymentMethod = "card" | "cash" | "wallet";

export interface Payment {
  id: string;
  /** FK → rides.id */
  rideId: string;
  passengerUserId: string;
  driverUserId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  method: PaymentMethod;
  providerRef: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  rideId: string;
  passengerUserId: string;
  driverUserId: string;
  amount: number;
  currency?: Currency;
  method: PaymentMethod;
  providerRef?: string | null;
}

export interface UpdatePaymentInput {
  status?: PaymentStatus;
  providerRef?: string | null;
  paidAt?: Date | null;
}
