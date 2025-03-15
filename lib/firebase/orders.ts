import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./config"
import type { CartItem, Order, OrderStatus } from "@/lib/types"

const ordersCollection = collection(db, "orders")

interface OrderData {
  customerId: string
  customerName: string
  customerEmail: string
  customerAddress: string
  customerPhone?: string
  notes?: string
  items: CartItem[]
  total: number
  status: OrderStatus
}

export async function createOrder(orderData: OrderData) {
  return addDoc(ordersCollection, {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getOrderById(id: string): Promise<Order | null> {
  const docRef = doc(db, "orders", id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Order
  }

  return null
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  const q = query(ordersCollection, where("customerId", "==", customerId), orderBy("createdAt", "desc"))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[]
}

export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  // This query is more complex because we need to find orders that contain items from this seller
  // First, get all orders
  const q = query(ordersCollection, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  // Then filter orders that contain items from this seller
  const orders = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[]

  return orders.filter((order) => order.items.some((item) => item.sellerId === sellerId))
}

export async function getAllOrders(): Promise<Order[]> {
  const q = query(ordersCollection, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[]
}

export async function updateOrderStatus(id: string, status: OrderStatus, notes?: string) {
  const docRef = doc(db, "orders", id)
  return updateDoc(docRef, {
    status,
    notes: notes || "",
    updatedAt: serverTimestamp(),
  })
}

