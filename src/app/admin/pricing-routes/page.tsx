import type { Metadata } from "next";
import { FareRateManager } from "@/features/fares/components/fare-rate-manager";

export const metadata: Metadata = {
  title: "Pricing & Routes",
};

export default function AdminPricingRoutesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Admin module</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Pricing &amp; Routes</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Add, edit, or remove fixed fare routes that feed the passenger request form.
        </p>
      </div>

      <FareRateManager />
    </div>
  );
}
