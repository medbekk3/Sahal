import type { UserRole } from "@/domain/entities/shared";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone: string | null;
  role: UserRole;
  status: "active" | "pending" | "suspended" | "inactive";
  isActive: boolean;
  fcmToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProfileInput {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  phone?: string | null;
  role?: UserRole;
  status?: "active" | "pending" | "suspended" | "inactive";
}

export interface UpdateUserProfileInput {
  displayName?: string;
  photoURL?: string | null;
  phone?: string | null;
  role?: UserRole;
  status?: "active" | "pending" | "suspended" | "inactive";
  isActive?: boolean;
  fcmToken?: string | null;
}
