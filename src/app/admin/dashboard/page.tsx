import type { Metadata } from "next";
import { AdminDashboardOverview } from "@/features/admin/components/admin-dashboard-overview";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  return <AdminDashboardOverview />;
}
