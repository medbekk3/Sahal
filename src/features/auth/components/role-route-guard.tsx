"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserProfile } from "@/domain/entities/user";
import { useAuth } from "@/providers/auth-provider";
import { ROLE_REDIRECT_PATHS } from "@/features/auth/hooks/use-role-based-redirect";

type RoleRouteGuardProps = {
  children: ReactNode;
  allow: (user: UserProfile, pathname: string) => boolean;
  loadingLabel?: string;
};

function getFallbackPath(user: UserProfile): string {
  if (user.role === "admin") return ROLE_REDIRECT_PATHS.admin;
  if (user.role === "driver" && user.status === "pending") return ROLE_REDIRECT_PATHS.driverPending;
  if (user.role === "driver" && user.status === "active") return ROLE_REDIRECT_PATHS.driverActive;
  if (user.role === "passenger") return ROLE_REDIRECT_PATHS.passenger;

  return ROLE_REDIRECT_PATHS.fallback;
}

export function RoleRouteGuard({
  children,
  allow,
  loadingLabel = "Loading...",
}: RoleRouteGuardProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (!allow(user, pathname)) {
      router.replace(getFallbackPath(user));
    }
  }, [allow, loading, pathname, router, user]);

  if (loading || !user || !allow(user, pathname)) {
    return (
      <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-24">
        <p className="text-sm text-muted-foreground">{loadingLabel}</p>
      </div>
    );
  }

  return <>{children}</>;
}
