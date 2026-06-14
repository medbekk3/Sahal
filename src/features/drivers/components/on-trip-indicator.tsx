"use client";

import { Route } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { driverAr } from "@/features/drivers/lib/driver-i18n";

type OnTripIndicatorProps = {
  active: boolean;
};

export function OnTripIndicator({ active }: OnTripIndicatorProps) {
  if (!active) return null;

  return (
    <Card dir="rtl" className="border-amber-500/30 bg-amber-500/10 text-right shadow-none">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-700">
          <Route className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="text-right">
          <p className="font-medium text-amber-950">{driverAr.onTripTitle}</p>
          <p className="text-sm text-amber-900/80">{driverAr.onTripDesc}</p>
        </div>
      </CardContent>
    </Card>
  );
}
