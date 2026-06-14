import type { IPassengerRepository } from "@/domain/repositories/passenger-repository";
import type {
  CreatePassengerInput,
  Passenger,
  UpdatePassengerInput,
} from "@/domain/entities/passenger";
import { COLLECTIONS } from "@/domain/collections";
import {
  mapPassengerFromFirestore,
  mapPassengerToFirestore,
} from "@/infrastructure/firebase/mappers/passenger-mapper";
import { BaseFirestoreRepository } from "@/infrastructure/firebase/repositories/base-firestore-repository";

export class FirestorePassengerRepository
  extends BaseFirestoreRepository
  implements IPassengerRepository
{
  async getById(id: string): Promise<Passenger | null> {
    return this.getDocument(COLLECTIONS.PASSENGERS, id, mapPassengerFromFirestore);
  }

  async getByUserId(userId: string): Promise<Passenger | null> {
    return this.getById(userId);
  }

  async create(input: CreatePassengerInput): Promise<Passenger> {
    await this.createDocument(
      COLLECTIONS.PASSENGERS,
      input.userId,
      mapPassengerToFirestore(input)
    );
    const created = await this.getById(input.userId);
    if (!created) throw new Error("Failed to create passenger profile");
    return created;
  }

  async update(id: string, data: UpdatePassengerInput): Promise<Passenger> {
    await this.updateDocument(COLLECTIONS.PASSENGERS, id, data);
    const updated = await this.getById(id);
    if (!updated) throw new Error("Failed to update passenger profile");
    return updated;
  }
}
