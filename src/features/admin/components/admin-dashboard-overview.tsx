"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowRight, CarFront, CircleDollarSign, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminDashboardStats } from "@/features/admin/hooks/use-admin-dashboard-stats";

const numberFormatter = new Intl.NumberFormat("en-US");

function formatDzd(amount: number) {
  return `${numberFormatter.format(Math.round(amount))} DZD`;
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-36 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30"
        >
          <div className="h-4 w-24 animate-pulse rounded bg-slate-700/80" />
          <div className="mt-4 h-9 w-28 animate-pulse rounded bg-slate-700/80" />
          <div className="mt-4 h-3 w-36 animate-pulse rounded bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/80 text-slate-100 shadow-lg shadow-slate-950/30">
      <CardHeader className="space-y-4 pb-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-300">{title}</p>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
        <CardTitle className="text-3xl font-semibold tracking-tight text-white">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-slate-400">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardOverview() {
  const { stats, loading, error } = useAdminDashboardStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Overview</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-100">
            <Loader2 className="h-4 w-4 animate-spin" />
            Live data
          </div>
        </div>
        <OverviewSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Admin Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Live Firestore snapshot for rides, driver activity, platform earnings, and unpaid
            driver debt.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-100">
          <ShieldCheck className="h-4 w-4" />
          Live data
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Rides"
          value={numberFormatter.format(stats.totalRides)}
          description="All rides currently stored in Firestore."
          icon={CarFront}
        />
        <StatCard
          title="Active Drivers"
          value={numberFormatter.format(stats.activeDrivers)}
          description="Approved or online drivers available in the system."
          icon={ShieldCheck}
        />
        <StatCard
          title="Total Platform Earnings"
          value={formatDzd(stats.totalPlatformEarnings)}
          description="Collected commission from completed rides."
          icon={CircleDollarSign}
        />
        <StatCard
          title="Total Pending Debts"
          value={formatDzd(stats.totalPendingDebts)}
          description="Outstanding commission across all drivers."
          icon={Wallet}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-800 bg-slate-900/80 text-slate-100 shadow-lg shadow-slate-950/30">
          <CardHeader>
            <CardTitle className="text-white">Quick access</CardTitle>
            <CardDescription className="text-slate-400">
              Jump into the operational modules that keep the platform moving.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/admin/drivers", label: "Drivers Management" },
              { href: "/admin/passengers", label: "Passengers Management" },
              { href: "/admin/rides", label: "Rides Management" },
              { href: "/admin/pricing-routes", label: "Pricing & Routes" },
            ].map((item) => (
              <Button
                key={item.href}
                asChild
                variant="outline"
                className="justify-between border-slate-700 bg-slate-950/50 text-slate-100 hover:bg-slate-800"
              >
                <Link href={item.href}>
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-gradient-to-br from-blue-600/20 to-slate-900/80 text-slate-100 shadow-lg shadow-blue-950/20">
          <CardHeader>
            <CardTitle className="text-white">Operations note</CardTitle>
            <CardDescription className="text-blue-100/80">
              Keep commissions and fare rates aligned so every completed trip stays consistent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-200">
            <p>- Drivers can be settled from Financials once a manual payment is confirmed.</p>
            <p>- Fare updates in Pricing &amp; Routes are reflected in the passenger request flow.</p>
            <p>- Pending approval drivers remain blocked from the active dashboard until accepted.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
