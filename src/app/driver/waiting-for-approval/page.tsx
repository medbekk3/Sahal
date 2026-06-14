"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, FileCheck2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

const REVIEW_STEPS = [
  {
    title: "تم إرسال الطلب",
    description: "تم حفظ بيانات حسابك ومركبتك بنجاح.",
    icon: CheckCircle2,
  },
  {
    title: "الوثائق قيد المراجعة",
    description: "سيقوم المشرف بالتحقق من بطاقة الهوية ورخصة القيادة وصورة المركبة.",
    icon: FileCheck2,
  },
  {
    title: "بانتظار الموافقة",
    description: "عند الموافقة ستنتقل مباشرة إلى لوحة تحكم السائق.",
    icon: Clock,
  },
];

export default function WaitingForApprovalPage() {
  const { signOut, user } = useAuth();

  return (
    <div dir="rtl" className="min-h-[calc(100vh-8rem)] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_30%),linear-gradient(180deg,_rgba(15,23,42,0.03),_transparent)] px-4 py-10">
      <div className="container mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">مراجعة السائق</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              بانتظار الموافقة
            </h1>
            <p className="max-w-xl text-muted-foreground">
              شكرًا{user?.displayName ? `، ${user.displayName}` : ""}. حساب السائق الخاص بك
              بانتظار موافقة الإدارة. لن تتمكن من الوصول إلى لوحة تحكم السائق النشطة حتى
              تتغير الحالة إلى &quot;نشط&quot;.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/">العودة إلى الصفحة الرئيسية</Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => signOut()}>
              تسجيل الخروج
            </Button>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardHeader className="bg-muted/40">
              <CardTitle>حالة المراجعة</CardTitle>
              <CardDescription>الحالة الحالية: بانتظار الموافقة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              {REVIEW_STEPS.map((step) => {
                const Icon = step.icon;

                return (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-sm font-medium">{step.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
