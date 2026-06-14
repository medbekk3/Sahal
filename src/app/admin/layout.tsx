"use client";

import { type ReactNode } from "react";
import { AdminGuard } from "@/features/admin/components/admin-guard";
import { AdminLayout } from "@/features/admin/components/admin-layout";

export default function AdminRouteLayout({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl">
      <AdminGuard>
        <AdminLayout>{children}</AdminLayout>
      </AdminGuard>
    </div>
  );
}
