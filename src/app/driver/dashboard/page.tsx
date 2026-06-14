import type { Metadata } from "next";
import { ar } from "@/lib/i18n/ar";
import { DriverDashboard } from "@/features/drivers/components/driver-dashboard";

export const metadata: Metadata = {
  title: ar.driverDashboard,
};

export default function DriverDashboardPage() {
  return (
    <div dir="rtl" className="container mx-auto px-4 py-10 text-right">
      <DriverDashboard />
    </div>
  );
}
