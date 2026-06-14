"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  isAdminEmail,
  redirectUserByRole,
  ROLE_REDIRECT_PATHS,
} from "@/features/auth/hooks/use-role-based-redirect";
import { getFirebaseAuth } from "@/infrastructure/firebase/config";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await setPersistence(getFirebaseAuth(), browserLocalPersistence);
      const result = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      if (isAdminEmail(result.user.email)) {
        router.replace(ROLE_REDIRECT_PATHS.admin);
      } else {
        await redirectUserByRole(router, result.user, "replace");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Check your email and password.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#2563eb,_transparent_35%),linear-gradient(135deg,_#111827,_#1e3a8a_50%,_#111827)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-blue-100">Access your SAHAL dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-white">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="border-white/15 bg-white/10 text-white placeholder:text-blue-100 focus-visible:ring-blue-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2 text-white">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="border-white/15 bg-white/10 text-white placeholder:text-blue-100 focus-visible:ring-blue-300"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-white text-blue-950 shadow-lg hover:bg-blue-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-blue-100">
          No account?{" "}
          <Link href="/auth/sign-up" className="font-medium text-white underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
