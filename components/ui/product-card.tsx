import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="group relative flex flex-col overflow-hidden rounded-lg border">
      <div className="aspect-square overflow-hidden bg-muted">
        <Image
          src={product.images[0] || "/images/product-placeholder.jpg"}
          alt={product.name}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-medium">{product.name}</h3>
        <div className="mt-auto pt-4">
          <p className="text-lg font-bold">{product.price.toFixed(2)} лв.</p>
        </div>
      </div>
    </Link>
  )
}

