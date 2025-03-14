"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getProductById, updateProduct } from "@/lib/firebase/products"
import { getCategories } from "@/lib/firebase/categories"
import { uploadImage } from "@/lib/image-upload"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/auth/protected-route"
import type { Product, Category } from "@/lib/types"

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  specifications: z.record(z.string(), z.string()).optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
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

  // Load product and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productData, categoriesData] = await Promise.all([getProductById(params.id), getCategories()])

        if (!productData) {
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive",
          })
          router.push("/seller")
          return
        }

        // Check if user is the seller
        if (user && productData.sellerId !== user.uid) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to edit this product",
            variant: "destructive",
          })
          router.push("/seller")
          return
        }

        setProduct(productData)
        setCategories(categoriesData)
        setExistingImages(productData.images || [])

        // Set form values
        form.reset({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          specifications: productData.specifications || {},
        })

        // Set specifications
        if (productData.specifications) {
          const specArray = Object.entries(productData.specifications).map(([key, value]) => ({
            key,
            value: String(value),
          }))

          if (specArray.length > 0) {
            setSpecs(specArray)
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load product data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [params.id, router, toast, form, user])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newImages])

      // Create preview URLs
      const newImageUrls = newImages.map((file) => URL.createObjectURL(file))
      setImageUrls((prev) => [...prev, ...newImageUrls])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imageUrls[index])
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

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
    if (!user || !product) return

    setIsSaving(true)

    try {
      // Upload new images
      const uploadedImageUrls = []

      if (images.length > 0) {
        for (const image of images) {
          const imageUrl = await uploadImage(image)
          uploadedImageUrls.push(imageUrl)
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImageUrls]

      // Process specifications
      const specifications: Record<string, string> = {}
      specs.forEach((spec) => {
        if (spec.key && spec.value) {
          specifications[spec.key] = spec.value
        }
      })

      // Update product
      await updateProduct(params.id, {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        images: allImages,
        specifications,
        approvalStatus: "pending", // Reset to pending for re-approval
      })

      toast({
        title: "Listing updated",
        description: "Your item has been updated and submitted for approval",
      })

      router.push("/seller")
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container py-10">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!product) {
    return (
      <ProtectedRoute>
        <div className="container py-10">
          <div className="mx-auto max-w-3xl">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Product not found or you don't have permission to edit it.</AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => router.push("/seller")}>Back to Dashboard</Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Edit Listing</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>

          {product.approvalStatus === "rejected" && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Listing Rejected</AlertTitle>
              <AlertDescription>
                {product.adminNotes ? product.adminNotes : "Your listing was rejected. Please review and update it."}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>Update the information about your item</CardDescription>
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

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <>
                        <p className="mt-2 text-sm text-muted-foreground">Existing Images</p>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                          {existingImages.map((url, index) => (
                            <div
                              key={`existing-${index}`}
                              className="relative aspect-square overflow-hidden rounded-md border"
                            >
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`Product image ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2 h-6 w-6"
                                onClick={() => handleRemoveExistingImage(index)}
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
                          ))}
                        </div>
                      </>
                    )}

                    {/* New Images */}
                    <p className="mt-4 text-sm text-muted-foreground">Add New Images</p>
                    <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {imageUrls.map((url, index) => (
                        <div key={`new-${index}`} className="relative aspect-square overflow-hidden rounded-md border">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`New product image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6"
                            onClick={() => handleRemoveImage(index)}
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
                      ))}
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
                          <span className="text-sm text-muted-foreground">Upload Image</span>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                            multiple
                          />
                        </label>
                      </div>
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
                      <li>Your updated listing will need to be reviewed again by an admin</li>
                      <li>The item will not be visible on the site until approved</li>
                      <li>You will be notified once your listing is approved or rejected</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
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

