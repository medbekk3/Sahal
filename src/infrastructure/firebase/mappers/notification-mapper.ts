import type { DocumentData } from "firebase/firestore";
import type {
  AppNotification,
  CreateNotificationInput,
  NotificationType,
} from "@/domain/entities/notification";
import { toRequiredDate } from "@/infrastructure/firebase/utils/firestore-utils";

export function mapNotificationFromFirestore(id: string, data: DocumentData): AppNotification {
  return {
    id,
    userId: data.userId ?? "",
    type: (data.type as NotificationType) ?? "system",
    title: data.title ?? "",
    body: data.body ?? "",
    data: (data.data as Record<string, string>) ?? {},
    read: data.read ?? false,
    createdAt: toRequiredDate(data.createdAt),
  };
}

export function mapNotificationToFirestore(input: CreateNotificationInput): DocumentData {
  return {
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data ?? {},
    read: false,
    createdAt: new Date(),
  };
}
