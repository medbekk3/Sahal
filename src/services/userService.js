import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/infrastructure/firebase/config";

const USERS = "users";
const PASSENGERS = "passengers";

/**
 * Register a new user with Firebase Auth and create Firestore profiles.
 * @param {{ email: string, password: string, displayName: string, phone?: string, role?: string }} input
 */
export async function registerUser({ email, password, displayName, phone = null, role = "passenger" }) {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  if (displayName) {
    await updateProfile(user, { displayName });
  }

  const now = new Date();

  const userProfile = {
    email,
    displayName,
    photoURL: user.photoURL ?? null,
    phone,
    role,
    status: "active",
    isActive: true,
    fcmToken: null,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, USERS, user.uid), userProfile);

  if (role === "passenger" || role === "both") {
    await setDoc(doc(db, PASSENGERS, user.uid), {
      userId: user.uid,
      defaultPickupAddress: null,
      totalRides: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  return {
    id: user.uid,
    ...userProfile,
  };
}

/**
 * Fetch a user profile from Firestore.
 * @param {string} userId
 */
export async function getUserProfile(userId) {
  const db = getFirebaseDb();
  const snapshot = await getDoc(doc(db, USERS, userId));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    email: data.email ?? "",
    displayName: data.displayName ?? "",
    photoURL: data.photoURL ?? null,
    phone: data.phone ?? null,
    role: data.role ?? "passenger",
    status: data.status ?? (data.isActive === false ? "inactive" : "active"),
    isActive: data.isActive ?? true,
    fcmToken: data.fcmToken ?? null,
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
  };
}

/**
 * Get the currently signed-in user's profile.
 */
export async function getCurrentUserProfile() {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return getUserProfile(user.uid);
}

/**
 * Update user profile fields in Firestore.
 * @param {string} userId
 * @param {{ displayName?: string, photoURL?: string|null, phone?: string|null, role?: string, isActive?: boolean, fcmToken?: string|null }} updates
 */
export async function updateUserProfile(userId, updates) {
  const db = getFirebaseDb();
  const ref = doc(db, USERS, userId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
  return getUserProfile(userId);
}
