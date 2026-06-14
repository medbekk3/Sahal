"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile } from "@/domain/entities/user";
import type { IAuthService } from "@/domain/services/auth-service";
import { container } from "@/infrastructure/di/container";
import { signInUseCase } from "@/application/use-cases/auth/sign-in";
import { signUpUseCase } from "@/application/use-cases/auth/sign-up";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const authService = useMemo<IAuthService>(() => container.getAuthService(), []);

  useEffect(() => {
    try {
      const unsubscribe = authService.onAuthStateChanged((profile) => {
        setUser(profile);
        setLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error(
        error instanceof Error
          ? error.message
          : "Unable to initialize Firebase authentication."
      );
      setUser(null);
      setLoading(false);
    }
  }, [authService]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const profile = await signInUseCase(authService, { email, password });
      setUser(profile);
    },
    [authService]
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const profile = await signUpUseCase(authService, { email, password, displayName });
      setUser(profile);
    },
    [authService]
  );

  const signInWithGoogle = useCallback(async () => {
    const profile = await authService.signInWithGoogle();
    setUser(profile);
  }, [authService]);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, [authService]);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signInWithGoogle, signOut }),
    [user, loading, signIn, signUp, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
