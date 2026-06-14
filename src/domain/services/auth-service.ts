import type { UserProfile } from "@/domain/entities/user";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface IAuthService {
  signIn(credentials: AuthCredentials): Promise<UserProfile>;
  signUp(credentials: AuthCredentials & { displayName: string }): Promise<UserProfile>;
  signInWithGoogle(): Promise<UserProfile>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void;
}
