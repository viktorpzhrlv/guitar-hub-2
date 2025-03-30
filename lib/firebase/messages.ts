import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  where,
  updateDoc,
  Timestamp,
  limit,
} from "firebase/firestore"
import { db } from "./config"
import type { Message, Conversation } from "@/lib/types"
import { unstable_noStore } from 'next/cache';

const messagesCollection = collection(db, "messages")
const conversationsCollection = collection(db, "conversations")

// Get all conversations for a user
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  unstable_noStore();
  const q = query(
    conversationsCollection,
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Conversation[]
}

// Get a specific conversation by id
export async function getConversationById(id: string): Promise<Conversation | null> {
  unstable_noStore();
  const docRef = doc(conversationsCollection, id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Conversation
}

// Get or create a conversation between two users
export async function getOrCreateConversation(userId1: string, userId2: string, userName1: string, userName2: string): Promise<Conversation> {
  // Check if conversation already exists
  const q1 = query(
    conversationsCollection,
    where("participants", "array-contains", userId1)
  )

  const snapshot = await getDocs(q1)
  const existingConversation = snapshot.docs.find((doc) => {
    const data = doc.data()
    return data.participants.includes(userId2)
  })

  if (existingConversation) {
    return {
      id: existingConversation.id,
      ...existingConversation.data(),
    } as Conversation
  }

  // Create a new conversation
  const newConversation = {
    participants: [userId1, userId2],
    participantNames: {
      [userId1]: userName1,
      [userId2]: userName2
    },
    lastMessage: "",
    lastMessageTime: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    unreadCount: {
      [userId1]: 0,
      [userId2]: 0
    }
  }

  const docRef = await addDoc(conversationsCollection, newConversation)
  return {
    id: docRef.id,
    ...newConversation,
    lastMessageTime: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  } as Conversation
}

// Get or create conversation with admin
export async function getOrCreateAdminConversation(userId: string, userName: string): Promise<Conversation> {
  const adminId = "admin"
  return getOrCreateConversation(userId, adminId, userName, "Admin Support")
}

// Get messages for a conversation
export async function getConversationMessages(conversationId: string, limitCount = 50): Promise<Message[]> {
  unstable_noStore();
  const q = query(
    messagesCollection,
    where("conversationId", "==", conversationId),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Message[]
}

// Send a message
export async function sendMessage(conversationId: string, senderId: string, senderName: string, recipientId: string, text: string): Promise<Message> {
  // Create new message
  const newMessage = {
    conversationId,
    senderId,
    senderName,
    text,
    read: false,
    timestamp: serverTimestamp()
  }

  // Add message to database
  const docRef = await addDoc(messagesCollection, newMessage)
  
  // Update conversation with last message
  const conversationRef = doc(conversationsCollection, conversationId)
  await updateDoc(conversationRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    updatedAt: serverTimestamp(),
    [`unreadCount.${recipientId}`]: (await getUnreadCount(conversationId, recipientId)) + 1
  })

  return {
    id: docRef.id,
    ...newMessage,
    timestamp: Timestamp.now(),
  } as Message
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  // Get unread messages
  const q = query(
    messagesCollection,
    where("conversationId", "==", conversationId),
    where("senderId", "!=", userId),
    where("read", "==", false)
  )

  const snapshot = await getDocs(q)
  
  // Mark each message as read
  const promises = snapshot.docs.map((doc) => {
    const messageRef = doc.ref
    return updateDoc(messageRef, { read: true })
  })
  
  await Promise.all(promises)
  
  // Update unread count in conversation
  const conversationRef = doc(conversationsCollection, conversationId)
  await updateDoc(conversationRef, {
    [`unreadCount.${userId}`]: 0
  })
}

// Get unread count for a user in a conversation
export async function getUnreadCount(conversationId: string, userId: string): Promise<number> {
  const q = query(
    messagesCollection,
    where("conversationId", "==", conversationId),
    where("senderId", "!=", userId),
    where("read", "==", false)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.length
}

// Get total unread count for a user across all conversations
export async function getTotalUnreadCount(userId: string): Promise<number> {
  const conversations = await getUserConversations(userId)
  let totalUnread = 0
  
  for (const conversation of conversations) {
    totalUnread += conversation.unreadCount[userId] || 0
  }
  
  return totalUnread
}