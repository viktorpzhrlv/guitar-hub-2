"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { getPendingProducts, approveProduct, rejectProduct } from "@/lib/firebase/products"
import type { Product } from "@/lib/types"
import AdminLayout from "@/components/layout/admin-layout"

export default function ApprovalsPage() {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadPendingProducts()
  }, [])

  const loadPendingProducts = async () => {
    setIsLoading(true)
    try {
      const data = await getPendingProducts()
      setPendingProducts(data)
    } catch (error) {
      console.error("Error loading pending products:", error)
      toast({
        title: "Error",
        description: "Failed to load pending products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedProduct) return

    setIsProcessing(true)
    try {
      await approveProduct(selectedProduct.id, adminNotes)
      setPendingProducts(pendingProducts.filter((p) => p.id !== selectedProduct.id))
      toast({
        title: "Product approved",
        description: "The product has been approved and is now live",
      })
    } catch (error) {
      console.error("Error approving product:", error)
      toast({
        title: "Error",
        description: "Failed to approve product",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setIsApproveDialogOpen(false)
      setSelectedProduct(null)
      setAdminNotes("")
    }
  }

  const handleReject = async () => {
    if (!selectedProduct) return

    if (!adminNotes.trim()) {
      toast({
        title: "Notes required",
        description: "Please provide feedback for the seller",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      await rejectProduct(selectedProduct.id, adminNotes)
      setPendingProducts(pendingProducts.filter((p) => p.id !== selectedProduct.id))
      toast({
        title: "Product rejected",
        description: "The product has been rejected",
      })
    } catch (error) {
      console.error("Error rejecting product:", error)
      toast({
        title: "Error",
        description: "Failed to reject product",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setIsRejectDialogOpen(false)
      setSelectedProduct(null)
      setAdminNotes("")
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Approvals</h1>
        <Button variant="outline" onClick={loadPendingProducts}>
          Refresh
        </Button>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Review and approve or reject user product listings</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-6 w-6 text-muted-foreground animate-pulse" />
                </div>
                <p>Loading pending approvals...</p>
              </div>
            ) : pendingProducts.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <CheckCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mb-1 text-lg font-medium">No pending approvals</h3>
                <p className="text-muted-foreground">All product listings have been reviewed</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingProducts.map((product) => (
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
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.sellerName || "Unknown"}</TableCell>
                        <TableCell>
                          {product.createdAt?.toDate
                            ? new Date(product.createdAt.toDate()).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/product/${product.id}?preview=true`} target="_blank">
                                <Eye className="mr-2 h-3.5 w-3.5" />
                                View
                              </Link>
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedProduct(product)
                                setIsApproveDialogOpen(true)
                              }}
                            >
                              <CheckCircle className="mr-2 h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product)
                                setIsRejectDialogOpen(true)
                              }}
                            >
                              <XCircle className="mr-2 h-3.5 w-3.5" />
                              Reject
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
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Product</DialogTitle>
            <DialogDescription>This product will be visible to all users after approval.</DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-md border">
                  <Image
                    src={selectedProduct.images[0] || "/images/product-placeholder.jpg"}
                    alt={selectedProduct.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">${selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label htmlFor="admin-notes" className="block text-sm font-medium mb-2">
                  Notes for Seller (Optional)
                </label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add any notes or feedback for the seller"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
              {isProcessing ? "Processing..." : "Approve Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              Please provide feedback to help the seller understand why their product was rejected.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-md border">
                  <Image
                    src={selectedProduct.images[0] || "/images/product-placeholder.jpg"}
                    alt={selectedProduct.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">${selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label htmlFor="rejection-notes" className="block text-sm font-medium mb-2">
                  Rejection Reason <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="rejection-notes"
                  placeholder="Explain why this product is being rejected"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  This feedback will be shared with the seller to help them improve their listing.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing || !adminNotes.trim()}>
              {isProcessing ? "Processing..." : "Reject Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

