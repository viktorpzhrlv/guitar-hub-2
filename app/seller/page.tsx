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
      <div className="container py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Табло за управление на продавача</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">Управлявайте вашите продуктови обяви</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/seller/products/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Обяви нов артикул
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/seller/orders">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Управление на поръчки
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Вашите обяви</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Преглеждайте и управлявайте всички ваши продуктови обяви</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
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
                <>
                  {/* Desktop Table View (hidden on mobile) */}
                  <div className="rounded-md border overflow-x-auto hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Изображение</TableHead>
                          <TableHead>Име</TableHead>
                          <TableHead>Цена</TableHead>
                          <TableHead className="hidden md:table-cell">Статус</TableHead>
                          <TableHead className="hidden md:table-cell">Одобрение</TableHead>
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
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center">
                                <span
                                  className={`mr-2 h-2 w-2 rounded-full ${
                                    product.status === "available" ? "bg-green-500" : "bg-red-500"
                                  }`}
                                />
                                {product.status === "available" ? "Наличен" : "Неналичен"}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getStatusBadge(product.approvalStatus)}
                              {product.adminNotes && (
                                <div className="mt-1 text-xs text-muted-foreground">Бележка: {product.adminNotes}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1 md:gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  disabled={product.approvalStatus === "pending"}
                                  className="text-xs md:text-sm"
                                >
                                  <Link href={`/seller/products/${product.id}`}>
                                    <Pencil className="mr-1 md:mr-2 h-3 w-3 md:h-3.5 md:w-3.5" />
                                    <span className="hidden sm:inline">Редактиране</span>
                                  </Link>
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => setProductToDelete(product.id)}
                                  className="text-xs md:text-sm"
                                >
                                  <Trash2 className="mr-1 md:mr-2 h-3 w-3 md:h-3.5 md:w-3.5" />
                                  <span className="hidden sm:inline">Изтриване</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View (shown only on mobile) */}
                  <div className="space-y-4 sm:hidden">
                    {products.map((product) => (
                      <div key={product.id} className="rounded-lg border overflow-hidden">
                        <div className="flex items-center p-4 bg-muted/30">
                          <div className="h-14 w-14 overflow-hidden rounded-md border mr-3">
                            <Image
                              src={product.images[0] || "/images/product-placeholder.jpg"}
                              alt={product.name}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{product.name}</h3>
                            <p className="text-muted-foreground text-sm">{product.price.toFixed(2)} лв.</p>
                          </div>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Статус:</span>
                            <div className="flex items-center">
                              <span
                                className={`mr-2 h-2 w-2 rounded-full ${
                                  product.status === "available" ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              {product.status === "available" ? "Наличен" : "Неналичен"}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Одобрение:</span>
                            <div>{getStatusBadge(product.approvalStatus)}</div>
                          </div>
                          {product.adminNotes && (
                            <div className="border-t pt-2 mt-2">
                              <span className="text-muted-foreground text-xs">Бележка от администратор:</span>
                              <p className="text-xs mt-1">{product.adminNotes}</p>
                            </div>
                          )}
                          <div className="flex pt-3 border-t gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              disabled={product.approvalStatus === "pending"}
                              className="flex-1 h-9 text-xs"
                            >
                              <Link href={`/seller/products/${product.id}`}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Редактиране
                              </Link>
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => setProductToDelete(product.id)}
                              className="flex-1 h-9 text-xs"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Изтриване
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Указания за обяви</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Важна информация относно обявяването на артикули за продажба</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
              <div className="rounded-md bg-muted p-3 sm:p-4">
                <h3 className="mb-2 font-medium text-sm sm:text-base">Процес на одобрение</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Всички обяви изискват одобрение от администратор, преди да се появят на сайта. Този процес обикновено
                  отнема 1-2 работни дни.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-sm sm:text-base">Изисквания за обяви</h3>
                <ul className="list-inside list-disc space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <li>Ясни, висококачествени снимки на артикула</li>
                  <li>Точно и подробно описание</li>
                  <li>Разумна цена</li>
                  <li>Честно представяне на състоянието на артикула</li>
                  <li>Пълни спецификации</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-sm sm:text-base">Забранени артикули</h3>
                <ul className="list-inside list-disc space-y-1 text-xs sm:text-sm text-muted-foreground">
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
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Сигурни ли сте?</AlertDialogTitle>
            <AlertDialogDescription>
              Това действие не може да бъде отменено. Това ще изтрие за постоянно вашата продуктова обява.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0 sm:mt-0">Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground">
              Изтриване
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  )
}
