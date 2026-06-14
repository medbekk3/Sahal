"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { MapPin, Navigation, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirebaseDb } from "@/infrastructure/firebase/config";

type IncomingRideRequest = {
  id: string;
  passengerName: string;
  pickup: string;
  destination: string;
  price: number;
  currency: string;
};

function getAddress(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "address" in value) {
    return String((value as { address?: unknown }).address ?? "");
  }

  return "";
}

function getTimestampMillis(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value.toDate() as Date).getTime();
  }
  if (value instanceof Date) return value.getTime();
  return 0;
}

export function IncomingRideRequests() {
  const [requests, setRequests] = useState<IncomingRideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(
        collection(getFirebaseDb(), "rideRequests"),
        (snapshot) => {
          setRequests(
            snapshot.docs
              .filter((doc) => ["pending", "requested"].includes(String(doc.data().status ?? "")))
              .sort((left, right) => {
                const leftData = left.data();
                const rightData = right.data();
                const leftTime = getTimestampMillis(leftData.requestedAt ?? leftData.createdAt);
                const rightTime = getTimestampMillis(rightData.requestedAt ?? rightData.createdAt);
                return rightTime - leftTime;
              })
              .map((doc) => {
                const data = doc.data();

                return {
                  id: doc.id,
                  passengerName: String(data.passengerName ?? "Passenger"),
                  pickup: getAddress(data.pickup),
                  destination: getAddress(data.dropoff ?? data.destination),
                  price: Number(data.price ?? 0),
                  currency: String(data.currency ?? "DZD"),
                };
              })
          );
          setError(null);
          setLoading(false);
        },
        (snapshotError) => {
          setError(snapshotError.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (setupError) {
      setError(setupError instanceof Error ? setupError.message : "Unable to load ride requests.");
      setLoading(false);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incoming Requests</CardTitle>
        <CardDescription>New fixed-fare rides available for drivers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading incoming requests...</p>
        ) : error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No incoming requests right now.</p>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="rounded-md border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {request.passengerName}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    From: {request.pickup || "Pickup not specified"}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                    Destination: {request.destination || "Destination not specified"}
                  </p>
                </div>
                <div className="shrink-0 rounded-md bg-primary/10 px-3 py-2 text-end">
                  <p className="text-xs text-muted-foreground">السعر</p>
                  <p className="font-semibold">
                    {request.price.toLocaleString()} دج
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
