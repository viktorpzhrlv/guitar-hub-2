"use client"

import Link from "next/link"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/auth/protected-route"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

// Zod схема за валидиране на профила
const profileSchema = z.object({
  displayName: z.string().min(2, "Името трябва да бъде поне 2 символа"),
  email: z.string().email("Моля, въведете валиден имейл адрес").optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
      phoneNumber: "",
      address: "",
    },
  })

  // Актуализиране на стойностите на формата, когато данните за потребителя се заредят
  useState(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
        email: user.email || "",
        phoneNumber: "",
        address: "",
      })
    }
  })

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return

    setIsLoading(true)
    try {
      // Актуализиране на показваното име във Firebase Auth
      await updateProfile(user, {
        displayName: data.displayName,
      })

      // Актуализиране на потребителския документ във Firestore
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        updatedAt: new Date(),
      })

      toast({
        title: "Профилът е обновен",
        description: "Вашият профил беше успешно обновен",
      })
    } catch (error: any) {
      console.error("Грешка при обновяване на профила:", error)
      toast({
        title: "Неуспешно обновяване",
        description: error.message || "Неуспешно обновяване на профила",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-3xl font-bold">Моят Профил</h1>

          <Card>
            <CardHeader>
              <CardTitle>Лична Информация</CardTitle>
              <CardDescription>Обновете вашата лична информация</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Пълно Име</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имейл</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефонен Номер</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Адрес</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Запазване..." : "Запази Промените"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Сигурност на Акаунта</CardTitle>
                <CardDescription>Управлявайте вашата парола и сигурността на акаунта</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" asChild>
                  <Link href="/auth/forgot-password">Смяна на Паролата</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
