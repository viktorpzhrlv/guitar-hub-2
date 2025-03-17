"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CategorySearch from "@/components/ui/category-search"

interface ProductFiltersProps {
  categorySlug: string
  searchParams: {
    sort?: string
    minPrice?: string
    maxPrice?: string
    search?: string
  }
}

export default function ProductFilters({ categorySlug, searchParams }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Initialize with default price range
  const [minPriceInput, setMinPriceInput] = useState<string>("0")
  const [maxPriceInput, setMaxPriceInput] = useState<string>("")
  const [sort, setSort] = useState<string>(searchParams.sort || "newest")

  // Initialize filters from URL parameters
  useEffect(() => {
    const minPrice = searchParams.minPrice ? searchParams.minPrice : "0"
    const maxPrice = searchParams.maxPrice ? searchParams.maxPrice : ""
    setMinPriceInput(minPrice)
    setMaxPriceInput(maxPrice)
    setSort(searchParams.sort || "newest")
  }, [searchParams])

  // Handle manual input changes
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMinPriceInput(value)
  }
  
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMaxPriceInput(value)
  }

  // Apply all filters
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (sort) {
      params.set("sort", sort)
    }

    const minPrice = parseInt(minPriceInput) || 0
    if (minPrice > 0) {
      params.set("minPrice", minPrice.toString())
    }

    const maxPrice = parseInt(maxPriceInput)
    if (!isNaN(maxPrice) && maxPrice > 0) {
      params.set("maxPrice", maxPrice.toString())
    }

    // Keep the search parameter if it exists
    if (searchParams.search) {
      params.set("search", searchParams.search)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  // Reset all filters
  const resetFilters = () => {
    setMinPriceInput("0")
    setMaxPriceInput("")
    setSort("newest")

    // Keep only the search parameter if it exists
    if (searchParams.search) {
      router.push(`${pathname}?search=${searchParams.search}`)
    } else {
      router.push(pathname)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Филтри</h3>

        {/* Category search component */}
        <div className="mb-6">
          <CategorySearch categorySlug={categorySlug} />
        </div>

        <Accordion type="single" collapsible defaultValue="price" className="w-full">
          <AccordionItem value="price">
            <AccordionTrigger>Ценови диапазон</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={minPriceInput}
                      onChange={handleMinPriceChange}
                      className="w-24"
                      min={0}
                      placeholder="Мин."
                    />
                    <span className="ml-1 text-sm">лв.</span>
                  </div>
                  <div className="flex-shrink-0">—</div>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={maxPriceInput}
                      onChange={handleMaxPriceChange}
                      className="w-24"
                      min={0}
                      placeholder="Макс."
                    />
                    <span className="ml-1 text-sm">лв.</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Сортиране по</h3>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Сортиране по" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Най-нови</SelectItem>
            <SelectItem value="price-asc">Цена: Ниска към висока</SelectItem>
            <SelectItem value="price-desc">Цена: Висока към ниска</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={applyFilters}>Приложи филтрите</Button>
        <Button variant="outline" onClick={resetFilters}>
          Нулирай филтрите
        </Button>
      </div>
    </div>
  )
}

