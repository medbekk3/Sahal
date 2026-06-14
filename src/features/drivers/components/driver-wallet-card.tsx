"use client";

import { CalendarDays, Coins, Route } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDzd } from "@/features/drivers/lib/commission";
import { driverAr, formatNumberAr } from "@/features/drivers/lib/driver-i18n";
import type { DriverStats } from "@/features/drivers/hooks/use-driver-dashboard";

type DriverWalletCardProps = {
  stats: Pick<DriverStats, "pendingBalance" | "totalTrips" | "lastPaymentDate">;
};

export function DriverWalletCard({ stats }: DriverWalletCardProps) {
  const items = [
    {
      label: driverAr.pendingBalance,
      value: formatDzd(stats.pendingBalance),
      icon: Coins,
      description: driverAr.pendingBalanceDesc,
    },
    {
      label: driverAr.totalTrips,
      value: formatNumberAr(stats.totalTrips),
      icon: Route,
      description: driverAr.totalTripsWalletDesc,
    },
    {
      label: driverAr.lastPaymentDate,
      value: stats.lastPaymentDate,
      icon: CalendarDays,
      description: driverAr.lastPaymentDesc,
    },
  ];

  return (
    <Card dir="rtl" className="text-right">
      <CardHeader className="text-right">
        <CardTitle>{driverAr.driverWallet}</CardTitle>
        <CardDescription>{driverAr.driverWalletDesc}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-right"
          >
            <p className="text-sm font-semibold">{item.value}</p>
            <div className="flex items-start gap-3">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
