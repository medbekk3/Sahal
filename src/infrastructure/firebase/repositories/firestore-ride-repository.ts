import type { IRideRepository } from "@/domain/repositories/ride-repository";
import type { CreateRideInput, Ride, RideStatus, UpdateRideInput } from "@/domain/entities/ride";
import { COLLECTIONS } from "@/domain/collections";
import {
  mapRideFromFirestore,
  mapRideToFirestore,
} from "@/infrastructure/firebase/mappers/ride-mapper";
import {
  BaseFirestoreRepository,
  limit,
  orderBy,
  where,
} from "@/infrastructure/firebase/repositories/base-firestore-repository";

export class FirestoreRideRepository extends BaseFirestoreRepository implements IRideRepository {
  async getById(id: string): Promise<Ride | null> {
    return this.getDocument(COLLECTIONS.RIDES, id, mapRideFromFirestore);
  }

  async create(input: CreateRideInput): Promise<Ride> {
    const id = this.generateId(COLLECTIONS.RIDES);
    await this.createDocument(COLLECTIONS.RIDES, id, mapRideToFirestore(input));
    const created = await this.getById(id);
    if (!created) throw new Error("Failed to create ride");
    return created;
  }

  async update(id: string, data: UpdateRideInput): Promise<Ride> {
    await this.updateDocument(COLLECTIONS.RIDES, id, data);
    const updated = await this.getById(id);
    if (!updated) throw new Error("Failed to update ride");
    return updated;
  }

  async listByPassengerUserId(
    userId: string,
    status?: RideStatus,
    max = 20
  ): Promise<Ride[]> {
    const constraints = [
      where("passengerUserId", "==", userId),
      ...(status ? [where("status", "==", status)] : []),
      orderBy("createdAt", "desc"),
      limit(max),
    ];
    return this.queryCollection(COLLECTIONS.RIDES, mapRideFromFirestore, constraints);
  }

  async listByDriverUserId(
    userId: string,
    status?: RideStatus,
    max = 20
  ): Promise<Ride[]> {
    const constraints = [
      where("driverUserId", "==", userId),
      ...(status ? [where("status", "==", status)] : []),
      orderBy("createdAt", "desc"),
      limit(max),
    ];
    return this.queryCollection(COLLECTIONS.RIDES, mapRideFromFirestore, constraints);
  }

  async listByStatus(status: RideStatus, max = 50): Promise<Ride[]> {
    return this.queryCollection(COLLECTIONS.RIDES, mapRideFromFirestore, [
      where("status", "==", status),
      orderBy("requestedAt", "desc"),
      limit(max),
    ]);
  }
}
