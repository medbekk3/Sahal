"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Car, Loader2, MapPin, Navigation, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createRideRequest } from "@/services/rideService";
import { getFirebaseDb } from "@/infrastructure/firebase/config";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

type DriverRecord = {
  id: string;
  fullName?: string;
  name?: string;
  displayName?: string;
  email?: string;
  carModel?: string;
  carPlate?: string;
  status?: string;
};

function getDriverName(driver: DriverRecord) {
  return driver.fullName ?? driver.name ?? driver.displayName ?? driver.email ?? "سائق متاح";
}

function getDriverLabel(driver: DriverRecord) {
  return getDriverName(driver);
}

export default function RideRequestPage() {
  const db = useMemo(() => getFirebaseDb(), []);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [driversError, setDriversError] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId) ?? null;

  useEffect(() => {
    const driversQuery = query(collection(db, "drivers"), where("status", "==", "online"));

    return onSnapshot(
      driversQuery,
      (snapshot) => {
        const onlineDrivers = snapshot.docs.map((driverDoc) => ({
          id: driverDoc.id,
          ...(driverDoc.data() as Omit<DriverRecord, "id">),
        }));

        console.log("[RideRequestPage] online drivers:", onlineDrivers);
        setDrivers(onlineDrivers);
        setDriversError(null);
        setDriversLoading(false);
      },
      (error) => {
        console.error("[RideRequestPage] failed to fetch online drivers:", error);
        setDrivers([]);
        setDriversError(error.message);
        setDriversLoading(false);
      }
    );
  }, [db]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const pickup = pickupLocation.trim();
    const dropoff = dropoffLocation.trim();
    const passengerId = user?.id ?? user?.email ?? "unknown-passenger";

    if (!pickup || !dropoff || !selectedDriverId) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "يرجى تحديد نقطة الانطلاق والوجهة واختيار سائق متاح.",
      });
      return;
    }

    const payload = {
      passengerId,
      passengerUserId: passengerId,
      passengerName: user?.displayName ?? user?.email ?? "Passenger",
      pickup: { lat: 0, lng: 0, address: pickup },
      dropoff: { lat: 0, lng: 0, address: dropoff },
      fare: 250,
      price: 250,
      currency: "DZD",
      status: "requested",
      driverId: selectedDriverId,
      driverUserId: selectedDriverId,
      assignedDriverId: selectedDriverId,
      distanceMeters: 0,
      durationSeconds: 0,
    };

    console.groupCollapsed("[RideRequestPage] submit ride request");
    console.log("selected driver:", selectedDriver);
    console.log("payload:", payload);
    console.groupEnd();

    setSubmitting(true);
    try {
      const ride = await createRideRequest(payload);
      toast({
        title: "تم إرسال الطلب",
        description: `تم إرسال طلبك إلى ${selectedDriver ? getDriverName(selectedDriver) : "السائق"}.`,
      });
      router.push(`/ride/${ride.id}`);
    } catch (error) {
      console.error("[RideRequestPage] createRideRequest failed:", error);
      toast({
        variant: "destructive",
        title: "تعذر إرسال الطلب",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الطلب.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 px-4 py-8 text-right text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-blue-200">Sahal</p>
          <h1 className="text-3xl font-semibold">طلب رحلة جديدة</h1>
        </div>

        <Card className="border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-md">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>تفاصيل الرحلة</span>
              <Car className="h-5 w-5 text-blue-300" aria-hidden="true" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="flex items-center justify-end gap-2 text-sm font-medium text-slate-100">
                    نقطة الانطلاق
                    <MapPin className="h-4 w-4 text-blue-300" aria-hidden="true" />
                  </span>
                  <input
                    value={pickupLocation}
                    onChange={(event) => setPickupLocation(event.target.value)}
                    className="h-12 w-full rounded-xl border border-white/15 bg-slate-950/50 px-4 text-right text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                    placeholder="مثال: وسط المدينة"
                    disabled={submitting}
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="flex items-center justify-end gap-2 text-sm font-medium text-slate-100">
                    الوجهة
                    <Navigation className="h-4 w-4 text-blue-300" aria-hidden="true" />
                  </span>
                  <input
                    value={dropoffLocation}
                    onChange={(event) => setDropoffLocation(event.target.value)}
                    className="h-12 w-full rounded-xl border border-white/15 bg-slate-950/50 px-4 text-right text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                    placeholder="مثال: محطة القطار"
                    disabled={submitting}
                    required
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="flex items-center justify-end gap-2 text-sm font-medium text-slate-100">
                  السائق المتاح
                  <UserRound className="h-4 w-4 text-blue-300" aria-hidden="true" />
                </span>
                <select
                  value={selectedDriverId}
                  onChange={(event) => setSelectedDriverId(event.target.value)}
                  className="h-12 w-full rounded-xl border border-white/15 bg-slate-950/50 px-4 text-right text-sm text-white outline-none transition focus:border-blue-400 disabled:opacity-60"
                  disabled={submitting || driversLoading || drivers.length === 0}
                  required
                >
                  <option value="" className="text-slate-900">
                    {driversLoading
                      ? "جاري تحميل السائقين..."
                      : drivers.length === 0
                        ? "لا يوجد سائقون متاحون الآن"
                        : "اختر سائقاً"}
                  </option>
                  {drivers.map((driver) => (
                <option key={driver.id} value={driver.id} className="text-slate-900">
                      {getDriverLabel(driver)}
                      {driver.carModel ? ` - ${driver.carModel}` : ""}
                      {driver.carPlate ? ` (${driver.carPlate})` : ""}
                </option>
              ))}
                </select>
              </label>

              {driversError ? (
                <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {driversError}
                </p>
              ) : selectedDriver ? (
                <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span>{getDriverName(selectedDriver)} جاهز لاستقبال طلبك.</span>
                  </div>
                </div>
              ) : null}

              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-blue-600 text-white shadow-lg shadow-blue-950/30 hover:bg-blue-500"
                disabled={submitting || driversLoading || !selectedDriverId}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    جاري الإرسال...
                  </>
                ) : (
                  "تأكيد الطلب"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
