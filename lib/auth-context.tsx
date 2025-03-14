"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth, getUserWithRole, type User, signOutUser } from "@/lib/firebase/auth"
import { useToast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const toastActionRef = useRef<{ action: string; message?: string } | null>(null)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get user with role from Firestore
          const userWithRole = await getUserWithRole(firebaseUser)
          setUser(userWithRole)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error in auth state change", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // Handle toast notifications outside of render phase
  useEffect(() => {
    if (toastActionRef.current) {
      const { action, message } = toastActionRef.current
      
      switch (action) {
        case "signedOut":
          toast({
            title: "Signed out",
            description: "You have been signed out successfully",
          })
          break
        case "error":
          toast({
            title: "Error",
            description: message || "An error occurred",
            variant: "destructive",
          })
          break
      }
      
      toastActionRef.current = null
    }
  }, [toast])

  const handleSignOut = async () => {
    try {
      await signOutUser()
      toastActionRef.current = { action: "signedOut" }
    } catch (error) {
      console.error("Error signing out", error)
      toastActionRef.current = { 
        action: "error", 
        message: "Failed to sign out" 
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

