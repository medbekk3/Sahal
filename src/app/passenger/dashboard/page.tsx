"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Car,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Navigation,
  LogOut,
  Phone,
  PencilLine,
  UserRound,
  X,
} from "lucide-react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { useFareRates } from "@/features/fares/hooks/use-fare-rates";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseDb } from "@/infrastructure/firebase/config";
import { createRideRequest } from "@/services/rideService";
import type { RideResult } from "@/services/rideService";

type DriverProfile = {
  id: string;
  fullName: string;
  phone: string;
  carModel: string;
  carPlateNumber: string;
  status: string;
};

type DriverOption = {
  id: string;
  fullName?: string;
  name?: string;
  displayName?: string;
  email?: string;
  carModel?: string;
  carPlate?: string;
};

const STATUS_LABELS: Record<string, string> = {
  requested: "بانتظار السائق",
  accepted: "تم قبول الرحلة",
  arriving: "السائق في الطريق",
  in_progress: "الرحلة جارية",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

const ACTIVE_STATUSES = new Set(["requested", "accepted", "arriving", "in_progress"]);

function getDriverName(driver: DriverOption) {
  return driver.fullName ?? driver.name ?? driver.displayName ?? driver.email ?? "سائق متاح";
}

function getDriverLabel(driver: DriverOption) {
  return getDriverName(driver);
}

export default function PassengerDashboardPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { fromOptions, getToOptions, getRate } = useFareRates();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [passengerName, setPassengerName] = useState(user?.displayName ?? "");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [activeRide, setActiveRide] = useState<RideResult | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [acceptedModalOpen, setAcceptedModalOpen] = useState(false);

  const lastNotifiedRideIdRef = useRef<string | null>(null);
  const lastStatusRef = useRef<string | null>(null);

  const rate = getRate(pickup, destination);
  const toOptions = getToOptions(pickup);
  const trackingStorageKey = user?.id ? `sahal:activeRideId:${user.id}` : null;
  const hasLiveRide = Boolean(activeRide && ACTIVE_STATUSES.has(String(activeRide.status ?? "")));
  const statusLabel = activeRide ? STATUS_LABELS[String(activeRide.status ?? "")] ?? activeRide.status : "";

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
      },
      (error) => {
        console.error("[PassengerDashboard] failed to load drivers:", error);
      }
    );
  }, []);

  useEffect(() => {
    if (!trackingStorageKey) return;

    const storedRideId = window.localStorage.getItem(trackingStorageKey);
    if (storedRideId) {
      setActiveRideId(storedRideId);
    }
  }, [trackingStorageKey]);

  useEffect(() => {
    if (!trackingStorageKey || !activeRideId) return;
    window.localStorage.setItem(trackingStorageKey, activeRideId);
  }, [activeRideId, trackingStorageKey]);

  useEffect(() => {
    if (!activeRideId) {
      setActiveRide(null);
      setTrackingError(null);
      return;
    }

    const db = getFirebaseDb();
    const rideRef = doc(db, "rideRequests", activeRideId);

    return onSnapshot(
      rideRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setTrackingError("تعذر العثور على الرحلة الحالية.");
          setActiveRide(null);
          setDriverProfile(null);
          return;
        }

        const rideData = snapshot.data() as Omit<RideResult, "id">;
        const nextRide = { id: snapshot.id, ...rideData };
        const nextStatus = String(nextRide.status ?? "requested");

        setActiveRide(nextRide);
        setTrackingError(null);

        if (nextStatus === "accepted" && lastNotifiedRideIdRef.current !== nextRide.id) {
          lastNotifiedRideIdRef.current = nextRide.id;
          setAcceptedModalOpen(true);
          toast({
            title: "تم قبول الرحلة",
            description: "تم ربطك بالسائق وسيظهر لك الآن ملفه.",
          });
        }

        if (lastStatusRef.current !== nextStatus) {
          lastStatusRef.current = nextStatus;
        }
      },
      (error) => {
        console.error("[PassengerDashboard] ride listener failed:", error);
        setTrackingError(error.message);
      }
    );
  }, [activeRideId, toast]);

  useEffect(() => {
    if (!activeRide?.assignedDriverId) {
      setDriverProfile(null);
      return;
    }

    const db = getFirebaseDb();
    const driverRef = doc(db, "drivers", activeRide.assignedDriverId);

    return onSnapshot(
      driverRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setDriverProfile(null);
          return;
        }

        const data = snapshot.data();
        setDriverProfile({
          id: snapshot.id,
          fullName: String(data.fullName ?? data.displayName ?? "Driver"),
          phone: String(data.phone ?? "—"),
          carModel: String(data.carModel ?? data.vehicleModel ?? "—"),
          carPlateNumber: String(data.carPlateNumber ?? data.vehiclePlate ?? "—"),
          status: String(data.status ?? "unknown"),
        });
      },
      (error) => {
        console.error("[PassengerDashboard] driver listener failed:", error);
        setDriverProfile(null);
      }
    );
  }, [activeRide?.assignedDriverId]);

  async function handleRequestRide(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const uid = user?.id || user?.email || "unknown_user";

    if (!pickup || !destination || !selectedDriverId || !passengerPhone || !rate) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة.",
      });
      return;
    }

    if (hasLiveRide) {
      toast({
        variant: "destructive",
        title: "رحلة نشطة",
        description: "لديك رحلة قيد المتابعة بالفعل.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        passengerId: uid,
        passengerUserId: uid,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        pickup: { lat: 0, lng: 0, address: pickup },
        dropoff: { lat: 0, lng: 0, address: destination },
        destination,
        fare: rate.price,
        price: rate.price,
        currency: "DZD",
        status: "requested",
        driverId: selectedDriverId,
        driverUserId: selectedDriverId,
        assignedDriverId: selectedDriverId,
        distanceMeters: 0,
        durationSeconds: 0,
      };

      const ride = await createRideRequest(payload);
      setActiveRideId(ride.id);
      lastNotifiedRideIdRef.current = null;
      lastStatusRef.current = null;

      toast({
        title: "تم طلب الرحلة",
        description: "تم إرسال الطلب بنجاح.",
      });

      setPickup("");
      setDestination("");
      setPassengerPhone("");
      setSelectedDriverId("");
    } catch (error) {
      console.error("[PassengerDashboard] ride request failed:", error);
      toast({
        variant: "destructive",
        title: "فشل الطلب",
        description: "حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle =
    "w-full h-12 rounded-xl bg-slate-800 border border-slate-700 text-white px-4 pr-11 outline-none focus:border-blue-500 transition-all";

  async function handleLogout() {
    try {
      if (trackingStorageKey) {
        window.localStorage.removeItem(trackingStorageKey);
      }

      await signOut();
      router.replace("/auth/sign-in");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "فشل تسجيل الخروج",
        description: error instanceof Error ? error.message : "تعذر إنهاء الجلسة.",
      });
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 text-right">
              <p className="text-sm text-slate-300">مرحباً بك في لوحة الراكب</p>
              <h1 className="text-3xl font-bold text-white">
                أهلاً بك، {user?.displayName || "راكبنا"}
              </h1>
              <p className="text-sm text-slate-400">اطلب رحلة جديدة وتابع حالتها لحظة بلحظة.</p>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <Link href="/passenger/profile/edit">
                  <PencilLine className="h-4 w-4" aria-hidden="true" />
                  تعديل الملف الشخصي
                </Link>
              </Button>

              <Button
                type="button"
                onClick={() => void handleLogout()}
                className="h-11 rounded-full bg-rose-500 px-5 text-white hover:bg-rose-600"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>

        {activeRide ? (
          <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center justify-end gap-2 text-white">
                <span>{statusLabel || "متابعة الرحلة"}</span>
                {activeRide.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                ) : (
                  <Clock3 className="h-5 w-5 text-blue-300" aria-hidden="true" />
                )}
              </CardTitle>
              <CardDescription className="text-slate-300">
                تتحدث هذه البطاقة مباشرة من وثيقة الرحلة في Firestore.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs text-slate-400">الانطلاق</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {activeRide.pickup?.address || "غير محدد"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs text-slate-400">الوجهة</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {activeRide.dropoff?.address || activeRide.destination || "غير محددة"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs text-slate-400">الحالة</p>
                  <p className="mt-1 text-sm font-medium text-white">{statusLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs text-slate-400">السعر</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {activeRide.price ? `${activeRide.price} DZD` : "قيد الانتظار"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-blue-200">السائق المخصص</p>
                    <p className="text-lg font-semibold text-white">
                      {activeRide.assignedDriverId ? "تم التعيين" : "بانتظار التعيين"}
                    </p>
                  </div>
                  <Car className="h-5 w-5 text-blue-300" aria-hidden="true" />
                </div>

                {activeRide.assignedDriverId ? (
                  driverProfile ? (
                    <div className="space-y-3 text-sm text-slate-100">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-white">{driverProfile.fullName}</p>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <p>
                          <span className="text-slate-400">الهاتف:</span> {driverProfile.phone}
                        </p>
                        <p>
                          <span className="text-slate-400">السيارة:</span> {driverProfile.carModel}
                        </p>
                        <p>
                          <span className="text-slate-400">اللوحة:</span> {driverProfile.carPlateNumber}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-200">جاري تحميل بيانات السائق...</p>
                  )
                ) : (
                  <p className="text-sm text-slate-200">سيظهر ملف السائق هنا بعد التعيين.</p>
                )}
              </div>

              {trackingError ? (
                <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {trackingError}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <Card className="bg-slate-900 border-slate-800 shadow-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleRequestRide} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={pickup}
                  onChange={(event) => {
                    setPickup(event.target.value);
                    setDestination("");
                  }}
                  className={inputStyle}
                  disabled={submitting}
                >
                  <option value="">الانطلاق</option>
                  {fromOptions.map((from) => (
                    <option key={from} value={from}>
                      {from}
                    </option>
                  ))}
                </select>
                <select
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  className={inputStyle}
                  disabled={submitting || !pickup}
                >
                  <option value="">الوجهة</option>
                  {getToOptions(pickup).map((to) => (
                    <option key={to} value={to}>
                      {to}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <UserRound className="absolute right-3 top-3.5 text-blue-500" size={20} />
                <input
                  value={passengerName}
                  onChange={(event) => setPassengerName(event.target.value)}
                  className={inputStyle}
                  placeholder="الاسم"
                  disabled={submitting}
                />
              </div>

              <div className="relative">
                <Phone className="absolute right-3 top-3.5 text-blue-500" size={20} />
                <input
                  type="tel"
                  value={passengerPhone}
                  onChange={(event) => setPassengerPhone(event.target.value)}
                  className={inputStyle}
                  placeholder="رقم الهاتف"
                  required
                  disabled={submitting}
                />
              </div>

              <select
                value={selectedDriverId}
                onChange={(event) => setSelectedDriverId(event.target.value)}
                className={inputStyle}
                disabled={submitting || drivers.length === 0}
              >
                <option value="">اختر السائق</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {getDriverLabel(driver)}
                  </option>
                ))}
              </select>

              {hasLiveRide ? (
                <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  لديك رحلة قيد المتابعة بالفعل. يمكنك مراقبة التحديثات في البطاقة العلوية.
                </p>
              ) : null}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-blue-600 font-bold text-white transition-all hover:bg-blue-700"
                disabled={submitting || hasLiveRide}
              >
                {submitting ? <Loader2 className="animate-spin" /> : "تأكيد الطلب"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {acceptedModalOpen && activeRide ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-blue-200">تم قبول الرحلة</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">سائقك أصبح متاحاً</h2>
              </div>
              <button
                type="button"
                onClick={() => setAcceptedModalOpen(false)}
                className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100">
              <p>
                <span className="text-slate-400">الاسم:</span>{" "}
                {driverProfile?.fullName ?? "جاري تحميل اسم السائق..."}
              </p>
              <p>
                <span className="text-slate-400">الهاتف:</span>{" "}
                {driverProfile?.phone ?? "جاري تحميل الرقم..."}
              </p>
              <p>
                <span className="text-slate-400">السيارة:</span>{" "}
                {driverProfile?.carModel ?? "جاري التحميل"}
              </p>
              <p>
                <span className="text-slate-400">الحالة:</span>{" "}
                {statusLabel || "تم القبول"}
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setAcceptedModalOpen(false)}
              className="mt-5 h-11 w-full rounded-full bg-blue-600 text-white hover:bg-blue-500"
            >
              حسناً
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

