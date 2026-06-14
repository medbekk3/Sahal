import type { Currency } from "@/domain/entities/shared";

export type CommissionStatus = "pending" | "collected" | "paid_out";

export interface Commission {
  id: string;
  /** FK → rides.id */
  rideId: string;
  /** FK → payments.id */
  paymentId: string;
  driverUserId: string;
  amount: number;
  rate: number;
  currency: Currency;
  status: CommissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommissionInput {
  rideId: string;
  paymentId: string;
  driverUserId: string;
  amount: number;
  rate: number;
  currency?: Currency;
}

export interface UpdateCommissionInput {
  status?: CommissionStatus;
}
