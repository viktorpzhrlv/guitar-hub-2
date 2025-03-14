import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where,
} from "firebase/firestore"
import { db } from "./config"
import type { Category } from "@/lib/types"

const categoriesCollection = collection(db, "categories")

export async function getCategories(): Promise<Category[]> {
  const q = query(categoriesCollection, orderBy("name", "asc"))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[]
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const docRef = doc(db, "categories", id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Category
  }

  return null
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const q = query(categoriesCollection, where("slug", "==", slug))

  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data(),
  } as Category
}

export async function createCategory(categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) {
  return addDoc(categoriesCollection, {
    ...categoryData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateCategory(
  id: string,
  categoryData: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>,
) {
  const docRef = doc(db, "categories", id)
  return updateDoc(docRef, {
    ...categoryData,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCategory(id: string) {
  const docRef = doc(db, "categories", id)
  return deleteDoc(docRef)
}

