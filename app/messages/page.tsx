"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { MessageSquare, MessageCircle, UserCog, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getUserConversations, getOrCreateAdminConversation } from "@/lib/firebase/messages"
import type { Conversation } from "@/lib/types"
import ProtectedRoute from "@/components/auth/protected-route"

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await getUserConversations(user.uid)
      setConversations(data)
    } catch (error) {
      console.error("Error loading conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load your conversations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMessageAdmin = async () => {
    if (!user) return

    try {
      const adminConversation = await getOrCreateAdminConversation(user.uid, user.displayName || "User")
      router.push(`/messages/${adminConversation.id}`)
    } catch (error) {
      console.error("Error creating admin conversation:", error)
      toast({
        title: "Error",
        description: "Failed to start conversation with admin",
        variant: "destructive",
      })
    }
  }

  const getOtherParticipantName = (conversation: Conversation) => {
    if (!user) return ""
    const otherParticipantId = conversation.participants.find(id => id !== user.uid) || ""
    return conversation.participantNames[otherParticipantId] || "Unknown User"
  }

  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="mt-1 text-muted-foreground">Manage your conversations with sellers and buyers</p>
          </div>
          <Button onClick={handleMessageAdmin}>
            <UserCog className="mr-2 h-4 w-4" />
            Message Admin
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Conversations</CardTitle>
              <CardDescription>View and manage your conversations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-md">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[300px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <MessageCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">No Conversations Found</h3>
                  <p className="text-muted-foreground">
                    You don't have any conversations yet. Visit a product page to message a seller.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conversation) => {
                    const otherParticipantName = getOtherParticipantName(conversation)
                    const unreadCount = user ? (conversation.unreadCount[user.uid] || 0) : 0
                    
                    return (
                      <Link
                        key={conversation.id}
                        href={`/messages/${conversation.id}`}
                        className="flex items-center gap-4 p-4 border rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Users className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{otherParticipantName}</h3>
                            <span className="text-xs text-muted-foreground">
                              {conversation.lastMessageTime?.toDate
                                ? format(new Date(conversation.lastMessageTime.toDate()), "PPp")
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                            {unreadCount > 0 && (
                              <Badge className="ml-2">{unreadCount}</Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}