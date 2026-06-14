import type {
  Commission,
  CommissionStatus,
  CreateCommissionInput,
  UpdateCommissionInput,
} from "@/domain/entities/commission";

export interface ICommissionRepository {
  getById(id: string): Promise<Commission | null>;
  create(input: CreateCommissionInput): Promise<Commission>;
  update(id: string, data: UpdateCommissionInput): Promise<Commission>;
  listByRideId(rideId: string): Promise<Commission[]>;
  listByDriverUserId(userId: string, status?: CommissionStatus, limit?: number): Promise<Commission[]>;
  listByPaymentId(paymentId: string): Promise<Commission[]>;
}
