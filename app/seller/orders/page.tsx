"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getOrdersBySeller, updateOrderStatus } from "@/lib/firebase/orders"
import type { Order, OrderStatus } from "@/lib/types"
import ProtectedRoute from "@/components/auth/protected-route"

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>("processing")
  const [statusNotes, setStatusNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await getOrdersBySeller(user.uid)
      setOrders(data)
    } catch (error) {
      console.error("Грешка при зареждане на поръчки:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на вашите поръчки",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return

    setIsProcessing(true)
    try {
      await updateOrderStatus(selectedOrder.id, newStatus, statusNotes)

      // Актуализиране на локалното състояние
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id ? { ...order, status: newStatus, notes: statusNotes } : order,
        ),
      )

      toast({
        title: "Поръчката е актуализирана",
        description: `Статусът на поръчката е актуализиран на ${newStatus}`,
      })
    } catch (error) {
      console.error("Грешка при актуализиране на поръчка:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно актуализиране на статуса на поръчката",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setIsUpdateDialogOpen(false)
      setSelectedOrder(null)
      setStatusNotes("")
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" /> Изчакваща
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Package className="mr-1 h-3 w-3" /> Обработва се
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
            <Truck className="mr-1 h-3 w-3" /> Изпратена
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Доставена
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" /> Отменена
          </Badge>
        )
      default:
        return null
    }
  }

  // Филтриране на поръчките, за да се покажат само артикулите от този продавач
  const filterOrderItems = (order: Order) => {
    if (!user) return []
    return order.items.filter((item) => item.sellerId === user.uid)
  }

  // Изчисляване на общата сума само за артикулите на продавача
  const calculateSellerTotal = (order: Order) => {
    if (!user) return 0
    return order.items
      .filter((item) => item.sellerId === user.uid)
      .reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Поръчки на продавача</h1>
            <p className="mt-1 text-muted-foreground">Управление на поръчките за вашите продукти</p>
          </div>
          <Button onClick={loadOrders}>Обнови поръчките</Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Вашите поръчки</CardTitle>
              <CardDescription>Преглед и управление на поръчките за вашите продукти</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-6 w-6 text-muted-foreground animate-pulse" />
                  </div>
                  <p>Зареждане на вашите поръчки...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">Не са намерени поръчки</h3>
                  <p className="text-muted-foreground">Все още не сте получили поръчки за вашите продукти.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const sellerItems = filterOrderItems(order)
                    if (sellerItems.length === 0) return null

                    const sellerTotal = calculateSellerTotal(order)
                    const isExpanded = expandedOrderId === order.id

                    return (
                      <Card key={order.id} className="overflow-hidden">
                        <div className="bg-muted/50 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">Поръчка #{order.id.slice(-8)}</h3>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {order.createdAt?.toDate ? format(new Date(order.createdAt.toDate()), "PPP") : "N/A"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">${sellerTotal.toFixed(2)}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setNewStatus(order.status)
                                  setIsUpdateDialogOpen(true)
                                }}
                              >
                                Актуализиране на статуса
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4">
                            <div className="grid gap-6 md:grid-cols-2">
                              <div>
                                <h4 className="mb-2 text-sm font-medium">Информация за клиента</h4>
                                <div className="rounded-md border p-3">
                                  <p className="font-medium">{order.customerName}</p>
                                  <p className="text-sm">{order.customerEmail}</p>
                                  <p className="text-sm">{order.customerPhone}</p>
                                  <p className="mt-2 text-sm text-muted-foreground">{order.customerAddress}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="mb-2 text-sm font-medium">Детайли на поръчката</h4>
                                <div className="rounded-md border p-3">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Статус</span>
                                    <span>{getStatusBadge(order.status)}</span>
                                  </div>
                                  <div className="mt-2 flex justify-between">
                                    <span className="text-sm text-muted-foreground">Дата</span>
                                    <span className="text-sm">
                                      {order.createdAt?.toDate
                                        ? format(new Date(order.createdAt.toDate()), "PPP")
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div className="mt-2 flex justify-between">
                                    <span className="text-sm text-muted-foreground">Общо</span>
                                    <span className="font-medium">${sellerTotal.toFixed(2)}</span>
                                  </div>

                                  {order.notes && (
                                    <div className="mt-3 border-t pt-3">
                                      <p className="text-xs font-medium">Бележки</p>
                                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-6">
                              <h4 className="mb-2 text-sm font-medium">Вашите артикули в тази поръчка</h4>
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[80px]">Изображение</TableHead>
                                      <TableHead>Продукт</TableHead>
                                      <TableHead className="text-right">Цена</TableHead>
                                      <TableHead className="text-right">Количество</TableHead>
                                      <TableHead className="text-right">Общо</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {sellerItems.map((item) => (
                                      <TableRow key={item.id}>
                                        <TableCell>
                                          <div className="h-12 w-12 overflow-hidden rounded-md border">
                                            <Image
                                              src={item.image || "/images/product-placeholder.jpg"}
                                              alt={item.name}
                                              width={48}
                                              height={48}
                                              className="h-full w-full object-cover"
                                            />
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div>
                                            <p className="font-medium">{item.name}</p>
                                            <Link
                                              href={`/product/${item.productId}`}
                                              className="text-xs text-primary flex items-center mt-1"
                                            >
                                              Преглед на продукта <ExternalLink className="ml-1 h-3 w-3" />
                                            </Link>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right font-medium">
                                          ${(item.price * item.quantity).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow>
                                      <TableCell colSpan={4} className="text-right font-medium">
                                        Междинна сума
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        ${sellerTotal.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Диалогов прозорец за актуализиране на статуса на поръчката */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Актуализиране на статуса на поръчката</DialogTitle>
            <DialogDescription>Променете статуса на тази поръчка и предоставете допълнителни бележки.</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Статус на поръчката</label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Изберете статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Изчакваща</SelectItem>
                    <SelectItem value="processing">Обработва се</SelectItem>
                    <SelectItem value="shipped">Изпратена</SelectItem>
                    <SelectItem value="delivered">Доставена</SelectItem>
                    <SelectItem value="cancelled">Отменена</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Бележки (Незадължително)</label>
                <Textarea
                  placeholder="Добавете бележки или информация за проследяване"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">Тези бележки ще бъдат видими за клиента.</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Отказ
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isProcessing}>
              {isProcessing ? "Актуализиране..." : "Актуализиране на статуса"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
