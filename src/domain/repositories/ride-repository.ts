import type { CreateRideInput, Ride, RideStatus, UpdateRideInput } from "@/domain/entities/ride";

export interface IRideRepository {
  getById(id: string): Promise<Ride | null>;
  create(input: CreateRideInput): Promise<Ride>;
  update(id: string, data: UpdateRideInput): Promise<Ride>;
  listByPassengerUserId(userId: string, status?: RideStatus, limit?: number): Promise<Ride[]>;
  listByDriverUserId(userId: string, status?: RideStatus, limit?: number): Promise<Ride[]>;
  listByStatus(status: RideStatus, limit?: number): Promise<Ride[]>;
}
