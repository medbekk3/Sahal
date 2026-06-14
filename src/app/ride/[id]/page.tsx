"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHero } from "@/components/shared/page-hero";
import { getRideById } from "@/services/rideService";
import type { RideResult } from "@/services/rideService";

export async function generateStaticParams() {
  return [];
}


const STATUS_LABELS: Record<string, string> = {
  requested: "بانتظار السائق",
  accepted: "تم قبول السائق",
  arriving: "السائق في الطريق",
  in_progress: "الرحلة جارية",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

function formatStatus(status: string) {
  return STATUS_LABELS[status] ?? status;
}

export default function RideTrackPage() {
  const params = useParams<{ id: string }>();
  const rideId = params?.id;
  const [ride, setRide] = useState<RideResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRide = useCallback(async () => {
    if (!rideId) return;
    try {
      const data = await getRideById(rideId);
      if (!data) {
        setError("الرحلة غير موجودة.");
        setRide(null);
      } else {
        setError(null);
        setRide(data);
      }
    } catch {
      setError("تعذر تحميل حالة الرحلة.");
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    void loadRide();
  }, [loadRide]);

  useEffect(() => {
    if (!ride || ride.status === "completed" || ride.status === "cancelled") return;

    const interval = setInterval(() => {
      void loadRide();
    }, 5000);

    return () => clearInterval(interval);
  }, [ride, loadRide]);

  if (loading) {
    return (
      <div dir="rtl" className="container mx-auto flex flex-1 items-center justify-center px-4 py-24">
        <p className="text-sm text-muted-foreground">جارٍ تحميل حالة الرحلة...</p>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div dir="rtl" className="container mx-auto max-w-lg space-y-6 px-4 py-10 text-center">
        <p className="text-muted-foreground">{error ?? "الرحلة غير موجودة."}</p>
        <Button asChild>
          <Link href="/ride/request">طلب رحلة جديدة</Link>
        </Button>
      </div>
    );
  }

  const isActive = !["completed", "cancelled"].includes(ride.status);

  return (
    <div dir="rtl" className="container mx-auto max-w-lg space-y-8 px-4 py-10">
      <PageHero title="تتبع رحلتك" description={`الرحلة #${ride.id.slice(0, 8).toUpperCase()}`} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isActive ? (
              <Clock className="h-5 w-5 text-primary" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            )}
            {formatStatus(ride.status)}
          </CardTitle>
          <CardDescription>
            {isActive ? "تتحدث الحالة تلقائيًا كل بضع ثوانٍ." : "انتهت هذه الرحلة."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">الانطلاق</p>
                <p className="text-muted-foreground">{ride.pickup.address || "—"}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-2 text-sm">
              <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">الوجهة</p>
                <p className="text-muted-foreground">{ride.dropoff.address || "—"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">وقت الطلب</p>
              <p className="font-medium">
                {ride.requestedAt ? new Date(ride.requestedAt).toLocaleString() : "—"}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground">الأجرة</p>
              <p className="font-medium">{ride.fare > 0 ? `${ride.fare} ${ride.currency}` : "قيد الانتظار"}</p>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => loadRide()}>
            تحديث الحالة
          </Button>
        </CardContent>
      </Card>

      <Button asChild variant="ghost" className="w-full">
        <Link href="/ride/request">طلب رحلة أخرى</Link>
      </Button>
    </div>
  );
}