"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createProduct } from "@/lib/firebase/products"
import { getCategories } from "@/lib/firebase/categories"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/auth/protected-route"
import { ImageUploader } from "@/components/ui/image-uploader"
import type { Category } from "@/lib/types"

// Zod схема за валидиране на формата за продукт
const productSchema = z.object({
  name: z.string().min(2, "Името трябва да бъде поне 2 символа"),
  description: z.string().min(10, "Описанието трябва да бъде поне 10 символа"),
  price: z.coerce.number().positive("Цената трябва да бъде положителна"),
  category: z.string().min(1, "Категорията е задължителна"),
  specifications: z.record(z.string(), z.string()).optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }])

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      specifications: {},
    },
  })

  // Зареждане на категориите
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Грешка при зареждане на категориите:", error)
        toast({
          title: "Грешка",
          description: "Неуспешно зареждане на категориите",
          variant: "destructive",
        })
      }
    }

    loadCategories()
  }, [toast]) // Добавяне на toast към списъка със зависимости

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { key: "", value: "" }])
  }

  const handleRemoveSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSpecChange = (index: number, field: "key" | "value", value: string) => {
    setSpecs((prev) => prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)))
  }

  const onSubmit = async (data: ProductFormValues) => {
    if (!user) return

    setIsLoading(true)

    try {
      // Обработка на спецификациите
      const specifications: Record<string, string> = {}
      specs.forEach((spec) => {
        if (spec.key && spec.value) {
          specifications[spec.key] = spec.value
        }
      })

      // Създаване на продукт с качените URL адреси на изображенията
      await createProduct({
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        status: "available",
        images: imageUrls,
        specifications,
        sellerId: user.uid,
        sellerName: user.displayName || "Anonymous",
        approvalStatus: "pending",
      })

      toast({
        title: "Обявата е подадена",
        description: "Вашият артикул е подаден за одобрение",
      })

      router.push("/seller")
    } catch (error) {
      console.error("Грешка при създаване на продукт:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно създаване на обява",
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
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Създаване на нова обява</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Отказ
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Детайли на артикула</CardTitle>
              <CardDescription>Предоставете подробна информация за артикула, който продавате</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Име на артикула</FormLabel>
                        <FormControl>
                          <Input placeholder="Въведете име на артикула" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цена</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Категория</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Изберете категория" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Предоставете подробно описание на вашия артикул"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Снимки на артикула</FormLabel>
                    <div className="mt-2">
                      <ImageUploader
                        multiple={true}
                        onImagesChange={setImageUrls}
                        existingImages={imageUrls}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <FormLabel>Спецификации</FormLabel>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddSpec}>
                        Добави спецификация
                      </Button>
                    </div>
                    <div className="mt-2 space-y-4">
                      {specs.map((spec, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <Input
                            placeholder="Име (напр. Цвят)"
                            value={spec.key}
                            onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                          />
                          <Input
                            placeholder="Стойност (напр. Черен)"
                            value={spec.value}
                            onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                          />
                          <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveSpec(index)}>
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
                              className="h-4 w-4"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md bg-muted p-4">
                    <h3 className="mb-2 text-sm font-medium">Важни забележки</h3>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      <li>Вашата обява ще бъде прегледана от администратор, преди да се появи на сайта</li>
                      <li>Моля, предоставете точна информация и ясни снимки</li>
                      <li>След като бъде одобрен, вашият артикул ще бъде видим за всички потребители</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Отказ
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Изпращане..." : "Подаване за одобрение"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
