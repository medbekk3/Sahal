/** Firestore collection names — single source of truth */
export const COLLECTIONS = {
  USERS: "users",
  DRIVERS: "drivers",
  PASSENGERS: "passengers",
  RIDES: "rideRequests",
  ROUTES: "routes",
  COMMISSIONS: "commissions",
  PAYMENTS: "payments",
  NOTIFICATIONS: "notifications",
  FCM_TOKENS: "fcmTokens",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
