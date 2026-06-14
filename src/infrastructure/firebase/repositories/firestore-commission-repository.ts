import type { ICommissionRepository } from "@/domain/repositories/commission-repository";
import type {
  Commission,
  CommissionStatus,
  CreateCommissionInput,
  UpdateCommissionInput,
} from "@/domain/entities/commission";
import { COLLECTIONS } from "@/domain/collections";
import {
  mapCommissionFromFirestore,
  mapCommissionToFirestore,
} from "@/infrastructure/firebase/mappers/commission-mapper";
import {
  BaseFirestoreRepository,
  limit,
  orderBy,
  where,
} from "@/infrastructure/firebase/repositories/base-firestore-repository";

export class FirestoreCommissionRepository
  extends BaseFirestoreRepository
  implements ICommissionRepository
{
  async getById(id: string): Promise<Commission | null> {
    return this.getDocument(COLLECTIONS.COMMISSIONS, id, mapCommissionFromFirestore);
  }

  async create(input: CreateCommissionInput): Promise<Commission> {
    const id = this.generateId(COLLECTIONS.COMMISSIONS);
    await this.createDocument(COLLECTIONS.COMMISSIONS, id, mapCommissionToFirestore(input));
    const created = await this.getById(id);
    if (!created) throw new Error("Failed to create commission");
    return created;
  }

  async update(id: string, data: UpdateCommissionInput): Promise<Commission> {
    await this.updateDocument(COLLECTIONS.COMMISSIONS, id, data);
    const updated = await this.getById(id);
    if (!updated) throw new Error("Failed to update commission");
    return updated;
  }

  async listByRideId(rideId: string): Promise<Commission[]> {
    return this.queryCollection(COLLECTIONS.COMMISSIONS, mapCommissionFromFirestore, [
      where("rideId", "==", rideId),
      orderBy("createdAt", "desc"),
    ]);
  }

  async listByDriverUserId(
    userId: string,
    status?: CommissionStatus,
    max = 20
  ): Promise<Commission[]> {
    const constraints = [
      where("driverUserId", "==", userId),
      ...(status ? [where("status", "==", status)] : []),
      orderBy("createdAt", "desc"),
      limit(max),
    ];
    return this.queryCollection(COLLECTIONS.COMMISSIONS, mapCommissionFromFirestore, constraints);
  }

  async listByPaymentId(paymentId: string): Promise<Commission[]> {
    return this.queryCollection(COLLECTIONS.COMMISSIONS, mapCommissionFromFirestore, [
      where("paymentId", "==", paymentId),
      orderBy("createdAt", "desc"),
    ]);
  }
}
