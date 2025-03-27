import Link from "next/link"
import Image from "next/image"
import type { Category } from "@/lib/types"

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <Image
          src={category.image || "/images/category-placeholder.jpg"}
          alt={category.name}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-xl font-bold text-center text-white">{category.name}</h3>
        </div>
      </div>
    </Link>
  )
}

