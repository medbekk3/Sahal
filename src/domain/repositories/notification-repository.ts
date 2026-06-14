import type { AppNotification, CreateNotificationInput } from "@/domain/entities/notification";

export interface INotificationRepository {
  getById(id: string): Promise<AppNotification | null>;
  create(input: CreateNotificationInput): Promise<AppNotification>;
  listByUserId(userId: string, unreadOnly?: boolean, limit?: number): Promise<AppNotification[]>;
  markAsRead(id: string): Promise<AppNotification>;
  markAllAsRead(userId: string): Promise<void>;
}
