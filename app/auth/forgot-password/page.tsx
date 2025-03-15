"use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { resetPassword } from "@/lib/firebase/auth"

// Zod схема за валидация на формата за забравена парола
const forgotPasswordSchema = z.object({
  email: z.string().email("Моля, въведете валиден имейл адрес"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const { toast } = useToast()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)
    try {
      await resetPassword(data.email)
      setIsEmailSent(true)
      toast({
        title: "Имейл за нулиране е изпратен",
        description: "Проверете имейла си за връзка за нулиране на паролата",
      })
    } catch (error: any) {
      console.error("Грешка при нулиране на паролата:", error)
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно изпращане на имейл за нулиране",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Забравена парола</CardTitle>
          <CardDescription>Въведете вашия имейл адрес и ние ще ви изпратим връзка за нулиране на паролата</CardDescription>
        </CardHeader>
        <CardContent>
          {isEmailSent ? (
            <div className="space-y-4 text-center">
              <div className="rounded-full bg-primary/10 p-3 mx-auto w-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M22 7.99a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5Z" />
                  <path d="m7.7 12.7 2.6 2.6c.4.4 1 .4 1.4 0l7-7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Проверете имейла си</h3>
              <p className="text-muted-foreground">Изпратихме връзка за нулиране на паролата на вашия имейл адрес</p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Обратно към влизане</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имейл</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Изпращане..." : "Изпрати връзка за нулиране"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Спомняте си паролата си?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Обратно към влизане
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
