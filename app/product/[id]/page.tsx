import { notFound } from "next/navigation"
import { getProductById } from "@/lib/firebase/products"
import { getCategoryById } from "@/lib/firebase/categories"
import { serializeData } from "@/lib/utils"
import AddToCartButton from "@/components/ui/add-to-cart-button"
import ProductGallery from "@/components/ui/product-gallery"
import MessageSellerButton from "@/components/ui/message-seller-button"

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

  // Serialize the product data for Timestamp objects
  const product = serializeData(productData)
  const categoryData = await getCategoryById(product.category)
  const category = categoryData ? serializeData(categoryData) : null

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Gallery */}
        <ProductGallery images={product.images} />
        
        {/* Product Information */}
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {category && (
              <p className="mt-2 text-sm text-muted-foreground">
                Category: {category.name}
              </p>
            )}
            {product.sellerName && (
              <p className="mt-1 text-sm">
                Seller: <span className="font-medium">{product.sellerName}</span>
              </p>
            )}
          </div>

          <div className="rounded-lg border bg-card p-6">
            <p className="text-3xl font-bold">{product.price.toFixed(2)} лв.</p>
            <div className="mt-4">
              {product.status === "available" && <AddToCartButton product={product} />}
              {product.sellerId && <MessageSellerButton product={product} />}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="mt-2 text-muted-foreground">{product.description}</p>
          </div>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold">Specifications</h2>
              <dl className="mt-4 space-y-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex border-b pb-2 last:border-0">
                    <dt className="w-1/3 font-medium">{key}:</dt>
                    <dd className="flex-1 text-muted-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

