"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { CartItem } from "./types"
import { useToast } from "@/components/ui/use-toast"

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { toast } = useToast()
  
  // Refs to track actions for toast notifications
  const toastActionRef = useRef<{ action: string; itemName?: string } | null>(null)

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  // Handle toast notifications outside of render phase
  useEffect(() => {
    if (toastActionRef.current) {
      const { action, itemName } = toastActionRef.current
      
      switch (action) {
        case "added":
          toast({
            title: "Added to cart",
            description: `${itemName} added to your cart.`,
          })
          break
        case "alreadyExists":
          toast({
            title: "Already in cart",
            description: `${itemName} is already in your cart.`,
          })
          break
        case "removed":
          toast({
            title: "Removed from cart",
            description: `${itemName} removed from your cart.`,
          })
          break
        case "cleared":
          toast({
            title: "Cart cleared",
            description: "All items have been removed from your cart.",
          })
          break
      }
      
      toastActionRef.current = null
    }
  }, [items, toast])

  const addItem = (newItem: Omit<CartItem, "id">) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItem = prevItems.find((item) => item.productId === newItem.productId)
      if (existingItem) {
        // If item already exists, don't add it again
        toastActionRef.current = { action: "alreadyExists", itemName: newItem.name }
        return prevItems
      } else {
        // Add new item with a unique id
        const itemWithId = {
          ...newItem,
          id: `${newItem.productId}-${Date.now()}`,
        }
        toastActionRef.current = { action: "added", itemName: newItem.name }
        return [...prevItems, itemWithId]
      }
    })
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === id)
      if (itemToRemove) {
        toastActionRef.current = { action: "removed", itemName: itemToRemove.name }
      }
      return prevItems.filter((item) => item.id !== id)
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
    toastActionRef.current = { action: "cleared" }
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

