export interface RegisterUserInput {
  email: string;
  password: string;
  displayName: string;
  phone?: string | null;
  role?: string;
}

export interface UserProfileResult {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone: string | null;
  role: string;
  status: string;
  isActive: boolean;
  fcmToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function registerUser(input: RegisterUserInput): Promise<UserProfileResult>;
export function getUserProfile(userId: string): Promise<UserProfileResult | null>;
export function getCurrentUserProfile(): Promise<UserProfileResult | null>;
export function updateUserProfile(
  userId: string,
  updates: Partial<
    Pick<UserProfileResult, "displayName" | "photoURL" | "phone" | "role" | "status" | "isActive" | "fcmToken">
  >
): Promise<UserProfileResult | null>;
