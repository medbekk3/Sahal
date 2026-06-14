"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Car, Loader2, MapPin, Navigation, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseDb } from "@/infrastructure/firebase/config";
import { useAuth } from "@/providers/auth-provider";
import { createRideRequest } from "@/services/rideService";

type DriverOption = {
  id: string;
  fullName?: string;
  name?: string;
  displayName?: string;
  email?: string;
  carModel?: string;
  carPlate?: string;
};

type RideRequestFormState = {
  pickup: string;
  dropoff: string;
  passengerName: string;
  passengerPhone: string;
  driverId: string;
};

const initialFormState: RideRequestFormState = {
  pickup: "",
  dropoff: "",
  passengerName: "",
  passengerPhone: "",
  driverId: "",
};

function getDriverName(driver: DriverOption) {
  return driver.fullName ?? driver.name ?? driver.displayName ?? driver.email ?? "Available driver";
}

function getDriverLabel(driver: DriverOption) {
  return getDriverName(driver);
}

export function RideRequestForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState<RideRequestFormState>(initialFormState);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [driversError, setDriversError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDriver = drivers.find((driver) => driver.id === form.driverId) ?? null;

  useEffect(() => {
    const db = getFirebaseDb();
    const driversQuery = query(collection(db, "drivers"), where("status", "==", "online"));

    return onSnapshot(
      driversQuery,
      (snapshot) => {
        setDrivers(
          snapshot.docs.map((driverDoc) => ({
            id: driverDoc.id,
            ...(driverDoc.data() as Omit<DriverOption, "id">),
          }))
        );
        setDriversError(null);
        setDriversLoading(false);
      },
      (error) => {
        console.error("[RideRequestForm] failed to fetch online drivers:", error);
        setDrivers([]);
        setDriversError(error.message);
        setDriversLoading(false);
      }
    );
  }, []);

  function updateField(field: keyof RideRequestFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const pickup = form.pickup.trim();
    const dropoff = form.dropoff.trim();
    const passengerName = form.passengerName.trim();
    const passengerPhone = form.passengerPhone.trim();

    if (!pickup || !dropoff || !passengerName || !passengerPhone || !form.driverId) {
      toast({
        variant: "destructive",
        title: "Missing ride details",
        description: "Please fill in pickup, dropoff, passenger details, and choose a driver.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const passengerId = user?.id ?? user?.email ?? "unknown-passenger";
      const payload = {
        passengerId,
        passengerUserId: passengerId,
        passengerName,
        passengerPhone,
        pickup: { lat: 0, lng: 0, address: pickup },
        dropoff: { lat: 0, lng: 0, address: dropoff },
        destination: dropoff,
        driverId: form.driverId,
        driverUserId: form.driverId,
        assignedDriverId: form.driverId,
        status: "requested",
        distanceMeters: 0,
        durationSeconds: 0,
      };

      console.log("[RideRequestForm] payload:", payload);
      const ride = await createRideRequest(payload);
      console.log("[RideRequestForm] created ride:", ride);

      setForm(initialFormState);
      toast({
        title: "Ride requested",
        description: selectedDriver
          ? `Your request was sent to ${getDriverName(selectedDriver)}.`
          : "Your ride request has been submitted successfully.",
      });
    } catch (error) {
      console.error("[RideRequestForm] Firestore write failed:", error);
      toast({
        variant: "destructive",
        title: "Request failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to submit your ride request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="space-y-2 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Car className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-xl">Request a Ride</CardTitle>
            <CardDescription>Send a new ride request to Firestore.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pickup" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Pickup Location
              </Label>
              <Input
                id="pickup"
                name="pickup"
                value={form.pickup}
                onChange={(event) => updateField("pickup", event.target.value)}
                placeholder="Enter pickup location"
                autoComplete="off"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dropoff" className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Dropoff
              </Label>
              <Input
                id="dropoff"
                name="dropoff"
                value={form.dropoff}
                onChange={(event) => updateField("dropoff", event.target.value)}
                placeholder="Enter dropoff destination"
                autoComplete="off"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passengerName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Passenger Name
            </Label>
            <Input
              id="passengerName"
              name="passengerName"
              value={form.passengerName}
              onChange={(event) => updateField("passengerName", event.target.value)}
              placeholder="Passenger full name"
              autoComplete="name"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passengerPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Passenger Phone
            </Label>
            <Input
              id="passengerPhone"
              name="passengerPhone"
              value={form.passengerPhone}
              onChange={(event) => updateField("passengerPhone", event.target.value)}
              placeholder="06xxxxxxxx"
              autoComplete="tel"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driverId" className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Online Driver
            </Label>
            <select
              id="driverId"
              name="driverId"
              value={form.driverId}
              onChange={(event) => updateField("driverId", event.target.value)}
              disabled={isSubmitting || driversLoading || drivers.length === 0}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">
                {driversLoading
                  ? "Loading drivers..."
                  : drivers.length === 0
                    ? "No online drivers"
                    : "Select driver"}
              </option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {getDriverLabel(driver)}
                  {driver.carModel ? ` - ${driver.carModel}` : ""}
                  {driver.carPlate ? ` (${driver.carPlate})` : ""}
                </option>
              ))}
            </select>
            {selectedDriver ? (
              <div className="flex items-center justify-between rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-sm">
                <div className="text-right">
                  <p className="font-medium text-foreground">{getDriverName(selectedDriver)}</p>
                  <p className="text-xs text-muted-foreground">السائق المختار جاهز لاستقبال الطلب.</p>
                </div>
              </div>
            ) : null}
            {driversError ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {driversError}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting || driversLoading || !form.driverId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Requesting...
              </>
            ) : (
              "Request Ride"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
