"use client";

import { Banknote, Percent, Route } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDzd } from "@/features/drivers/lib/commission";
import { driverAr, formatNumberAr } from "@/features/drivers/lib/driver-i18n";
import type { DriverStats } from "@/features/drivers/hooks/use-driver-dashboard";

type EarningsOverviewProps = {
  stats: Pick<DriverStats, "totalTrips" | "totalEarnings" | "owedCommissions">;
};

export function EarningsOverview({ stats }: EarningsOverviewProps) {
  const metrics = [
    {
      label: driverAr.totalTrips,
      value: formatNumberAr(stats.totalTrips),
      icon: Route,
      tone: "text-blue-600 bg-blue-500/10",
    },
    {
      label: driverAr.totalEarnings,
      value: formatDzd(stats.totalEarnings),
      icon: Banknote,
      tone: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: driverAr.owedCommissions,
      value: formatDzd(stats.owedCommissions),
      icon: Percent,
      tone: "text-amber-600 bg-amber-500/10",
      hint: driverAr.commissionHint,
    },
  ];

  return (
    <Card dir="rtl" className="text-right">
      <CardHeader className="text-right">
        <CardTitle>{driverAr.earningsOverview}</CardTitle>
        <CardDescription>{driverAr.earningsOverviewDesc}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border bg-muted/20 p-4 text-right">
            <div className="flex items-center justify-end gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-semibold">{metric.value}</p>
              </div>
              <div className={`rounded-lg p-2 ${metric.tone}`}>
                <metric.icon className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
            {metric.hint ? (
              <p className="mt-3 text-xs text-muted-foreground">{metric.hint}</p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
