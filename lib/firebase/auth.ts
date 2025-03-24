import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { app, db } from "./config"
import { unstable_noStore } from 'next/cache';

export const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// User roles
export type UserRole = "user" | "admin"

// Extended user type with role
export interface User extends FirebaseUser {
  role?: UserRole
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
}

// Sign in with Google
export const signInWithGoogle = async () => {
  return signInWithPopup(auth, googleProvider)
}

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  // Update profile with display name
  await updateProfile(userCredential.user, { displayName })

  // Create user document in Firestore with default role
  await createUserDocument(userCredential.user, { role: "user" })

  return userCredential
}

// Sign out
export const signOutUser = async () => {
  return signOut(auth)
}

// Reset password
export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email)
}

// Create or update user document in Firestore
export const createUserDocument = async (user: FirebaseUser, additionalData?: any) => {
  if (!user) return

  const userRef = doc(db, "users", user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user

    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        createdAt: serverTimestamp(),
        ...additionalData,
      })
    } catch (error) {
      console.error("Error creating user document", error)
    }
  }

  return userRef
}

// Get user document with role
export const getUserWithRole = async (user: FirebaseUser): Promise<User | null> => {
  unstable_noStore();
  if (!user) return null

  try {
    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      return {
        ...user,
        role: userData.role || "user",
      } as User
    }

    // If user document doesn't exist, create it with default role
    await createUserDocument(user, { role: "user" })
    return { ...user, role: "user" } as User
  } catch (error) {
    console.error("Error getting user document", error)
    return null
  }
}

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin"
}

