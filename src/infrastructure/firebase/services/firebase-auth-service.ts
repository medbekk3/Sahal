import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  browserLocalPersistence,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import type { IAuthService } from "@/domain/services/auth-service";
import type { UserProfile } from "@/domain/entities/user";
import { getFirebaseAuth } from "../config";
import type { IUserRepository } from "@/domain/repositories/user-repository";
import type { IPassengerRepository } from "@/domain/repositories/passenger-repository";
import { isAdminEmail } from "@/features/auth/hooks/use-role-based-redirect";

function mapFirebaseUser(user: User): UserProfile {
  return {
    id: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "",
    photoURL: user.photoURL,
    phone: null,
    role: "passenger",
    status: "active",
    isActive: true,
    fcmToken: null,
    createdAt: new Date(user.metadata.creationTime ?? Date.now()),
    updatedAt: new Date(),
  };
}

export class FirebaseAuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passengerRepository?: IPassengerRepository
  ) {}

  async signIn(credentials: { email: string; password: string }): Promise<UserProfile> {
    await setPersistence(getFirebaseAuth(), browserLocalPersistence);
    const result = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      credentials.email,
      credentials.password
    );
    return this.resolveProfile(result.user);
  }

  async signUp(credentials: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<UserProfile> {
    const result = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      credentials.email,
      credentials.password
    );

    const profile = await this.userRepository.create({
      id: result.user.uid,
      email: credentials.email,
      displayName: credentials.displayName,
      photoURL: result.user.photoURL,
      role: "passenger",
    });

    await this.ensurePassengerProfile(result.user.uid);
    return profile;
  }

  async signInWithGoogle(): Promise<UserProfile> {
    await setPersistence(getFirebaseAuth(), browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(getFirebaseAuth(), provider);
    const existing = await this.userRepository.getById(result.user.uid);

    if (!existing) {
      const role = isAdminEmail(result.user.email) ? "admin" : "passenger";
      const profile = await this.userRepository.create({
        id: result.user.uid,
        email: result.user.email ?? "",
        displayName: result.user.displayName ?? "User",
        photoURL: result.user.photoURL,
        role,
      });
      await this.ensurePassengerProfile(result.user.uid);
      return profile;
    }

    return existing;
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(getFirebaseAuth());
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const user = getFirebaseAuth().currentUser;
    if (!user) return null;
    return this.resolveProfile(user);
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
   return firebaseOnAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }
      const profile = await this.resolveProfile(firebaseUser);
      callback(profile);
    });
  }

  private async resolveProfile(user: User): Promise<UserProfile> {
    const stored = await this.userRepository.getById(user.uid);
    if (stored) return stored;
    return mapFirebaseUser(user);
  }

  private async ensurePassengerProfile(userId: string): Promise<void> {
    if (!this.passengerRepository) return;
    const existing = await this.passengerRepository.getByUserId(userId);
    if (!existing) {
      await this.passengerRepository.create({ userId });
    }
  }
}
