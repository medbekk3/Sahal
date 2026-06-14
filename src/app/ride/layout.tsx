"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export default function RideLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/sign-in");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div dir="rtl" className="container mx-auto flex flex-1 items-center justify-center px-4 py-24">
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      </div>
    );
  }

  return <div dir="rtl">{children}</div>;
}
