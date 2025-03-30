"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getOrCreateConversation } from "@/lib/firebase/messages"
import type { Product } from "@/lib/types"

interface MessageSellerButtonProps {
  product: Product
}

export default function MessageSellerButton({ product }: MessageSellerButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleMessageSeller = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to message the seller",
        variant: "destructive",
      })
      router.push(`/auth/login?redirect=/product/${product.id}`)
      return
    }

    // Prevent messaging yourself
    if (user.uid === product.sellerId) {
      toast({
        title: "Cannot message yourself",
        description: "You can't message your own listing",
      })
      return
    }

    setIsLoading(true)
    try {
      if (!product.sellerId || !product.sellerName) {
        throw new Error("Seller information not available")
      }

      const conversation = await getOrCreateConversation(
        user.uid,
        product.sellerId,
        user.displayName || "You",
        product.sellerName
      )

      router.push(`/messages/${conversation.id}`)
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Error",
        description: "Failed to start conversation with seller",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleMessageSeller} 
      disabled={isLoading || (user?.uid === product.sellerId)}
      className="w-full mt-2"
    >
      <MessageSquare className="mr-2 h-4 w-4" />
      {isLoading ? "Starting conversation..." : "Message Seller"}
    </Button>
  )
}