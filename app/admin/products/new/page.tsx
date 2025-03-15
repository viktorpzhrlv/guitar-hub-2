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
import { useToast } from "@/components/ui/use-toast"
import { createProduct } from "@/lib/firebase/products"
import { getCategories } from "@/lib/firebase/categories"
import AdminLayout from "@/components/layout/admin-layout"
import { ImageUploader } from "@/components/ui/image-uploader"
import type { Category } from "@/lib/types"
import { X } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(2, "Името трябва да бъде поне 2 символа"),
  description: z.string().min(10, "Описанието трябва да бъде поне 10 символа"),
  price: z.coerce.number().positive("Цената трябва да бъде положителна"),
  category: z.string().min(1, "Категорията е задължителна"),
  status: z.enum(["available", "unavailable"]),
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
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      status: "available",
      specifications: {},
    },
  })
  
  // Load categories
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
  }, [toast])
  
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
    setIsLoading(true)
    try {
      // Process specifications
      const specifications: Record<string, string> = {}
      specs.forEach((spec) => {
        if (spec.key && spec.value) {
          specifications[spec.key] = spec.value
        }
      })
      
      // Create product with the already uploaded image URLs from ImageUploader
      await createProduct({
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        status: data.status,
        images: imageUrls,
        specifications,
        approvalStatus: "approved", // Admin-created products are auto-approved
      })
      
      toast({
        title: "Продуктът е създаден",
        description: "Продуктът е създаден успешно",
      })
      
      router.push("/admin/products")
    } catch (error) {
      console.error("Грешка при създаване на продукта:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно създаване на продукта",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Добавяне на нов продукт</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Отказ
        </Button>
      </div>
      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Име на продукта</FormLabel>
                    <FormControl>
                      <Input placeholder="Въведете име на продукта" {...field} />
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Статус</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Изберете статус" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Наличен</SelectItem>
                        <SelectItem value="unavailable">Неналичен</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Въведете описание на продукта" className="min-h-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Снимки на продукта</FormLabel>
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
                      placeholder="Име (например, Цвят)"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                    />
                    <Input
                      placeholder="Стойност (например, Черен)"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveSpec(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Отказ
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Създаване..." : "Създаване на продукт"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  )
}
