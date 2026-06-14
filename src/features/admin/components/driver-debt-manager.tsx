"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot, query, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { CheckCircle2, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseDb } from "@/infrastructure/firebase/config";
import {
  mapDriverDoc,
  sortDriversNewestFirst,
  type DriverRecord,
} from "@/features/admin/utils/map-driver-record";

function formatMoney(amount: number) {
  return `${amount.toLocaleString()} DZD`;
}

export function DriverDebtManager() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(
      collection(getFirebaseDb(), "drivers"),
      (snapshot) => {
        setDrivers(sortDriversNewestFirst(snapshot.docs.map(mapDriverDoc)));
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );
  }, []);

  async function confirmPayment(driver: DriverRecord) {
    setSavingId(driver.id);
    try {
      const db = getFirebaseDb();
      const driverRef = doc(db, "drivers", driver.id);
      const commissionsSnapshot = await getDocs(
        query(collection(db, "commissions"), where("driverUserId", "==", driver.userId))
      );
      const batch = writeBatch(db);

      batch.update(driverRef, {
        totalDebt: 0,
        lastPaymentDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      commissionsSnapshot.docs.forEach((commissionDoc) => {
        const commissionData = commissionDoc.data();
        if ((commissionData.status ?? "pending") === "pending") {
          batch.update(commissionDoc.ref, {
            status: "collected",
            updatedAt: serverTimestamp(),
          });
        }
      });

      await batch.commit();

      toast({
        title: "Payment confirmed",
        description: `${driver.fullName}'s commission debt was reset to 0.`,
      });
    } catch (paymentError) {
      toast({
        variant: "destructive",
        title: "Unable to confirm payment",
        description: paymentError instanceof Error ? paymentError.message : "Please try again.",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
          Driver Management
        </CardTitle>
        <CardDescription>Track commission debt and settle payments manually.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading drivers...</p>
        ) : error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : drivers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No drivers found.</p>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_140px] bg-muted px-3 py-2 text-sm font-medium">
              <span>Driver</span>
              <span>Status</span>
              <span className="text-end">إجمالي الدين</span>
              <span className="text-end">الإجراء</span>
            </div>
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="grid grid-cols-[1.2fr_0.7fr_0.7fr_140px] items-center border-t px-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{driver.fullName}</p>
                  <p className="text-xs text-muted-foreground">{driver.userId}</p>
                </div>
                <span className="capitalize text-muted-foreground">{driver.status}</span>
                <span className="text-end font-medium">{formatMoney(driver.totalDebt)}</span>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full bg-blue-600 text-white hover:bg-blue-500"
                    onClick={() => void confirmPayment(driver)}
                    disabled={savingId === driver.id || driver.totalDebt <= 0}
                  >
                    {savingId === driver.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Saving
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Confirm Payment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
