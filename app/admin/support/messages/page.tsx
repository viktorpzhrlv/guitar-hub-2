"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { MessageSquare, MessageCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getUserConversations } from "@/lib/firebase/messages"
import type { Conversation } from "@/lib/types"
import AdminLayout from "@/components/layout/admin-layout"

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Get conversations where admin is a participant
      // Note: In your implementation, admins use the ID "admin"
      const data = await getUserConversations("admin")
      setConversations(data)
    } catch (error) {
      console.error("Error loading conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load user conversations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getUserName = (conversation: Conversation) => {
    // The admin ID is "admin", so find the other participant
    const userId = conversation.participants.find(id => id !== "admin") || ""
    return conversation.participantNames[userId] || "Unknown User"
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Messages</h1>
        <Button onClick={loadConversations}>Refresh</Button>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>User Support Conversations</CardTitle>
            <CardDescription>View and respond to user inquiries</CardDescription>
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
                <h3 className="mb-1 text-lg font-medium">No Messages</h3>
                <p className="text-muted-foreground">
                  No users have sent messages to admin support yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conversation) => {
                  const userName = getUserName(conversation)
                  const unreadCount = conversation.unreadCount["admin"] || 0
                  
                  return (
                    <Link
                      key={conversation.id}
                      href={`/admin/support/messages/${conversation.id}`}
                      className="flex items-center gap-4 p-4 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{userName}</h3>
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
    </AdminLayout>
  )
}