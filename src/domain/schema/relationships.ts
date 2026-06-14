/**
 * SAHAL Firestore schema — entity relationships
 *
 * users (1) ──< (0..1) drivers       [drivers.id = users.id, drivers.userId → users.id]
 * users (1) ──< (0..1) passengers    [passengers.id = users.id, passengers.userId → users.id]
 *
 * passengers (1) ──< (*) rides       [rides.passengerId → passengers.id]
 * users (1) ──< (*) rides            [rides.passengerUserId → users.id (denormalized)]
 *
 * drivers (1) ──< (*) rides          [rides.driverId → drivers.id]
 * users (1) ──< (*) rides            [rides.driverUserId → users.id (denormalized)]
 *
 * routes (1) ──< (*) rides           [rides.routeId → routes.id (optional)]
 *
 * rides (1) ──< (0..1) payments      [payments.rideId → rides.id]
 * users (1) ──< (*) payments         [payments.passengerUserId / driverUserId → users.id]
 *
 * rides (1) ──< (*) commissions      [commissions.rideId → rides.id]
 * payments (1) ──< (*) commissions   [commissions.paymentId → payments.id]
 * users (1) ──< (*) commissions      [commissions.driverUserId → users.id]
 *
 * users (1) ──< (*) notifications    [notifications.userId → users.id]
 */

export const SCHEMA_VERSION = "1.0.0";

export const ENTITY_RELATIONSHIPS = {
  users: {
    drivers: { type: "one-to-one", foreignKey: "userId", docIdMatchesUser: true },
    passengers: { type: "one-to-one", foreignKey: "userId", docIdMatchesUser: true },
    rides: { type: "one-to-many", foreignKeys: ["passengerUserId", "driverUserId"] },
    payments: { type: "one-to-many", foreignKeys: ["passengerUserId", "driverUserId"] },
    commissions: { type: "one-to-many", foreignKey: "driverUserId" },
    notifications: { type: "one-to-many", foreignKey: "userId" },
  },
  rides: {
    payments: { type: "one-to-one", foreignKey: "rideId" },
    commissions: { type: "one-to-many", foreignKey: "rideId" },
    routes: { type: "many-to-one", foreignKey: "routeId", optional: true },
  },
  payments: {
    commissions: { type: "one-to-many", foreignKey: "paymentId" },
  },
} as const;
