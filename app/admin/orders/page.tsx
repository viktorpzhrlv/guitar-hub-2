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
  Search,
  Download,
  Filter,
} from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { getAllOrders, updateOrderStatus } from "@/lib/firebase/orders"
import type { Order, OrderStatus } from "@/lib/types"
import AdminLayout from "@/components/layout/admin-layout"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>("processing")
  const [statusNotes, setStatusNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [sortBy, setSortBy] = useState<"date" | "total">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const { toast } = useToast()

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    // Apply filters and sorting whenever the dependencies change
    let result = [...orders]

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter)
    }

    // Apply search filter (search in customer name, email, or order ID)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (order) =>
          order.customerName.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = a.createdAt?.toDate?.() || new Date()
        const dateB = b.createdAt?.toDate?.() || new Date()
        return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
      } else {
        return sortOrder === "asc" ? a.total - b.total : b.total - a.total
      }
    })

    setFilteredOrders(result)
  }, [orders, searchQuery, statusFilter, sortBy, sortOrder])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const data = await getAllOrders()
      setOrders(data)
      setFilteredOrders(data)
    } catch (error) {
      console.error("Error loading orders:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на поръчките",
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

      // Update local state
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id ? { ...order, status: newStatus, notes: statusNotes } : order,
      )
      setOrders(updatedOrders)

      toast({
        title: "Поръчката е обновена",
        description: `Статусът на поръчката е обновен на ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно обновяване на статуса на поръчката",
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

  // Group items by seller
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

  // Export orders to CSV
  const exportToCSV = () => {
    // Create CSV header
    const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Status", "Total", "Items"].join(",")

    // Create CSV rows
    const rows = filteredOrders
      .map((order) => {
        const date = order.createdAt?.toDate?.() ? format(new Date(order.createdAt.toDate()), "yyyy-MM-dd") : "N/A"

        const itemsText = order.items.map((item) => `${item.name} (${item.quantity})`).join("; ")

        return [
          order.id,
          date,
          `"${order.customerName}"`,
          order.customerEmail,
          order.status,
          order.total.toFixed(2),
          `"${itemsText}"`,
        ].join(",")
      })
      .join("\n")

    // Combine header and rows
    const csv = `${headers}\n${rows}`

    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `orders-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Поръчки</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadOrders}>
            Обнови
          </Button>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Експортирай CSV
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Всички поръчки</CardTitle>
            <CardDescription>Преглед и управление на клиентски поръчки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Търсене по име на клиент, имейл или ID на поръчка..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Филтриране по статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички статуси</SelectItem>
                    <SelectItem value="pending">Изчакваща</SelectItem>
                    <SelectItem value="processing">Обработва се</SelectItem>
                    <SelectItem value="shipped">Изпратена</SelectItem>
                    <SelectItem value="delivered">Доставена</SelectItem>
                    <SelectItem value="cancelled">Отменена</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Сортирай
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSortBy("date")
                        setSortOrder("desc")
                      }}
                    >
                      Най-новите първо
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortBy("date")
                        setSortOrder("asc")
                      }}
                    >
                      Най-старите първо
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortBy("total")
                        setSortOrder("desc")
                      }}
                    >
                      Най-висока обща сума
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortBy("total")
                        setSortOrder("asc")
                      }}
                    >
                      Най-ниска обща сума
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {isLoading ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-6 w-6 text-muted-foreground animate-pulse" />
                </div>
                <p>Зареждане на поръчките...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mb-1 text-lg font-medium">Не са намерени поръчки</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Опитайте да коригирате филтрите си, за да видите повече резултати."
                    : "Все още няма поръчки в системата."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
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
                            <p className="font-medium">${order.total.toFixed(2)}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setNewStatus(order.status)
                                setIsUpdateDialogOpen(true)
                              }}
                            >
                              Обнови статус
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
                                  <span className="font-medium">${order.total.toFixed(2)}</span>
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
                                                Виж продукта
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
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            ))}

                            <div className="mt-4 flex justify-end">
                              <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Междинна сума</span>
                                  <span>${order.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Доставка</span>
                                  <span>Безплатна</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-medium">
                                  <span>Общо</span>
                                  <span>${order.total.toFixed(2)}</span>
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

      {/* Update Order Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Обновяване на статуса на поръчката</DialogTitle>
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
              {isProcessing ? "Обновяване..." : "Обнови статус"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
