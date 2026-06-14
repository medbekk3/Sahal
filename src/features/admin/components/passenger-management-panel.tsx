"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore";
import { Loader2, ShieldAlert, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseDb } from "@/infrastructure/firebase/config";

type PassengerRecord = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  status: string;
  updatedAt: string;
};

function formatUpdatedAt(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toLocaleString();
  }

  return "-";
}

function getStatusTone(status: string) {
  switch (status) {
    case "active":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
    case "pending":
      return "border-amber-500/20 bg-amber-500/10 text-amber-100";
    case "suspended":
      return "border-rose-500/20 bg-rose-500/10 text-rose-100";
    default:
      return "border-slate-700 bg-slate-800/70 text-slate-200";
  }
}

export function PassengerManagementPanel() {
  const { toast } = useToast();
  const [passengers, setPassengers] = useState<PassengerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(getFirebaseDb(), "users"), orderBy("updatedAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        setPassengers(
          snapshot.docs
            .map((userDoc) => {
              const data = userDoc.data();

              return {
                id: userDoc.id,
                email: String(data.email ?? ""),
                fullName: String(data.displayName ?? "Passenger"),
                phone: String(data.phone ?? "-"),
                role: String(data.role ?? "passenger"),
                status: String(data.status ?? "active"),
                updatedAt: formatUpdatedAt(data.updatedAt),
              };
            })
            .filter((record) => record.role === "passenger")
        );
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );
  }, []);

  async function suspendPassenger(passenger: PassengerRecord) {
    setSavingId(passenger.id);
    try {
      const db = getFirebaseDb();
      const batch = writeBatch(db);

      batch.update(doc(db, "users", passenger.id), {
        status: "suspended",
        isActive: false,
        updatedAt: serverTimestamp(),
      });

      batch.set(
        doc(db, "passengers", passenger.id),
        {
          userId: passenger.id,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await batch.commit();

      toast({
        title: "Passenger suspended",
        description: `${passenger.fullName}'s account is now suspended.`,
      });
    } catch (actionError) {
      toast({
        variant: "destructive",
        title: "Unable to update passenger",
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
          Passengers Management
        </CardTitle>
        <CardDescription className="text-slate-400">
          Review passenger accounts and suspend access when necessary.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Loading passengers...</div>
        ) : error ? (
          <div className="p-6">
            <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </p>
          </div>
        ) : passengers.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">No passengers found.</div>
        ) : (
          <div className="overflow-hidden">
            <div className="grid grid-cols-[1.2fr_1.1fr_0.8fr_0.8fr_1fr_160px] gap-3 border-b border-slate-800 bg-slate-950/50 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              <span>Passenger</span>
              <span>Email</span>
              <span>Status</span>
              <span>Phone</span>
              <span>Updated</span>
              <span className="text-end">الإجراء</span>
            </div>

            {passengers.map((passenger) => (
              <div
                key={passenger.id}
                className="grid grid-cols-[1.2fr_1.1fr_0.8fr_0.8fr_1fr_160px] items-center gap-3 border-b border-slate-800/70 px-5 py-4 text-sm last:border-b-0"
              >
                <div>
                  <p className="font-medium text-white">{passenger.fullName}</p>
                  <p className="text-xs text-slate-400">{passenger.id}</p>
                </div>

                <span className="truncate text-slate-300">{passenger.email}</span>

                <span
                  className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusTone(passenger.status)}`}
                >
                  {passenger.status}
                </span>

                <span className="text-slate-300">{passenger.phone}</span>

                <span className="text-slate-400">{passenger.updatedAt}</span>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="rounded-full"
                    onClick={() => void suspendPassenger(passenger)}
                    disabled={savingId === passenger.id || passenger.status === "suspended"}
                  >
                    {savingId === passenger.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldAlert className="h-4 w-4" />
                    )}
                    Suspend
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
