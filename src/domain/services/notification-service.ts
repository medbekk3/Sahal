export interface INotificationService {
  requestPermission(): Promise<NotificationPermission>;
  getToken(): Promise<string | null>;
  onMessage(callback: (payload: unknown) => void): () => void;
}
