import type { Metadata } from "next";
import { DriverManagementPanel } from "@/features/admin/components/driver-management-panel";

export const metadata: Metadata = {
  title: "Drivers Management",
};

export default function AdminDriversPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Admin module</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Drivers Management</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Review driver applications, update their approval status, and monitor outstanding debt.
        </p>
      </div>

      <DriverManagementPanel />
    </div>
  );
}
