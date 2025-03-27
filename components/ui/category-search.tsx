"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CategorySearchProps {
  categorySlug: string
}

export default function CategorySearch({ categorySlug }: CategorySearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")

  // Актуализиране на търсенето при промяна на URL параметрите
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "")
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Запазване на съществуващите параметри за филтриране и сортиране
    const params = new URLSearchParams(searchParams.toString())

    // Актуализиране или премахване на параметъра за търсене
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim())
    } else {
      params.delete("search")
    }

    // Навигация към същата страница с новите параметри
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClear = () => {
    // Запазване на съществуващите параметри за филтриране и сортиране
    const params = new URLSearchParams(searchParams.toString())

    // Премахване на параметъра за търсене
    params.delete("search")

    // Нулиране на полето за търсене
    setSearchQuery("")

    // Навигация към същата страница без параметъра за търсене
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-4">
      <form onSubmit={handleSearch} className="flex flex-col gap-2">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Търсене в тази категория..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Търси
        </Button>
      </form>
    </div>
  )
}

