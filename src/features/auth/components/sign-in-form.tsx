"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import { getFirebaseAuth } from "@/infrastructure/firebase/config";
import {
  isAdminEmail,
  redirectUserByRole,
  ROLE_REDIRECT_PATHS,
} from "@/features/auth/hooks/use-role-based-redirect";
import { signInSchema } from "@/lib/validators/auth";
import { useToast } from "@/hooks/use-toast";
import { ar } from "@/lib/i18n/ar";

export function SignInForm() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "خطأ في التحقق",
        description: parsed.error.errors[0]?.message,
      });
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      const user = getFirebaseAuth().currentUser;
      if (user) {
        if (isAdminEmail(user.email)) {
          router.replace(ROLE_REDIRECT_PATHS.admin);
        } else {
          await redirectUserByRole(router, user, "replace");
        }
      } else {
        router.replace("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول",
        description: error instanceof Error ? error.message : "حاول مرة أخرى",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signInWithGoogle();
      const user = getFirebaseAuth().currentUser;
      if (user) {
        if (isAdminEmail(user.email)) {
          router.replace(ROLE_REDIRECT_PATHS.admin);
        } else {
          await redirectUserByRole(router, user, "replace");
        }
      } else {
        router.replace("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول عبر Google",
        description: error instanceof Error ? error.message : "حاول مرة أخرى",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">كلمة المرور</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "جارٍ تسجيل الدخول..." : ar.signIn}
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
        المتابعة باستخدام Google
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ليس لديك حساب؟{" "}
        <Link href="/auth/sign-up" className="text-primary underline-offset-4 hover:underline">
          {ar.signUp}
        </Link>
      </p>
    </motion.form>
  );
}
