import type {
  CreatePaymentInput,
  Payment,
  PaymentStatus,
  UpdatePaymentInput,
} from "@/domain/entities/payment";

export interface IPaymentRepository {
  getById(id: string): Promise<Payment | null>;
  getByRideId(rideId: string): Promise<Payment | null>;
  create(input: CreatePaymentInput): Promise<Payment>;
  update(id: string, data: UpdatePaymentInput): Promise<Payment>;
  listByPassengerUserId(userId: string, status?: PaymentStatus, limit?: number): Promise<Payment[]>;
  listByDriverUserId(userId: string, status?: PaymentStatus, limit?: number): Promise<Payment[]>;
}
