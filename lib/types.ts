import type { Timestamp } from "firebase/firestore"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  status: "available" | "unavailable"
  specifications: Record<string, string>
  createdAt: Timestamp
  updatedAt: Timestamp
  sellerId?: string
  sellerName?: string
  approvalStatus: "pending" | "approved" | "rejected"
  adminNotes?: string
}

export interface Category {
  id: string
  name: string
  description: string
  image: string
  slug: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerAddress: string
  items: CartItem[]
  total: number
  status: "pending" | "completed"
  createdAt: Timestamp
}

