import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseDb } from "@/infrastructure/firebase/config";

export abstract class BaseFirestoreRepository {
  protected get db() {
    return getFirebaseDb();
  }

  protected async getDocument<T>(
    collectionName: string,
    id: string,
    mapper: (id: string, data: DocumentData) => T
  ): Promise<T | null> {
    const snapshot = await getDoc(doc(this.db, collectionName, id));
    if (!snapshot.exists()) return null;
    return mapper(snapshot.id, snapshot.data());
  }

  protected async queryCollection<T>(
    collectionName: string,
    mapper: (id: string, data: DocumentData) => T,
    constraints: QueryConstraint[]
  ): Promise<T[]> {
    const q = query(collection(this.db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapper(d.id, d.data()));
  }

  protected async createDocument(
    collectionName: string,
    id: string,
    data: DocumentData
  ): Promise<void> {
    await setDoc(doc(this.db, collectionName, id), data);
  }

  protected async updateDocument(
    collectionName: string,
    id: string,
    data: DocumentData
  ): Promise<void> {
    await updateDoc(doc(this.db, collectionName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  protected generateId(collectionName: string): string {
    return doc(collection(this.db, collectionName)).id;
  }
}

export { limit, orderBy, where };
