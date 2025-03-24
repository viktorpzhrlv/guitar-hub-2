import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, FirestoreSettings } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const storage = getStorage(app)

// Function to help revalidate paths in production
export const revalidatePath = async (path: string) => {
  // Only run in production
  if (process.env.NODE_ENV === 'production') {
    try {
      // Attempt to revalidate the path using Next.js API
      await fetch(`/api/revalidate?path=${path}`, {
        method: 'POST',
      });
      console.log(`Revalidated path: ${path}`);
    } catch (error) {
      console.error(`Failed to revalidate path: ${path}`, error);
    }
  }
};

export { app, db, storage }

