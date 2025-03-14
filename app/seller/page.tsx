"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PlusCircle, Pencil, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getProductsBySeller, deleteProduct } from "@/lib/firebase/products"
import type { Product } from "@/lib/types"
import ProtectedRoute from "@/components/auth/protected-route"

export default function SellerDashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadProducts()
    }
  }, [user])

  const loadProducts = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await getProductsBySeller(user.uid)
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
      toast({
        title: "Error",
        description: "Failed to load your products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(productToDelete)
      setProducts(products.filter((product) => product.id !== productToDelete))
      toast({
        title: "Product deleted",
        description: "Your product has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setProductToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Manage your product listings</p>
          </div>
          <Button asChild>
            <Link href="/seller/products/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              List New Item
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription>View and manage all your product listings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">Loading your products...</div>
              ) : products.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">No products found</h3>
                  <p className="text-muted-foreground">
                    You haven't listed any products yet. Click "List New Item" to get started.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Approval</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="h-12 w-12 overflow-hidden rounded-md border">
                              <Image
                                src={product.images[0] || "/images/product-placeholder.jpg"}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span
                                className={`mr-2 h-2 w-2 rounded-full ${
                                  product.status === "available" ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              {product.status === "available" ? "Available" : "Unavailable"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(product.approvalStatus)}
                            {product.adminNotes && (
                              <div className="mt-1 text-xs text-muted-foreground">Note: {product.adminNotes}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                disabled={product.approvalStatus === "pending"}
                              >
                                <Link href={`/seller/products/${product.id}`}>
                                  <Pencil className="mr-2 h-3.5 w-3.5" />
                                  Edit
                                </Link>
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => setProductToDelete(product.id)}>
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listing Guidelines</CardTitle>
              <CardDescription>Important information about listing items for sale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 font-medium">Approval Process</h3>
                <p className="text-sm text-muted-foreground">
                  All listings require admin approval before they appear on the site. This process typically takes 1-2
                  business days.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Listing Requirements</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Clear, high-quality photos of the item</li>
                  <li>Accurate and detailed description</li>
                  <li>Reasonable pricing</li>
                  <li>Honest representation of the item's condition</li>
                  <li>Complete specifications</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Prohibited Items</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Counterfeit or replica items</li>
                  <li>Items with inappropriate imagery</li>
                  <li>Non-musical equipment</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your product listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  )
}

