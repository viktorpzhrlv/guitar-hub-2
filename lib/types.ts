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
  sellerId?: string
  sellerName?: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerAddress: string
  customerPhone?: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  notes?: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  text: string
  read: boolean
  timestamp: Timestamp
}

export interface Conversation {
  id: string
  participants: string[]
  participantNames: Record<string, string>
  lastMessage: string
  lastMessageTime: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
  unreadCount: Record<string, number>
}

