import type { IRouteRepository } from "@/domain/repositories/route-repository";
import type { CreateRouteInput, Route, UpdateRouteInput } from "@/domain/entities/route";
import { COLLECTIONS } from "@/domain/collections";
import {
  mapRouteFromFirestore,
  mapRouteToFirestore,
} from "@/infrastructure/firebase/mappers/route-mapper";
import {
  BaseFirestoreRepository,
  limit,
  orderBy,
  where,
} from "@/infrastructure/firebase/repositories/base-firestore-repository";

export class FirestoreRouteRepository extends BaseFirestoreRepository implements IRouteRepository {
  async getById(id: string): Promise<Route | null> {
    return this.getDocument(COLLECTIONS.ROUTES, id, mapRouteFromFirestore);
  }

  async create(input: CreateRouteInput): Promise<Route> {
    const id = this.generateId(COLLECTIONS.ROUTES);
    await this.createDocument(COLLECTIONS.ROUTES, id, mapRouteToFirestore(input));
    const created = await this.getById(id);
    if (!created) throw new Error("Failed to create route");
    return created;
  }

  async update(id: string, data: UpdateRouteInput): Promise<Route> {
    await this.updateDocument(COLLECTIONS.ROUTES, id, data);
    const updated = await this.getById(id);
    if (!updated) throw new Error("Failed to update route");
    return updated;
  }

  async listActive(max = 50): Promise<Route[]> {
    return this.queryCollection(COLLECTIONS.ROUTES, mapRouteFromFirestore, [
      where("isActive", "==", true),
      orderBy("name", "asc"),
      limit(max),
    ]);
  }
}
