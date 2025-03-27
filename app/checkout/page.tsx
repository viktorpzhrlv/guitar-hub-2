"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { createOrder } from "@/lib/firebase/orders"
import { updateProduct } from "@/lib/firebase/products"
import { useToast } from "@/components/ui/use-toast"

const checkoutSchema = z.object({
  name: z.string().min(2, "Името трябва да съдържа поне 2 символа"),
  email: z.string().email("Моля, въведете валиден имейл адрес"),
  address: z.string().min(5, "Адресът трябва да съдържа поне 5 символа"),
  city: z.string().min(2, "Градът трябва да съдържа поне 2 символа"),
  state: z.string().min(2, "Щатът трябва да съдържа поне 2 символа"),
  zipCode: z.string().min(4, "Пощенският код трябва да съдържа поне 4 символа"),
  phone: z.string().min(10, "Телефонният номер трябва да съдържа поне 10 символа"),
  notes: z.string().optional(),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      notes: "",
    },
  })

  // Check for empty cart and redirect
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  // Check if user is trying to buy their own item
  useEffect(() => {
    if (user && items.some(item => item.sellerId === user.uid)) {
      toast({
        title: "Невъзможна покупка",
        description: "Не можете да закупите собствените си артикули",
        variant: "destructive",
      })
      router.push("/cart")
    }
  }, [items, user, router, toast])

  // Update form when user data is available
  useEffect(() => {
    if (user) {
      form.setValue("name", user.displayName || "")
      form.setValue("email", user.email || "")
    }
  }, [user, form])

  // Don't render anything while redirecting for empty cart or seller's own items
  if (items.length === 0 || (user && items.some(item => item.sellerId === user.uid))) {
    return null
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true)

    try {
      // Create order
      const order = {
        customerId: user?.uid || "guest",
        customerName: data.name,
        customerEmail: data.email,
        customerAddress: `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`,
        customerPhone: data.phone,
        notes: data.notes,
        items: items,
        total: totalPrice,
        status: "pending" as const,
      }

      await createOrder(order)

      // Update product status for each ordered item
      for (const item of items) {
        await updateProduct(item.productId, {
          status: "unavailable"
        })
      }

      // First clear the cart
      clearCart()
      // Then navigate to success page
      router.push("/checkout/success")
    } catch (error) {
      console.error("Грешка при създаване на поръчка:", error)
      toast({
        title: "Грешка",
        description: "Възникна проблем при създаването на поръчката. Моля, опитайте отново.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold">Завършване на поръчката</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Информация за доставка</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пълно име</FormLabel>
                    <FormControl>
                      <Input placeholder="Иван Иванов" {...field} />
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
                    <FormLabel>Имейл адрес</FormLabel>
                    <FormControl>
                      <Input placeholder="ivan@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефонен номер</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
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
                    <FormLabel>Улица, номер</FormLabel>
                    <FormControl>
                      <Input placeholder="ул. Главна 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Град</FormLabel>
                      <FormControl>
                        <Input placeholder="София" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Област</FormLabel>
                      <FormControl>
                        <Input placeholder="София-град" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пощенски код</FormLabel>
                    <FormControl>
                      <Input placeholder="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бележки към поръчката (незадължително)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Специални инструкции за доставка" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button asChild variant="outline">
                  <Link href="/cart">Обратно към количката</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Обработка..." : "Потвърди поръчката"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Информация за поръчката</h2>

          <div className="rounded-lg border">
            <div className="p-4">
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={item.id} className="flex py-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium">
                          <h3>{item.name}</h3>
                          <p className="ml-4">{item.price.toFixed(2)} лв.</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">Уникален артикул</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Междинна сума</span>
                  <span>{totalPrice.toFixed(2)} лв.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Доставка</span>
                  <span>Според куриера</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Общо</span>
                    <span>{totalPrice.toFixed(2)} лв.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
