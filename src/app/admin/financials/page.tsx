import type { Metadata } from "next";
import { DriverDebtManager } from "@/features/admin/components/driver-debt-manager";

export const metadata: Metadata = {
  title: "Financials",
};

export default function AdminFinancialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Admin module</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Financials</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Confirm driver commission payments and reset debts after settlement.
        </p>
      </div>

      <DriverDebtManager />
    </div>
  );
}
