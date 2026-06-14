"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider";
import { getFirebaseDb } from "@/infrastructure/firebase/config";
import { completeRideAndSetAvailable } from "@/features/dispatch/services/nearest-driver-dispatch";
import { AvailabilityToggle } from "@/features/drivers/components/availability-toggle";
import { DriverWalletCard } from "@/features/drivers/components/driver-wallet-card";
import { EarningsOverview } from "@/features/drivers/components/earnings-overview";
import { IncomingRequestsPanel } from "@/features/drivers/components/incoming-requests-panel";
import { OnTripIndicator } from "@/features/drivers/components/on-trip-indicator";
import { useDriverDashboard } from "@/features/drivers/hooks/use-driver-dashboard";
import { useDriverLocation } from "@/features/drivers/hooks/use-driver-location";
import { driverAr, driverRtlClass } from "@/features/drivers/lib/driver-i18n";
import { setDriverAvailability } from "@/features/drivers/services/driver-dashboard-service";

export function DriverDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const driverId = user?.id;
  const { profile, stats, loading, isAvailable } = useDriverDashboard(driverId);
  const [actionLoading, setActionLoading] = useState(false);
  const availabilityStatus = isAvailable ? "online" : "offline";

  const requestsDisabled = stats.isOnTrip || !isAvailable;

  useDriverLocation({
    driverId,
    enabled: Boolean(driverId) && isAvailable && !stats.isOnTrip,
  });

  async function handleCompleteRide() {
    if (!stats.activeRideId || !driverId) return;
    
    setActionLoading(true);
    try {
      const db = getFirebaseDb();
      await completeRideAndSetAvailable(db, stats.activeRideId, driverId);
      toast({ title: "تم إنهاء الرحلة", description: "أنت الآن متاح لرحلات جديدة" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "تعذر إنهاء الرحلة" });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="ms-2 h-4 w-4 animate-spin" />
        {driverAr.loadingDashboard}
      </div>
    );
  }

  return (
    <div dir="rtl" className={`space-y-6 ${driverRtlClass}`}>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">{driverAr.welcomeBack}</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {profile?.fullName ?? user?.displayName ?? driverAr.defaultName}
        </h1>
      </div>

      {/* بطاقة معلومات الرحلة المعلقة */}
      {stats.isOnTrip && (
        <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-900">تفاصيل الرحلة الحالية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-right text-sm">
            <p><strong>الراكب:</strong> {stats.passengerName || "جاري التحميل..."}</p>
            <p><strong>الهاتف:</strong> {stats.passengerPhone || "جاري التحميل..."}</p>
            <p><strong>الوجهة:</strong> {stats.destinationAddress || "غير محددة"}</p>
            <p><strong>السعر المتفق عليه:</strong> {stats.price ? `${stats.price} دج` : "غير محدد"}</p>
          </CardContent>
        </Card>
      )}

      {/* زر إنهاء الرحلة */}
      {stats.isOnTrip && stats.activeRideId && (
        <div className="animate-in fade-in zoom-in duration-300">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg shadow-lg"
            onClick={handleCompleteRide}
            disabled={actionLoading}
          >
            {actionLoading ? "جاري الإنهاء..." : "تأكيد الوصول وإنهاء الرحلة"}
          </Button>
        </div>
      )}

      <Card dir="rtl" className="text-right">
        <CardHeader className="text-right">
          <CardTitle>{driverAr.statusManagement}</CardTitle>
          <CardDescription>{driverAr.statusManagementDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <AvailabilityToggle
            status={availabilityStatus}
            disabled={stats.isOnTrip}
            loading={false}
            onToggle={(next) => setDriverAvailability(driverId!, next)}
          />
        </CardContent>
      </Card>

      <OnTripIndicator active={stats.isOnTrip} />
      {driverId && <IncomingRequestsPanel driverId={driverId} disabled={requestsDisabled} />}
      <EarningsOverview stats={stats} />
      <DriverWalletCard stats={stats} />
    </div>
  );
}
