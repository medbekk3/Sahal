"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, serverTimestamp, writeBatch } from "firebase/firestore";
import { Check, Loader2, ShieldAlert, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseDb } from "@/infrastructure/firebase/config";
import {
  mapDriverDoc,
  sortDriversNewestFirst,
  type DriverRecord,
} from "@/features/admin/utils/map-driver-record";

function formatDzd(amount: number) {
  return `${Math.round(amount).toLocaleString()} DZD`;
}

function getStatusTone(status: string) {
  switch (status) {
    case "approved":
    case "online":
    case "on_trip":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
    case "pending":
      return "border-amber-500/20 bg-amber-500/10 text-amber-100";
    case "suspended":
      return "border-rose-500/20 bg-rose-500/10 text-rose-100";
    default:
      return "border-slate-700 bg-slate-800/70 text-slate-200";
  }
}

export function DriverManagementPanel() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Plain collection query — no orderBy so drivers without `updatedAt` still appear.
    return onSnapshot(
      collection(getFirebaseDb(), "drivers"),
      (snapshot) => {
        const mapped = sortDriversNewestFirst(snapshot.docs.map(mapDriverDoc));
        setDrivers(mapped);
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );
  }, []);

  async function setDriverStatus(driver: DriverRecord, nextStatus: string, userStatus: string) {
    setSavingId(driver.id);
    try {
      const db = getFirebaseDb();
      const batch = writeBatch(db);

      batch.update(doc(db, "drivers", driver.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });

      batch.update(doc(db, "users", driver.userId), {
        status: userStatus,
        isActive: userStatus === "active",
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      toast({
        title: "Driver status updated",
        description: `${driver.fullName} is now ${nextStatus}.`,
      });
    } catch (actionError) {
      toast({
        variant: "destructive",
        title: "Unable to update driver",
        description: actionError instanceof Error ? actionError.message : "Please try again.",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/80 text-slate-100 shadow-lg shadow-slate-950/30">
      <CardHeader className="border-b border-slate-800/80 bg-slate-900/60">
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="h-5 w-5 text-blue-400" aria-hidden="true" />
          Drivers Management
        </CardTitle>
        <CardDescription className="text-slate-400">
          Review driver accounts, approve applications, or suspend access when needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Loading drivers...</div>
        ) : error ? (
          <div className="p-6">
            <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">No drivers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[1.3fr_0.8fr_0.8fr_0.9fr_1.2fr_220px] gap-3 border-b border-slate-800 bg-slate-950/50 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                <span>Driver</span>
                <span>Status</span>
                <span>Total Debt</span>
                <span>Vehicle</span>
                <span>Updated</span>
                <span className="text-end">الإجراءات</span>
              </div>

              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="grid grid-cols-[1.3fr_0.8fr_0.8fr_0.9fr_1.2fr_220px] items-center gap-3 border-b border-slate-800/70 px-5 py-4 text-sm last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-white">{driver.fullName}</p>
                    <p className="text-xs text-slate-400">{driver.phone}</p>
                    {(driver.idCardNumber !== "—" || driver.licenseNumber !== "—") && (
                      <p className="mt-1 text-xs text-slate-500">
                        ID: {driver.idCardNumber} · License: {driver.licenseNumber}
                      </p>
                    )}
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusTone(driver.status)}`}
                  >
                    {driver.status}
                  </span>

                  <span className="font-medium text-white">{formatDzd(driver.totalDebt)}</span>

                  <div className="text-slate-300">
                    <p>{driver.carModel}</p>
                    <p className="text-xs text-slate-400">{driver.carPlateNumber}</p>
                  </div>

                  <span className="text-slate-400">{driver.updatedAtLabel}</span>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
                      onClick={() => void setDriverStatus(driver, "approved", "active")}
                      disabled={savingId === driver.id}
                    >
                      {savingId === driver.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                      Accept
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full border-slate-700 bg-slate-950/40 text-slate-100 hover:bg-slate-800"
                      onClick={() => void setDriverStatus(driver, "pending", "inactive")}
                      disabled={savingId === driver.id}
                    >
                      <Check className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="rounded-full"
                      onClick={() => void setDriverStatus(driver, "suspended", "suspended")}
                      disabled={savingId === driver.id}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Suspend
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
