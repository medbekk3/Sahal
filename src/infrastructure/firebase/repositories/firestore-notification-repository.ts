import {
  writeBatch,
  updateDoc,
  doc,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";
import type { INotificationRepository } from "@/domain/repositories/notification-repository";
import type { AppNotification, CreateNotificationInput } from "@/domain/entities/notification";
import { COLLECTIONS } from "@/domain/collections";
import {
  mapNotificationFromFirestore,
  mapNotificationToFirestore,
} from "@/infrastructure/firebase/mappers/notification-mapper";
import {
  BaseFirestoreRepository,
  limit,
  orderBy,
  where as whereConstraint,
} from "@/infrastructure/firebase/repositories/base-firestore-repository";

export class FirestoreNotificationRepository
  extends BaseFirestoreRepository
  implements INotificationRepository
{
  async getById(id: string): Promise<AppNotification | null> {
    return this.getDocument(COLLECTIONS.NOTIFICATIONS, id, mapNotificationFromFirestore);
  }

  async create(input: CreateNotificationInput): Promise<AppNotification> {
    const id = this.generateId(COLLECTIONS.NOTIFICATIONS);
    await this.createDocument(COLLECTIONS.NOTIFICATIONS, id, mapNotificationToFirestore(input));
    const created = await this.getById(id);
    if (!created) throw new Error("Failed to create notification");
    return created;
  }

  async listByUserId(userId: string, unreadOnly = false, max = 30): Promise<AppNotification[]> {
    const constraints = [
      whereConstraint("userId", "==", userId),
      ...(unreadOnly ? [whereConstraint("read", "==", false)] : []),
      orderBy("createdAt", "desc"),
      limit(max),
    ];
    return this.queryCollection(
      COLLECTIONS.NOTIFICATIONS,
      mapNotificationFromFirestore,
      constraints
    );
  }

  async markAsRead(id: string): Promise<AppNotification> {
    await updateDoc(doc(this.db, COLLECTIONS.NOTIFICATIONS, id), { read: true });
    const updated = await this.getById(id);
    if (!updated) throw new Error("Failed to mark notification as read");
    return updated;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(this.db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(this.db);
    snapshot.docs.forEach((d) => {
      batch.update(d.ref, { read: true });
    });
    await batch.commit();
  }
}
