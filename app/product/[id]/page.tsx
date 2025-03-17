"use client"

import { notFound } from "next/navigation"
import { getProductById } from "@/lib/firebase/products"
import { getCategoryById } from "@/lib/firebase/categories"
import { serializeData } from "@/lib/utils"
import AddToCartButton from "@/components/ui/add-to-cart-button"
import ProductGallery from "@/components/ui/product-gallery"
import { useAuth } from "@/lib/auth-context"
import { isAdmin } from "@/lib/firebase/auth"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const productData = await getProductById(params.id)

  if (!productData || productData.status !== "available") {
    notFound()
  }

  // Сериализиране на данните за продукта за обработка на Timestamp обекти
  const product = serializeData(productData)

  const categoryData = await getCategoryById(product.category)
  const category = categoryData ? serializeData(categoryData) : null

  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Галерия на продукта */}
        <ProductGallery images={product.images} />
        {/* Информация за продукта */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="mt-2">
            <p className="text-xl font-bold">{product.price.toFixed(2)} лв.</p>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Категория: {category?.name || "Неизвестна"}</p>
          </div>
          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold">Описание</h2>
            <p className="mt-2 text-muted-foreground">{product.description}</p>
          </div>
          {/* Спецификации */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold">Спецификации</h2>
              <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                    <dd className="mt-1 text-sm">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {/* Бутон за редактиране за администратори */}
          {isAdmin(user) && (
            <Button variant="outline" asChild className="mb-2 w-full">
              <Link href={`/admin/products/${product.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Редактирай продукта
              </Link>
            </Button>
          )}
          {/* Добавяне в кошницата */}
          <div className="mt-8">
            <p className="mb-2 text-sm text-muted-foreground">
              Забележка: Това е уникален артикул. Само един на клиент.
            </p>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}

