"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getConversationById, getConversationMessages, sendMessage, markMessagesAsRead } from "@/lib/firebase/messages"
import type { Conversation, Message } from "@/lib/types"
import ProtectedRoute from "@/components/auth/protected-route"
import React from "react"

interface ConversationPageProps {
  params: {
    id: string
  }
}

export default function ConversationPage({ params }: ConversationPageProps) {
  // Properly type and unwrap params
  const unwrappedParams = React.use(params as unknown as Promise<{ id: string }>);
  const conversationId = unwrappedParams.id;
  
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  useEffect(() => {
    if (user) {
      loadConversation()
      
      // Poll for new messages every 10 seconds
      pollRef.current = setInterval(() => {
        if (user) loadMessages()
      }, 10000)
    }
    
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
      }
    }
  }, [user, conversationId])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const loadConversation = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const conversationData = await getConversationById(conversationId)
      if (!conversationData) {
        toast({
          title: "Грешка",
          description: "Разговорът не е намерен",
          variant: "destructive",
        })
        router.push("/messages")
        return
      }
      
      // Verify user is a participant
      if (!conversationData.participants.includes(user.uid)) {
        toast({
          title: "Неоторизиран",
          description: "Нямате разрешение да преглеждате този разговор",
          variant: "destructive",
        })
        router.push("/messages")
        return
      }
      
      setConversation(conversationData)
      await loadMessages()
      
      // Mark messages as read when entering the conversation
      await markMessagesAsRead(conversationId, user.uid)
    } catch (error) {
      console.error("Грешка при зареждане на разговор:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на разговор",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadMessages = async () => {
    if (!user) return
    
    try {
      const messagesData = await getConversationMessages(conversationId)
      setMessages(messagesData.reverse()) // Reverse to show newest at the bottom
      // Mark messages as read when loading messages
      await markMessagesAsRead(conversationId, user.uid)
    } catch (error) {
      console.error("Грешка при зареждане на съобщения:", error)
    }
  }
  
  const handleSendMessage = async () => {
    if (!user || !conversation || !newMessage.trim()) return
    
    setIsSending(true)
    try {
      const otherParticipantId = conversation.participants.find(id => id !== user.uid) || ""
      
      if (!otherParticipantId) {
        toast({
          title: "Грешка",
          description: "Не може да се определи получателя",
          variant: "destructive",
        })
        return
      }
      
      await sendMessage(
        conversationId,
        user.uid,
        user.displayName || "Вие",
        otherParticipantId,
        newMessage.trim()
      )
      
      setNewMessage("")
      await loadMessages()
    } catch (error) {
      console.error("Грешка при изпращане на съобщение:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно изпращане на съобщение",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  const getOtherParticipantName = () => {
    if (!user || !conversation) return ""
    const otherParticipantId = conversation.participants.find(id => id !== user.uid) || ""
    return conversation.participantNames[otherParticipantId] || "Непознат потребител"
  }
  
  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => router.push("/messages")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-40" /> : getOtherParticipantName()}
          </h1>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="h-[60vh] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg ${index % 2 === 0 ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[100px] mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Все още няма съобщения. Започнете разговор!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = user?.uid === message.senderId
                      
                      return (
                        <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                          <div 
                            className={`max-w-[70%] p-3 rounded-lg ${
                              isOwnMessage 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            }`}
                          >
                            <p>{message.text}</p>
                            <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                              {message.timestamp?.toDate 
                                ? format(new Date(message.timestamp.toDate()), "p") 
                                : ""}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Напишете вашето съобщение..."
                    disabled={isLoading || isSending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || isSending || !newMessage.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Изпрати
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}