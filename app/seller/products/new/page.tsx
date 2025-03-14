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

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
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

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Error loading categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        })
      }
    }

    loadCategories()
  }, [toast]) // Add toast to dependency array

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
      // Process specifications
      const specifications: Record<string, string> = {}
      specs.forEach((spec) => {
        if (spec.key && spec.value) {
          specifications[spec.key] = spec.value
        }
      })

      // Create product with the uploaded image URLs
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
        title: "Listing submitted",
        description: "Your item has been submitted for approval",
      })

      router.push("/seller")
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: "Failed to create listing",
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
            <h1 className="text-3xl font-bold">List a New Item</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>Provide detailed information about the item you're selling</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter item name" {...field} />
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
                        <FormLabel>Price</FormLabel>
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
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a detailed description of your item"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Item Images</FormLabel>
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
                      <FormLabel>Specifications</FormLabel>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddSpec}>
                        Add Specification
                      </Button>
                    </div>
                    <div className="mt-2 space-y-4">
                      {specs.map((spec, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <Input
                            placeholder="Name (e.g., Color)"
                            value={spec.key}
                            onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                          />
                          <Input
                            placeholder="Value (e.g., Black)"
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
                    <h3 className="mb-2 text-sm font-medium">Important Notes</h3>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      <li>Your listing will be reviewed by an admin before it appears on the site</li>
                      <li>Please provide accurate information and clear photos</li>
                      <li>Once approved, your item will be visible to all users</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Submitting..." : "Submit for Approval"}
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

