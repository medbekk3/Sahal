"use client";

import { useCallback, type ReactNode } from "react";
import type { UserProfile } from "@/domain/entities/user";
import { RoleRouteGuard } from "@/features/auth/components/role-route-guard";

export default function DriverLayout({ children }: { children: ReactNode }) {
  const allow = useCallback((user: UserProfile, pathname: string) => {
    if (user.role !== "driver") return false;

    if (pathname === "/driver/waiting-for-approval") {
      return user.status === "pending";
    }

    return user.status === "active";
  }, []);

  return (
    <div dir="rtl">
      <RoleRouteGuard allow={allow} loadingLabel="جارٍ التحقق من حالة حساب السائق...">
        {children}
      </RoleRouteGuard>
    </div>
  );
}
