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
import { db, revalidatePath } from "./config"
import type { Category } from "@/lib/types"
import { unstable_noStore } from 'next/cache';

const categoriesCollection = collection(db, "categories")

export async function getCategories(): Promise<Category[]> {
  unstable_noStore(); // Disable caching for this data fetch
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
  unstable_noStore();
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
  const result = await addDoc(categoriesCollection, {
    ...categoryData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  
  // Revalidate paths that might show categories
  await revalidatePath('/admin/categories');
  await revalidatePath('/');
  
  return result;
}

export async function updateCategory(
  id: string,
  categoryData: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>,
) {
  const docRef = doc(db, "categories", id)
  const result = await updateDoc(docRef, {
    ...categoryData,
    updatedAt: serverTimestamp(),
  })
  
  // Revalidate paths that might show categories
  await revalidatePath('/admin/categories');
  await revalidatePath('/');
  if (categoryData.slug) {
    await revalidatePath(`/category/${categoryData.slug}`);
  }
  
  return result;
}

export async function deleteCategory(id: string) {
  const docRef = doc(db, "categories", id)
  const category = await getCategoryById(id);
  const result = await deleteDoc(docRef)
  
  // Revalidate paths
  await revalidatePath('/admin/categories');
  await revalidatePath('/');
  if (category?.slug) {
    await revalidatePath(`/category/${category.slug}`);
  }
  
  return result;
}

