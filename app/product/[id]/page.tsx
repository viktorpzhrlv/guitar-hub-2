import { notFound } from "next/navigation"
import { getProductById } from "@/lib/firebase/products"
import { getCategoryById } from "@/lib/firebase/categories"
import { serializeData } from "@/lib/utils"
import AddToCartButton from "@/components/ui/add-to-cart-button"
import ProductGallery from "@/components/ui/product-gallery"

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
  
  // Serialize the product data to handle Timestamp objects
  const product = serializeData(productData)
  
  const categoryData = await getCategoryById(product.category)
  const category = categoryData ? serializeData(categoryData) : null
  
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Gallery */}
        {/* Продуктова Галерия */}
        <ProductGallery images={product.images} />
        {/* Product Info */}
        {/* Информация за Продукта */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="mt-2">
            <p className="text-xl font-bold">${product.price.toFixed(2)}</p>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Категория: {category?.name || "Unknown"}</p>
          </div>
          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold">Описание</h2>
            <p className="mt-2 text-muted-foreground">{product.description}</p>
          </div>
          {/* Specifications */}
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
          {/* Add to Cart */}
          {/* Добави в Количката */}
          <div className="mt-8">
            <p className="mb-2 text-sm text-muted-foreground">Забележка: Това е уникален продукт. Само един на клиент.</p>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
