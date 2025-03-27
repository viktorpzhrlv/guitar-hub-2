import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { headers } from 'next/headers'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getFeaturedProducts } from "@/lib/firebase/products"
import { getCategories } from "@/lib/firebase/categories"
import ProductCard from "@/components/ui/product-card"
import CategoryCard from "@/components/ui/category-card"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  // Force dynamic rendering and prevent caching
  headers();

  return (
    <div className="flex flex-col gap-12 pb-8">
      {/* Hero Section */}
      <section className="relative h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image src="https://i.ibb.co/qFctrwVj/image.png" alt="Electric guitar" fill priority className="object-cover" />
        <div className="container relative z-20 flex h-full flex-col items-center justify-center text-center text-white">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">Открийте Перфектния си Звук</h1>
          <p className="mb-6 max-w-2xl text-lg">
            Открийте премиум китари, усилватели, ефекти педали и аксесоари за музиканти от всички нива.
          </p>
         
        </div>
      </section>

      {/* Categories Section */}
      <section className="container">
        <h2 className="mb-6 text-3xl font-bold">Пазарувай по Категория</h2>
        <Suspense fallback={<CategorySkeleton />}>
          <CategoriesGrid />
        </Suspense>
      </section>

      {/* Featured Products Section */}
      <section className="container">
        <h2 className="mb-6 text-3xl font-bold">Препоръчани Продукти</h2>
        <Suspense fallback={<ProductSkeleton />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-muted py-12">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">Защо да Изберете Guitar Hub</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Експертна Селекция</h3>
                <p className="text-muted-foreground">
                  Подбрано от музиканти за музиканти, гарантиращо качество и производителност.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Гаранция за Качество</h3>
                <p className="text-muted-foreground">Всеки инструмент е инспектиран и тестван преди изпращане.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Сигурно Пазаруване</h3>
                <p className="text-muted-foreground">
                  Пазарувайте със сигурност с нашата защитена каса и защита на клиентите.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

async function CategoriesGrid() {
  const categories = await getCategories()

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}

function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  )
}

async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
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
