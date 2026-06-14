"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Mail, Phone, Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserProfile, updateUserProfile } from "@/services/userService";

export default function PassengerProfileEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user?.id) {
        if (active) setLoading(false);
        return;
      }

      try {
        const profile = await getCurrentUserProfile();

        if (!active) return;

        setDisplayName(profile?.displayName ?? user.displayName ?? "");
        setPhone(profile?.phone ?? "");
        setEmail(profile?.email ?? user.email ?? "");
        setStatus(profile?.status ?? "active");
      } catch (error) {
        if (!active) return;
        toast({
          variant: "destructive",
          title: "تعذر تحميل الملف الشخصي",
          description: error instanceof Error ? error.message : "حدث خطأ غير متوقع.",
        });
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [toast, user?.displayName, user?.email, user?.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "لا يوجد مستخدم مسجل",
        description: "يجب تسجيل الدخول أولاً.",
      });
      return;
    }

    setSaving(true);

    try {
      await updateUserProfile(user.id, {
        displayName: displayName.trim(),
        phone: phone.trim() || null,
      });

      toast({
        title: "تم حفظ التغييرات",
        description: "تم تحديث بياناتك بنجاح.",
      });

      router.replace("/passenger/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "فشل الحفظ",
        description: error instanceof Error ? error.message : "تعذر تحديث الملف الشخصي.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Button
          asChild
          variant="ghost"
          className="mb-4 h-10 rounded-full px-3 text-slate-200 hover:bg-white/10 hover:text-white"
        >
          <Link href="/passenger/dashboard">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            العودة
          </Link>
        </Button>

        <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center justify-end gap-2 text-right text-white">
              <span>تعديل الملف الشخصي</span>
              <UserRound className="h-5 w-5 text-blue-300" aria-hidden="true" />
            </CardTitle>
            <CardDescription className="text-right text-slate-300">
              حدّث اسمك ورقم الهاتف   <span className="font-medium text-white"></span>  
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-300">
                <Loader2 className="me-2 h-5 w-5 animate-spin" />
                جاري تحميل البيانات...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="flex items-center justify-end gap-2 text-white">
                      الاسم الكامل
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      className="h-12 border-white/15 bg-white/10 text-white placeholder:text-slate-400"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center justify-end gap-2 text-white">
                      رقم الهاتف
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="h-12 border-white/15 bg-white/10 text-white placeholder:text-slate-400"
                      placeholder="رقم الهاتف"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center justify-end gap-2 text-white">
                      البريد الإلكتروني
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    </Label>
                    <Input
                      id="email"
                      value={email}
                      readOnly
                      className="h-12 cursor-not-allowed border-white/10 bg-white/5 text-slate-300"
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-right">
                    <p className="text-xs text-slate-400">حالة الحساب</p>
                    <p className="mt-1 text-sm font-medium text-white">{status}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-full border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                    onClick={() => router.replace("/passenger/dashboard")}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-11 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    حفظ التغييرات
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
