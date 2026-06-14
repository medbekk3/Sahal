import type { IPaymentRepository } from "@/domain/repositories/payment-repository";
import type {
  CreatePaymentInput,
  Payment,
  PaymentStatus,
  UpdatePaymentInput,
} from "@/domain/entities/payment";
import { COLLECTIONS } from "@/domain/collections";
import {
  mapPaymentFromFirestore,
  mapPaymentToFirestore,
} from "@/infrastructure/firebase/mappers/payment-mapper";
import {
  BaseFirestoreRepository,
  limit,
  orderBy,
  where,
} from "@/infrastructure/firebase/repositories/base-firestore-repository";

export class FirestorePaymentRepository
  extends BaseFirestoreRepository
  implements IPaymentRepository
{
  async getById(id: string): Promise<Payment | null> {
    return this.getDocument(COLLECTIONS.PAYMENTS, id, mapPaymentFromFirestore);
  }

  async getByRideId(rideId: string): Promise<Payment | null> {
    const results = await this.queryCollection(COLLECTIONS.PAYMENTS, mapPaymentFromFirestore, [
      where("rideId", "==", rideId),
      limit(1),
    ]);
    return results[0] ?? null;
  }

  async create(input: CreatePaymentInput): Promise<Payment> {
    const id = this.generateId(COLLECTIONS.PAYMENTS);
    await this.createDocument(COLLECTIONS.PAYMENTS, id, mapPaymentToFirestore(input));
    const created = await this.getById(id);
    if (!created) throw new Error("Failed to create payment");
    return created;
  }

  async update(id: string, data: UpdatePaymentInput): Promise<Payment> {
    await this.updateDocument(COLLECTIONS.PAYMENTS, id, data);
    const updated = await this.getById(id);
    if (!updated) throw new Error("Failed to update payment");
    return updated;
  }

  async listByPassengerUserId(
    userId: string,
    status?: PaymentStatus,
    max = 20
  ): Promise<Payment[]> {
    const constraints = [
      where("passengerUserId", "==", userId),
      ...(status ? [where("status", "==", status)] : []),
      orderBy("createdAt", "desc"),
      limit(max),
    ];
    return this.queryCollection(COLLECTIONS.PAYMENTS, mapPaymentFromFirestore, constraints);
  }

  async listByDriverUserId(
    userId: string,
    status?: PaymentStatus,
    max = 20
  ): Promise<Payment[]> {
    const constraints = [
      where("driverUserId", "==", userId),
      ...(status ? [where("status", "==", status)] : []),
      orderBy("createdAt", "desc"),
      limit(max),
    ];
    return this.queryCollection(COLLECTIONS.PAYMENTS, mapPaymentFromFirestore, constraints);
  }
}
