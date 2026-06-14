import type { DocumentData } from "firebase/firestore";
import type {
  CreateUserProfileInput,
  UserProfile,
} from "@/domain/entities/user";
import type { UserRole } from "@/domain/entities/shared";
import { toRequiredDate } from "@/infrastructure/firebase/utils/firestore-utils";

export function mapUserFromFirestore(id: string, data: DocumentData): UserProfile {
  return {
    id,
    email: data.email ?? "",
    displayName: data.displayName ?? "",
    photoURL: data.photoURL ?? null,
    phone: data.phone ?? null,
    role: (data.role as UserRole) ?? "passenger",
    status: data.status ?? (data.isActive === false ? "inactive" : "active"),
    isActive: data.isActive ?? true,
    fcmToken: data.fcmToken ?? null,
    createdAt: toRequiredDate(data.createdAt),
    updatedAt: toRequiredDate(data.updatedAt),
  };
}

export function mapUserToFirestore(input: CreateUserProfileInput): DocumentData {
  const now = new Date();
  return {
    email: input.email,
    displayName: input.displayName,
    photoURL: input.photoURL ?? null,
    phone: input.phone ?? null,
    role: input.role ?? "passenger",
    status: input.status ?? "active",
    isActive: (input.status ?? "active") === "active",
    fcmToken: null,
    createdAt: now,
    updatedAt: now,
  };
}
