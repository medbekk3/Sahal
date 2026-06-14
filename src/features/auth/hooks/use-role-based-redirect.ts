"use client";

import { useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/infrastructure/firebase/config";

type AppRouter = {
  push: (href: string) => void;
  replace: (href: string) => void;
};

type UserRole = "passenger" | "driver" | "admin";
type AccountStatus = "active" | "pending" | "suspended" | "inactive";

type RoleStatus = {
  role: UserRole;
  status: AccountStatus;
};

export const ROLE_REDIRECT_PATHS = {
  admin: "/admin/dashboard",
  driverActive: "/driver/dashboard",
  driverPending: "/driver/waiting-for-approval",
  passenger: "/passenger/dashboard",
  fallback: "/dashboard",
} as const;

export const ADMIN_EMAIL = "mohamedbekkair@sahal.com";

export function isAdminEmail(email: string | null | undefined) {
  return String(email ?? "").toLowerCase().trim() === ADMIN_EMAIL;
}

function normalizeRole(value: unknown): UserRole {
  if (value === "driver" || value === "admin" || value === "passenger") {
    return value;
  }

  return "passenger";
}

function normalizeStatus(value: unknown): AccountStatus {
  if (
    value === "active" ||
    value === "pending" ||
    value === "suspended" ||
    value === "inactive"
  ) {
    return value;
  }

  return "active";
}

export async function getUserRoleStatus(userId: string): Promise<RoleStatus> {
  const userSnapshot = await getDoc(doc(getFirebaseDb(), "users", userId));

  if (!userSnapshot.exists()) {
    return { role: "passenger", status: "active" };
  }

  const data = userSnapshot.data();

  return {
    role: normalizeRole(data.role),
    status: normalizeStatus(data.status ?? (data.isActive === false ? "inactive" : "active")),
  };
}

export async function getRoleBasedRedirectPath(userId: string): Promise<string> {
  const { role, status } = await getUserRoleStatus(userId);

  if (role === "admin") return ROLE_REDIRECT_PATHS.admin;
  if (role === "driver" && status === "pending") return ROLE_REDIRECT_PATHS.driverPending;
  if (role === "driver" && status === "active") return ROLE_REDIRECT_PATHS.driverActive;
  if (role === "passenger") return ROLE_REDIRECT_PATHS.passenger;

  return ROLE_REDIRECT_PATHS.fallback;
}

export async function redirectUserByRole(
  router: AppRouter,
  userOrId: User | string,
  mode: "push" | "replace" = "replace"
) {
  const userId = typeof userOrId === "string" ? userOrId : userOrId.uid;
  const email = typeof userOrId === "string" ? null : userOrId.email;

  if (isAdminEmail(email)) {
    console.log("[AuthRedirect] Admin email detected; redirecting to /admin/dashboard.");
    router[mode](ROLE_REDIRECT_PATHS.admin);
    return;
  }

  const path = await getRoleBasedRedirectPath(userId);
  router[mode](path);
}

export function useRoleBasedRedirect(router: AppRouter) {
  return useCallback(
    async (userOrId: User | string, mode: "push" | "replace" = "replace") => {
      await redirectUserByRole(router, userOrId, mode);
    },
    [router]
  );
}
