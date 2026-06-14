"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Loader2, MapPin, Navigation, User, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseDb } from "@/infrastructure/firebase/config";
import { calculateCommission, formatDzd, safeAmount } from "@/features/drivers/lib/commission";
import {
  driverAr,
  mapFirebaseErrorAr,
} from "@/features/drivers/lib/driver-i18n";
import {
  acceptRideRequest,
  rejectRideRequest,
} from "@/features/drivers/services/driver-dashboard-service";

const RIDE_REQUESTS_COLLECTION = "rideRequests";
const VISIBLE_REQUEST_STATUSES = new Set(["requested", "pending"]);

export type IncomingRideRequest = {
  id: string;
  passengerName: string;
  pickup: string;
  destination: string;
  price: number;
  commission: number;
  currency: string;
};

function getAddress(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "address" in value) {
    return String((value as { address?: unknown }).address ?? "");
  }
  return "";
}

type IncomingRequestsPanelProps = {
  driverId: string;
  disabled?: boolean;
};

export function IncomingRequestsPanel({ driverId, disabled = false }: IncomingRequestsPanelProps) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<IncomingRideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const ridesQuery = query(
      collection(getFirebaseDb(), RIDE_REQUESTS_COLLECTION),
      where("assignedDriverId", "==", driverId)
    );

    return onSnapshot(
      ridesQuery,
      (snapshot) => {
        const nextRequests = snapshot.docs
          .filter((rideDoc) => VISIBLE_REQUEST_STATUSES.has(String(rideDoc.data().status ?? "")))
          .map((rideDoc) => {
            const data = rideDoc.data();
            const price = safeAmount(data.price ?? data.fare ?? 0);

            return {
              id: rideDoc.id,
              passengerName: String(data.passengerName ?? driverAr.passengerDefault),
              pickup: getAddress(data.pickup),
              destination: getAddress(data.dropoff ?? data.destination),
              price,
              commission: calculateCommission(price),
              currency: String(data.currency ?? "DZD"),
            };
          });

        setRequests(nextRequests);
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );
  }, [driverId]);

  async function handleAccept(request: IncomingRideRequest) {
    setActionId(request.id);
    try {
      await acceptRideRequest(request.id, driverId);
      toast({
        title: driverAr.rideAccepted,
        description: driverAr.rideAcceptedDesc(
          request.destination || driverAr.notSpecified
        ),
      });
    } catch (acceptError) {
      toast({
        variant: "destructive",
        title: driverAr.acceptFailed,
        description: mapFirebaseErrorAr(
          acceptError instanceof Error ? acceptError.message : ""
        ),
      });
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(request: IncomingRideRequest) {
    setActionId(request.id);
    try {
      await rejectRideRequest(request.id, driverId);
      toast({
        title: driverAr.rideRejected,
        description: driverAr.rideRejectedDesc,
      });
    } catch (rejectError) {
      toast({
        variant: "destructive",
        title: driverAr.rejectFailed,
        description: mapFirebaseErrorAr(
          rejectError instanceof Error ? rejectError.message : ""
        ),
      });
    } finally {
      setActionId(null);
    }
  }

  return (
    <Card dir="rtl" className="text-right">
      <CardHeader className="text-right">
        <CardTitle>{driverAr.incomingRequests}</CardTitle>
        <CardDescription>{driverAr.incomingRequestsDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {disabled ? (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900">
            {driverAr.incomingDisabled}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">{driverAr.loadingRequests}</p>
        ) : error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {mapFirebaseErrorAr(error)}
          </p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">{driverAr.noRequests}</p>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="rounded-xl border p-4 text-right">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="flex items-center justify-end gap-2 text-sm font-medium">
                    {request.passengerName}
                    <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </p>
                  <p className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {driverAr.pickupLabel}: {request.pickup || driverAr.notSpecified}
                  </p>
                  <p className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                    <Navigation className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {driverAr.destinationLabel}: {request.destination || driverAr.notSpecified}
                  </p>
                </div>

                <div className="shrink-0 rounded-lg bg-primary/10 px-4 py-3 text-right">
                  <p className="text-xs text-muted-foreground">{driverAr.ridePrice}</p>
                  <p className="text-lg font-semibold">{formatDzd(request.price)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {driverAr.commissionPreview}: {formatDzd(request.commission)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  className="rounded-full bg-emerald-600 hover:bg-emerald-500"
                  disabled={disabled || actionId === request.id}
                  onClick={() => void handleAccept(request)}
                >
                  {actionId === request.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {driverAr.accept}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={disabled || actionId === request.id}
                  onClick={() => void handleReject(request)}
                >
                  <X className="h-4 w-4" />
                  {driverAr.reject}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
