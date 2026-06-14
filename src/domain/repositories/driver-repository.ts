import type { CreateDriverInput, Driver, DriverStatus, UpdateDriverInput } from "@/domain/entities/driver";

export interface IDriverRepository {
  getById(id: string): Promise<Driver | null>;
  getByUserId(userId: string): Promise<Driver | null>;
  create(input: CreateDriverInput): Promise<Driver>;
  update(id: string, data: UpdateDriverInput): Promise<Driver>;
  listByStatus(status: DriverStatus, limit?: number): Promise<Driver[]>;
}
