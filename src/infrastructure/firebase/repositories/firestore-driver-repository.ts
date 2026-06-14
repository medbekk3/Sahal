import type { IDriverRepository } from "@/domain/repositories/driver-repository";
import type { CreateDriverInput, Driver, DriverStatus, UpdateDriverInput } from "@/domain/entities/driver";
import { COLLECTIONS } from "@/domain/collections";
import {
  mapDriverFromFirestore,
  mapDriverToFirestore,
  mapDriverUpdateToFirestore,
} from "@/infrastructure/firebase/mappers/driver-mapper";
import {
  BaseFirestoreRepository,
  limit,
  orderBy,
  where,
} from "@/infrastructure/firebase/repositories/base-firestore-repository";

export class FirestoreDriverRepository extends BaseFirestoreRepository implements IDriverRepository {
  async getById(id: string): Promise<Driver | null> {
    return this.getDocument(COLLECTIONS.DRIVERS, id, mapDriverFromFirestore);
  }

  async getByUserId(userId: string): Promise<Driver | null> {
    return this.getById(userId);
  }

  async create(input: CreateDriverInput): Promise<Driver> {
    await this.createDocument(COLLECTIONS.DRIVERS, input.userId, mapDriverToFirestore(input));
    const created = await this.getById(input.userId);
    if (!created) throw new Error("Failed to create driver profile");
    return created;
  }

  async update(id: string, data: UpdateDriverInput): Promise<Driver> {
    await this.updateDocument(COLLECTIONS.DRIVERS, id, mapDriverUpdateToFirestore(data));
    const updated = await this.getById(id);
    if (!updated) throw new Error("Failed to update driver profile");
    return updated;
  }

  async listByStatus(status: DriverStatus, max = 50): Promise<Driver[]> {
    return this.queryCollection(COLLECTIONS.DRIVERS, mapDriverFromFirestore, [
      where("status", "==", status),
      orderBy("updatedAt", "desc"),
      limit(max),
    ]);
  }
}
