"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { driverAr, mapStatusLabelAr } from "@/features/drivers/lib/driver-i18n";

type AvailabilityToggleProps = {
  status: string;
  disabled?: boolean;
  loading?: boolean;
  onToggle: (nextAvailable: boolean) => void;
};

export function AvailabilityToggle({
  status,
  disabled = false,
  loading = false,
  onToggle,
}: AvailabilityToggleProps) {
  const normalizedStatus = status.toLowerCase().trim();
  const isOnline = normalizedStatus === "online";
  const isToggleable = normalizedStatus === "online" || normalizedStatus === "offline";
  const nextAvailable = !isOnline;
  const currentStatusLabel = mapStatusLabelAr(normalizedStatus);
  const buttonLabel = isOnline ? driverAr.available : driverAr.unavailable;

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-3 text-right sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-sm font-medium">{driverAr.availability}</p>
        <p className="text-xs text-muted-foreground">
          الحالة الحالية: {currentStatusLabel}
        </p>
      </div>

      <Button
        type="button"
        role="switch"
        aria-checked={isOnline}
        aria-label={isOnline ? driverAr.setUnavailable : driverAr.setAvailable}
        disabled={disabled || loading || !isToggleable}
        onClick={() => onToggle(nextAvailable)}
        className={cn(
          "h-11 min-w-40 rounded-full px-5 font-semibold text-white shadow-sm transition-colors",
          isOnline
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700",
          (disabled || loading || !isToggleable) && "cursor-not-allowed opacity-60"
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {loading ? driverAr.updatingAvailability : buttonLabel}
      </Button>
    </div>
  );
}
