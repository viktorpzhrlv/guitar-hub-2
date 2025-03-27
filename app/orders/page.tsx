"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getOrdersByCustomer } from "@/lib/firebase/orders"
import type { Order, OrderStatus } from "@/lib/types"
import ProtectedRoute from "@/components/auth/protected-route"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

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
      const data = await getOrdersByCustomer(user.uid)
      setOrders(data)
    } catch (error) {
      console.error("Грешка при зареждане на поръчките:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на вашите поръчки",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" /> В очакване
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

  // Групиране на артикулите по продавач
  const groupItemsBySeller = (items: Order["items"]) => {
    const grouped: Record<string, typeof items> = {}

    items.forEach((item) => {
      const sellerId = item.sellerId || "unknown"
      if (!grouped[sellerId]) {
        grouped[sellerId] = []
      }
      grouped[sellerId].push(item)
    })

    return grouped
  }

  return (
    <ProtectedRoute>
      <div className="container py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Моите поръчки</h1>
            <p className="mt-1 text-muted-foreground">Преглед и проследяване на вашите поръчки</p>
          </div>
          <Button onClick={loadOrders}>Обнови поръчките</Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>История на поръчките</CardTitle>
              <CardDescription>Преглед на детайлите и статуса на миналите ви поръчки</CardDescription>
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
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">Не са намерени поръчки</h3>
                  <p className="text-muted-foreground mb-4">Все още не сте направили поръчки.</p>
                  <Button asChild>
                    <Link href="/">Започнете да пазарувате</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id
                    const groupedItems = groupItemsBySeller(order.items)

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
                              <p className="font-medium">{order.total.toFixed(2)} лв.</p>
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
                                <h4 className="mb-2 text-sm font-medium">Информация за доставка</h4>
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
                                    <span className="font-medium">{order.total.toFixed(2)} лв.</span>
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
                              <h4 className="mb-2 text-sm font-medium">Артикули в поръчката</h4>

                              {Object.entries(groupedItems).map(([sellerId, items]) => (
                                <div key={sellerId} className="mb-6">
                                  <div className="mb-2 flex items-center">
                                    <p className="text-sm font-medium">
                                      Продавач: {items[0]?.sellerName || "Неизвестен продавач"}
                                    </p>
                                  </div>

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
                                        {items.map((item) => (
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
                                                  Виж продукта <ExternalLink className="ml-1 h-3 w-3" />
                                                </Link>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-right">{item.price.toFixed(2)} лв.</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right font-medium">
                                              {(item.price * item.quantity).toFixed(2)} лв.
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              ))}

                              <div className="mt-4 flex justify-end">
                                <div className="w-full max-w-xs space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Междинна сума</span>
                                    <span>{order.total.toFixed(2)} лв.</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Доставка</span>
                                    <span>Безплатна</span>
                                  </div>
                                  <div className="flex justify-between border-t pt-2 font-medium">
                                    <span>Общо</span>
                                    <span>{order.total.toFixed(2)} лв.</span>
                                  </div>
                                </div>
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
    </ProtectedRoute>
  )
}
