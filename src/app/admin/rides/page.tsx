import type { Metadata } from "next";
import { RidesManagementPanel } from "@/features/admin/components/rides-management-panel";

export const metadata: Metadata = {
  title: "Rides Management",
};

export default function AdminRidesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Admin module</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Rides Management</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          View rides in real time and filter by today, monthly, active, or cancelled trips.
        </p>
      </div>

      <RidesManagementPanel />
    </div>
  );
}
