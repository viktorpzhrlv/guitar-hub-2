"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface ProductFiltersProps {
  categorySlug: string
  searchParams: {
    sort?: string
    minPrice?: string
    maxPrice?: string
  }
}

export default function ProductFilters({ categorySlug, searchParams }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [sort, setSort] = useState<string>(searchParams.sort || "newest")

  // Initialize filters from URL params
  // Инициализиране на филтрите от URL параметрите
  useEffect(() => {
    const minPrice = searchParams.minPrice ? Number.parseInt(searchParams.minPrice) : 0
    const maxPrice = searchParams.maxPrice ? Number.parseInt(searchParams.maxPrice) : 2000
    setPriceRange([minPrice, maxPrice])
    setSort(searchParams.sort || "newest")
  }, [searchParams])

  // Apply filters
  // Прилагане на филтрите
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (sort) {
      params.set("sort", sort)
    }

    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString())
    }

    if (priceRange[1] < 2000) {
      params.set("maxPrice", priceRange[1].toString())
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  // Reset filters
  // Нулиране на филтрите
  const resetFilters = () => {
    setPriceRange([0, 2000])
    setSort("newest")
    router.push(pathname)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Филтри</h3>
        <Accordion type="single" collapsible defaultValue="price" className="w-full">
          <AccordionItem value="price">
            <AccordionTrigger>Ценови диапазон</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Slider
                  defaultValue={priceRange}
                  min={0}
                  max={2000}
                  step={10}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="py-4"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm">${priceRange[0]}</span>
                  <span className="text-sm">${priceRange[1]}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Сортирай по</h3>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Сортирай по" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Най-новите</SelectItem>
            <SelectItem value="price-asc">Цена: Ниска към висока</SelectItem>
            <SelectItem value="price-desc">Цена: Висока към ниска</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={applyFilters}>Приложи филтри</Button>
        <Button variant="outline" onClick={resetFilters}>
          Нулирай филтрите
        </Button>
      </div>
    </div>
  )
}
