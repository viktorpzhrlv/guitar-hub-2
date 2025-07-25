import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { getCategoryBySlug } from "@/lib/firebase/categories"
import { getProductsByCategory } from "@/lib/firebase/products"
import ProductCard from "@/components/ui/product-card"
import ProductFilters from "@/components/ui/product-filters"

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    sort?: string
    minPrice?: string
    maxPrice?: string
    search?: string
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold">{category.name}</h1>
      <p className="mb-8 text-muted-foreground">{category.description}</p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        <ProductFilters categorySlug={params.slug} searchParams={searchParams} />

        <div>
          <Suspense fallback={<ProductSkeleton />}>
            <ProductGrid categoryId={category.id} searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function ProductGrid({
  categoryId,
  searchParams,
}: {
  categoryId: string
  searchParams: {
    sort?: string
    minPrice?: string
    maxPrice?: string
    search?: string
  }
}) {
  const products = await getProductsByCategory(categoryId)

  // Прилагане на филтри и сортиране
  let filteredProducts = [...products]

  // Филтриране по цена
  if (searchParams.minPrice || searchParams.maxPrice) {
    const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : 0
    const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : Number.POSITIVE_INFINITY

    filteredProducts = filteredProducts.filter((product) => 
      product.price >= minPrice && product.price <= maxPrice
    )
  }

  // Филтриране по търсене
  if (searchParams.search) {
    const searchQuery = searchParams.search.toLowerCase()
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        (product.specifications &&
          Object.values(product.specifications).some((value) => value.toLowerCase().includes(searchQuery))),
    )
  }

  // Прилагане на сортиране
  if (searchParams.sort) {
    switch (searchParams.sort) {
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case "newest":
        filteredProducts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
        break
      default:
        // Сортиране по подразбиране - най-нови
        filteredProducts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
    }
  } else {
    // Сортиране по подразбиране - най-нови
    filteredProducts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-xl font-semibold">Не са намерени продукти</h2>
        <p className="mt-2 text-muted-foreground">
          Опитайте да промените филтрите или проверете по-късно за нови продукти.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  )
}

