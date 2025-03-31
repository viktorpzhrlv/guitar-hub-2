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
      console.error("Грешка при зареждане на разговори:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на вашите разговори",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMessageAdmin = async () => {
    if (!user) return

    try {
      const adminConversation = await getOrCreateAdminConversation(user.uid, user.displayName || "Потребител")
      router.push(`/messages/${adminConversation.id}`)
    } catch (error) {
      console.error("Грешка при създаване на разговор с администратор:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно започване на разговор с администратор",
        variant: "destructive",
      })
    }
  }

  const getOtherParticipantName = (conversation: Conversation) => {
    if (!user) return ""
    const otherParticipantId = conversation.participants.find(id => id !== user.uid) || ""
    return conversation.participantNames[otherParticipantId] || "Непознат потребител"
  }

  return (
    <ProtectedRoute>
      <div className="container py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Съобщения</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">Управлявайте вашите разговори с продавачи и купувачи</p>
          </div>
          <Button onClick={handleMessageAdmin} className="w-full sm:w-auto">
            <UserCog className="mr-2 h-4 w-4" />
            Съобщение до администратор
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Вашите разговори</CardTitle>
              <CardDescription>Преглеждайте и управлявайте вашите разговори</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-md">
                      <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
                      <div className="space-y-2 flex-1 min-w-0">
                        <Skeleton className="h-4 w-[150px] sm:w-[200px]" />
                        <Skeleton className="h-3 sm:h-4 w-[200px] sm:w-[300px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <MessageCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">Не са намерени разговори</h3>
                  <p className="text-muted-foreground text-sm px-4">
                    Все още нямате разговори. Посетете страницата на продукт, за да изпратите съобщение на продавач.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {conversations.map((conversation) => {
                    const otherParticipantName = getOtherParticipantName(conversation)
                    const unreadCount = user ? (conversation.unreadCount[user.uid] || 0) : 0
                    
                    return (
                      <Link
                        key={conversation.id}
                        href={`/messages/${conversation.id}`}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">{otherParticipantName}</h3>
                            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                              {conversation.lastMessageTime?.toDate
                                ? format(new Date(conversation.lastMessageTime.toDate()), "PPp")
                                : "Не е налично"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-muted-foreground truncate max-w-[70%]">
                              {conversation.lastMessage || "Все още няма съобщения"}
                            </p>
                            {unreadCount > 0 && (
                              <Badge className="ml-2 flex-shrink-0">{unreadCount}</Badge>
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