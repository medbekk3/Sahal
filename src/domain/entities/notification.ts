export type NotificationType = "ride_update" | "payment" | "promo" | "system";

export interface AppNotification {
  id: string;
  /** FK → users.id */
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
  read: boolean;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}
