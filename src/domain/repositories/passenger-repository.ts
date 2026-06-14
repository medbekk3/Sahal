import type {
  CreatePassengerInput,
  Passenger,
  UpdatePassengerInput,
} from "@/domain/entities/passenger";

export interface IPassengerRepository {
  getById(id: string): Promise<Passenger | null>;
  getByUserId(userId: string): Promise<Passenger | null>;
  create(input: CreatePassengerInput): Promise<Passenger>;
  update(id: string, data: UpdatePassengerInput): Promise<Passenger>;
}
