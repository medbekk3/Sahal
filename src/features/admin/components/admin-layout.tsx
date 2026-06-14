"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  LayoutDashboard,
  Landmark,
  ReceiptText,
  Route,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminLayoutProps = {
  children: ReactNode;
};

const navigation = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/drivers", label: "Drivers Management", icon: Users },
  { href: "/admin/passengers", label: "Passengers Management", icon: Shield },
  { href: "/admin/rides", label: "Rides Management", icon: ReceiptText },
  { href: "/admin/pricing-routes", label: "Pricing & Routes", icon: Route },
  { href: "/admin/financials", label: "Financials", icon: Wallet },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1800px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-slate-800/80 bg-slate-950/95 px-4 py-5 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:px-5">
          <div className="flex items-center gap-3 rounded-2xl border border-blue-500/15 bg-blue-500/10 px-4 py-3 shadow-lg shadow-blue-950/20">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Landmark className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-blue-200">Sahal</p>
              <h1 className="text-lg font-semibold text-white">Admin Console</h1>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {navigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition",
                    active
                      ? "border-blue-500/20 bg-blue-500/15 text-white shadow-lg shadow-blue-950/20"
                      : "border-transparent text-slate-300 hover:border-slate-800 hover:bg-slate-900/80 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-blue-300" : "text-slate-400")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Platform</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-blue-400" />
                  Fixed fares
                </span>
                <span className="text-slate-400">Live</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-400" />
                  Driver debt tracking
                </span>
                <span className="text-slate-400">Live</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-4 shadow-2xl shadow-slate-950/40 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
