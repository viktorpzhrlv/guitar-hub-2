"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PlusCircle, Pencil, Trash2, AlertCircle, ShoppingBag } from "lucide-react"
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
      console.error("Грешка при зареждане на продукти:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на вашите продукти",
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
        title: "Продуктът е изтрит",
        description: "Вашият продукт беше успешно изтрит",
      })
    } catch (error) {
      console.error("Грешка при изтриване на продукта:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно изтриване на продукта",
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
            В очакване на преглед
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Одобрен
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Отхвърлен
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
            <h1 className="text-3xl font-bold">Табло за управление на продавача</h1>
            <p className="mt-1 text-muted-foreground">Управлявайте вашите продуктови обяви</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/seller/products/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Обяви нов артикул
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/seller/orders">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Управление на поръчки
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Вашите обяви</CardTitle>
              <CardDescription>Преглеждайте и управлявайте всички ваши продуктови обяви</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">Зареждане на вашите продукти...</div>
              ) : products.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">Не са намерени продукти</h3>
                  <p className="text-muted-foreground">
                    Все още не сте обявили продукти. Кликнете върху "Обяви нов артикул", за да започнете.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Изображение</TableHead>
                        <TableHead>Име</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Одобрение</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
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
                          <TableCell>{product.price.toFixed(2)} лв.</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span
                                className={`mr-2 h-2 w-2 rounded-full ${
                                  product.status === "available" ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              {product.status === "available" ? "Наличен" : "Неналичен"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(product.approvalStatus)}
                            {product.adminNotes && (
                              <div className="mt-1 text-xs text-muted-foreground">Бележка: {product.adminNotes}</div>
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
                                  Редактиране
                                </Link>
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => setProductToDelete(product.id)}>
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Изтриване
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
              <CardTitle>Указания за обяви</CardTitle>
              <CardDescription>Важна информация относно обявяването на артикули за продажба</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 font-medium">Процес на одобрение</h3>
                <p className="text-sm text-muted-foreground">
                  Всички обяви изискват одобрение от администратор, преди да се появят на сайта. Този процес обикновено
                  отнема 1-2 работни дни.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Изисквания за обяви</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Ясни, висококачествени снимки на артикула</li>
                  <li>Точно и подробно описание</li>
                  <li>Разумна цена</li>
                  <li>Честно представяне на състоянието на артикула</li>
                  <li>Пълни спецификации</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Забранени артикули</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Фалшиви или реплика артикули</li>
                  <li>Артикули с неподходящи изображения</li>
                  <li>Немузикално оборудване</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сигурни ли сте?</AlertDialogTitle>
            <AlertDialogDescription>
              Това действие не може да бъде отменено. Това ще изтрие за постоянно вашата продуктова обява.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground">
              Изтриване
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  )
}
