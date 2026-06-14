import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import type { IUserRepository } from "@/domain/repositories/user-repository";
import type {
  CreateUserProfileInput,
  UpdateUserProfileInput,
  UserProfile,
} from "@/domain/entities/user";
import { COLLECTIONS } from "@/domain/collections";
import {
  mapUserFromFirestore,
  mapUserToFirestore,
} from "@/infrastructure/firebase/mappers/user-mapper";
import { BaseFirestoreRepository } from "@/infrastructure/firebase/repositories/base-firestore-repository";

export class FirestoreUserRepository extends BaseFirestoreRepository implements IUserRepository {
  async getById(id: string): Promise<UserProfile | null> {
    return this.getDocument(COLLECTIONS.USERS, id, mapUserFromFirestore);
  }

  async create(input: CreateUserProfileInput): Promise<UserProfile> {
    await this.createDocument(COLLECTIONS.USERS, input.id, mapUserToFirestore(input));
    const created = await this.getById(input.id);
    if (!created) throw new Error("Failed to create user profile");
    return created;
  }

  async update(id: string, data: UpdateUserProfileInput): Promise<UserProfile> {
    await updateDoc(doc(this.db, COLLECTIONS.USERS, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    const updated = await this.getById(id);
    if (!updated) throw new Error("Failed to update user profile");
    return updated;
  }
}
