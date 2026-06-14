"use client";

import { useCallback, type ReactNode } from "react";
import type { UserProfile } from "@/domain/entities/user";
import { RoleRouteGuard } from "@/features/auth/components/role-route-guard";

export default function PassengerLayout({ children }: { children: ReactNode }) {
  const allow = useCallback((user: UserProfile) => {
    return user.role === "passenger" && user.status === "active";
  }, []);

  return (
    <div dir="rtl">
      <RoleRouteGuard allow={allow} loadingLabel="جارٍ التحقق من حالة حساب الراكب...">
        {children}
      </RoleRouteGuard>
    </div>
  );
}
