import { getToken, onMessage } from "firebase/messaging";
import type { INotificationService } from "@/domain/services/notification-service";
import { getFirebaseMessaging } from "@/infrastructure/firebase/config";

export class FirebaseNotificationService implements INotificationService {
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    return Notification.requestPermission();
  }

  async getToken(): Promise<string | null> {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      return getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    } catch (error) {
      console.error("Failed to get FCM token:", error);
      return null;
    }
  }

  onMessage(callback: (payload: unknown) => void): () => void {
    let unsubscribe: (() => void) | undefined;

    void getFirebaseMessaging().then((messaging) => {
      if (!messaging) return;
      unsubscribe = onMessage(messaging, callback);
    });

    return () => unsubscribe?.();
  }
}
