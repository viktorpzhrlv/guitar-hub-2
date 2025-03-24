import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db, revalidatePath } from "./config"
import type { Product } from "@/lib/types"

const productsCollection = collection(db, "products")

export async function getProducts(): Promise<Product[]> {
  const q = query(
    productsCollection,
    where("status", "==", "available"),
    where("approvalStatus", "==", "approved"),
    orderBy("createdAt", "desc"),
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[]
}

export async function getFeaturedProducts(count = 8): Promise<Product[]> {
  const q = query(
    productsCollection,
    where("status", "==", "available"),
    where("approvalStatus", "==", "approved"),
    orderBy("createdAt", "desc"),
    limit(count),
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[]
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const q = query(
    productsCollection,
    where("category", "==", category),
    where("status", "==", "available"),
    where("approvalStatus", "==", "approved"),
    orderBy("createdAt", "desc"),
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[]
}

export async function getProductById(id: string): Promise<Product | null> {
  const docRef = doc(db, "products", id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Product
  }

  return null
}

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  const q = query(productsCollection, where("sellerId", "==", sellerId), orderBy("createdAt", "desc"))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[]
}

export async function getPendingProducts(): Promise<Product[]> {
  const q = query(productsCollection, where("approvalStatus", "==", "pending"), orderBy("createdAt", "desc"))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[]
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  // Get all approved and available products
  const q = query(productsCollection, where("status", "==", "available"), where("approvalStatus", "==", "approved"))

  const snapshot = await getDocs(q)
  const products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[]

  // Perform client-side search (Firestore doesn't support full-text search)
  const normalizedSearchTerm = searchTerm.toLowerCase().trim()

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(normalizedSearchTerm) ||
      product.description.toLowerCase().includes(normalizedSearchTerm) ||
      (product.specifications &&
        Object.values(product.specifications).some((value) => value.toLowerCase().includes(normalizedSearchTerm))),
  )
}

export async function createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">) {
  const result = await addDoc(productsCollection, {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  
  // Revalidate paths
  await revalidatePath('/admin/products')
  await revalidatePath('/')
  if (productData.category) {
    await revalidatePath(`/category/${productData.category}`)
  }
  
  return result
}

export async function updateProduct(id: string, productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>) {
  const docRef = doc(db, "products", id)
  const result = await updateDoc(docRef, {
    ...productData,
    updatedAt: serverTimestamp(),
  })
  
  // Revalidate paths
  await revalidatePath('/admin/products')
  await revalidatePath(`/product/${id}`)
  await revalidatePath('/')
  if (productData.category) {
    await revalidatePath(`/category/${productData.category}`)
  }
  
  return result
}

export async function approveProduct(id: string, adminNotes?: string) {
  const docRef = doc(db, "products", id)
  const product = await getProductById(id)
  
  const result = await updateDoc(docRef, {
    approvalStatus: "approved",
    adminNotes: adminNotes || "",
    updatedAt: serverTimestamp(),
  })
  
  // Revalidate paths
  await revalidatePath('/admin/approvals')
  await revalidatePath('/admin/products')
  await revalidatePath(`/product/${id}`)
  await revalidatePath('/')
  if (product?.category) {
    await revalidatePath(`/category/${product.category}`)
  }
  
  return result
}

export async function rejectProduct(id: string, adminNotes?: string) {
  const docRef = doc(db, "products", id)
  const result = await updateDoc(docRef, {
    approvalStatus: "rejected",
    adminNotes: adminNotes || "",
    updatedAt: serverTimestamp(),
  })
  
  // Revalidate paths
  await revalidatePath('/admin/approvals')
  await revalidatePath('/admin/products')
  await revalidatePath(`/product/${id}`)
  
  return result
}

export async function deleteProduct(id: string) {
  const docRef = doc(db, "products", id)
  const product = await getProductById(id)
  const result = await deleteDoc(docRef)
  
  // Revalidate paths
  await revalidatePath('/admin/products')
  await revalidatePath('/')
  if (product?.category) {
    await revalidatePath(`/category/${product.category}`)
  }
  
  return result
}

