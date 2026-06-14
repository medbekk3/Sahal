"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { CalendarDays, Clock3, Filter, ReceiptText, Ban, PlayCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getFirebaseDb } from "@/infrastructure/firebase/config";

type RideRecord = {
  id: string;
  passengerName: string;
  pickup: string;
  destination: string;
  status: string;
  price: number;
  currency: string;
  createdAt: string;
  createdAtDate: Date | null;
};

type RideFilter = "all" | "today" | "monthly" | "active" | "cancelled";

const activeStatuses = new Set(["requested", "accepted", "arriving", "in_progress"]);
const RIDE_REQUESTS_COLLECTION = "rideRequests";

function getAddress(value: unknown) {
  if (value && typeof value === "object" && "address" in value) {
    return String((value as { address?: unknown }).address ?? "");
  }

  return String(value ?? "");
}

function formatDate(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate() as Date;
    return { label: date.toLocaleString(), date };
  }

  if (value instanceof Date) {
    return { label: value.toLocaleString(), date: value };
  }

  return { label: "-", date: null };
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isSameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function getStatusTone(status: string) {
  switch (status) {
    case "completed":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";
    case "cancelled":
      return "border-rose-500/20 bg-rose-500/10 text-rose-100";
    case "in_progress":
      return "border-blue-500/20 bg-blue-500/10 text-blue-100";
    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-100";
  }
}

export function RidesManagementPanel() {
  const [rides, setRides] = useState<RideRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<RideFilter>("all");

  useEffect(() => {
    const q = query(collection(getFirebaseDb(), RIDE_REQUESTS_COLLECTION), orderBy("updatedAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        setRides(
          snapshot.docs.map((rideDoc) => {
            const data = rideDoc.data();
            const created = formatDate(data.createdAt ?? data.requestedAt ?? null);

            return {
              id: rideDoc.id,
              passengerName: String(data.passengerName ?? "Passenger"),
              pickup: getAddress(data.pickup),
              destination: getAddress(data.dropoff ?? data.destination),
              status: String(data.status ?? "requested"),
              price: Number(data.price ?? data.fare ?? 0),
              currency: String(data.currency ?? "DZD"),
              createdAt: created.label,
              createdAtDate: created.date,
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
  }, []);

  const filteredRides = useMemo(() => {
    const now = new Date();

    return rides.filter((ride) => {
      switch (filter) {
        case "today":
          return ride.createdAtDate ? isSameDay(ride.createdAtDate, now) : false;
        case "monthly":
          return ride.createdAtDate ? isSameMonth(ride.createdAtDate, now) : false;
        case "active":
          return activeStatuses.has(ride.status);
        case "cancelled":
          return ride.status === "cancelled";
        default:
          return true;
      }
    });
  }, [filter, rides]);

  const filterButtons: Array<{ value: RideFilter; label: string; icon: ComponentType<{ className?: string }> }> =
    [
      { value: "today", label: "Today", icon: CalendarDays },
      { value: "monthly", label: "Monthly", icon: Clock3 },
      { value: "active", label: "Active", icon: PlayCircle },
      { value: "cancelled", label: "Cancelled", icon: Ban },
    ];

  return (
    <Card className="border-slate-800 bg-slate-900/80 text-slate-100 shadow-lg shadow-slate-950/30">
      <CardHeader className="border-b border-slate-800/80 bg-slate-900/60">
        <CardTitle className="flex items-center gap-2 text-white">
          <ReceiptText className="h-5 w-5 text-blue-400" aria-hidden="true" />
          Rides Management
        </CardTitle>
        <CardDescription className="text-slate-400">
          Filter rides by time or status and review each trip in real time.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 px-5 py-4">
          <Filter className="h-4 w-4 text-slate-400" />
          {filterButtons.map(({ value, label, icon: Icon }) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                  active
                    ? "border-blue-500/20 bg-blue-500/15 text-white"
                    : "border-slate-700 bg-slate-950/40 text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-400">Loading rides...</div>
        ) : error ? (
          <div className="p-6">
            <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </p>
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">No rides match the current filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-right text-sm">
              <thead className="bg-slate-950/50 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">الراكب</th>
                  <th className="px-5 py-3 font-medium">المسار</th>
                  <th className="px-5 py-3 font-medium">الحالة</th>
                  <th className="px-5 py-3 font-medium">السعر</th>
                  <th className="px-5 py-3 font-medium">تاريخ الإنشاء</th>
                </tr>
              </thead>
              <tbody>
                {filteredRides.map((ride) => (
                  <tr key={ride.id} className="border-t border-slate-800/70">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{ride.passengerName}</p>
                      <p className="text-xs text-slate-400">{ride.id}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      <p className="max-w-md truncate">{ride.pickup || "Pickup not set"}</p>
                      <p className="max-w-md truncate text-slate-500">To {ride.destination || "Destination not set"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusTone(ride.status)}`}
                      >
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-white">
                      {ride.price.toLocaleString()} {ride.currency}
                    </td>
                    <td className="px-5 py-4 text-slate-400">{ride.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
