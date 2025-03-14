import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./config"
import type { CartItem } from "@/lib/types"

const ordersCollection = collection(db, "orders")

interface OrderData {
  customerName: string
  customerEmail: string
  customerAddress: string
  customerPhone?: string
  notes?: string
  items: CartItem[]
  total: number
  status: "pending" | "completed"
}

export async function createOrder(orderData: OrderData) {
  return addDoc(ordersCollection, {
    ...orderData,
    createdAt: serverTimestamp(),
  })
}

