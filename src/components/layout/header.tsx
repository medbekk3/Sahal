"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, Map, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { ar } from "@/lib/i18n/ar";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Map className="h-5 w-5 text-primary" />
          {ar.brand}
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="ms-1 h-4 w-4" />
                  {ar.dashboard}
                </Link>
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName} />
                <AvatarFallback>{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut className="ms-1 h-4 w-4" />
                {ar.signOut}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/sign-in">{ar.signIn}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">{ar.getStarted}</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
