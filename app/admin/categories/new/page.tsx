"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createCategory } from "@/lib/firebase/categories"
import { uploadImage } from "@/lib/image-upload"
import AdminLayout from "@/components/layout/admin-layout"

const categorySchema = z.object({
  name: z.string().min(2, "Името трябва да бъде поне 2 символа"),
  description: z.string().min(10, "Описанието трябва да бъде поне 10 символа"),
  slug: z
    .string()
    .min(2, "Slug трябва да бъде поне 2 символа")
    .regex(/^[a-z0-9-]+$/, "Slug трябва да съдържа само малки букви, цифри и тирета"),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export default function NewCategoryPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImage(null)
    setImagePreview(null)
  }

  const generateSlug = () => {
    const name = form.getValues("name")
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
      form.setValue("slug", slug, { shouldValidate: true })
    }
  }

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true)

    try {
      // Upload image
      let imageUrl = "/images/category-placeholder.jpg"

      if (image) {
        imageUrl = await uploadImage(image)
      }

      // Create category
      await createCategory({
        name: data.name,
        description: data.description,
        slug: data.slug,
        image: imageUrl,
      })

      toast({
        title: "Категорията е създадена",
        description: "Категорията е създадена успешно",
      })

      router.push("/admin/categories")
    } catch (error) {
      console.error("Грешка при създаване на категория:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно създаване на категория",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Добавяне на нова категория</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Отказ
        </Button>
      </div>

      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Име на категорията</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Въведете име на категорията"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            // Auto-generate slug when name changes if slug is empty
                            if (!form.getValues("slug")) {
                              generateSlug()
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Slug</FormLabel>
                        <Button type="button" variant="ghost" size="sm" onClick={generateSlug} className="text-xs">
                          Генерирай от името
                        </Button>
                      </div>
                      <FormControl>
                        <Input placeholder="category-slug" {...field} />
                      </FormControl>
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
                        <Textarea placeholder="Въведете описание на категорията" className="min-h-32" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Изображение на категорията</FormLabel>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative aspect-square overflow-hidden rounded-md border">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Category preview"
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
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
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-md border border-dashed">
                      <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-4 text-center">
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
                          className="mb-2 h-6 w-6 text-muted-foreground"
                        >
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                          <line x1="16" x2="22" y1="5" y2="5" />
                          <line x1="19" x2="19" y1="2" y2="8" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <span className="text-sm text-muted-foreground">Качи изображение</span>
                        <Input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Препоръчително: Квадратно изображение, поне 500x500 пиксела
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Отказ
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Създаване..." : "Създай категория"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  )
}
