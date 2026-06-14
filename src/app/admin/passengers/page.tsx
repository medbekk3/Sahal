import type { Metadata } from "next";
import { PassengerManagementPanel } from "@/features/admin/components/passenger-management-panel";

export const metadata: Metadata = {
  title: "Passengers Management",
};

export default function AdminPassengersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Admin module</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Passengers Management
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Review passenger accounts and suspend access when necessary.
        </p>
      </div>

      <PassengerManagementPanel />
    </div>
  );
}
