"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import type { UserProfile } from "@/domain/entities/user";
import { useAuth } from "@/providers/auth-provider";

const ADMIN_EMAIL = "mohamedbekkair@sahal.com";

function isAuthorizedAdmin(user: UserProfile) {
  return user.email.toLowerCase().trim() === ADMIN_EMAIL;
}

type AdminGuardProps = {
  children: ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const authorized = useMemo(() => {
    if (!user) return false;
    return isAuthorizedAdmin(user);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    console.log("[AdminGuard] logged-in email:", user.email);
    console.log("[AdminGuard] isAuthorizedAdmin:", authorized);
    if (authorized) {
      console.log("[AdminGuard] Admin session recognized; allowing /admin routes.");
    }
  }, [authorized, user]);

  useEffect(() => {
    if (loading) return;

    if (!user || !authorized) {
      router.replace("/auth/sign-in");
      return;
    }

    if (authorized) {
      console.log("[AdminGuard] Admin user is authenticated on an admin route.");
    }
  }, [authorized, loading, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 shadow-2xl shadow-blue-950/30">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!user || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-5 text-center shadow-2xl shadow-rose-950/20">
          <ShieldAlert className="mx-auto h-8 w-8 text-rose-300" aria-hidden="true" />
          <h1 className="mt-3 text-lg font-semibold text-white">Admin access required</h1>
          <p className="mt-2 text-sm text-rose-100/80">
            This account is not authorized to open the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
