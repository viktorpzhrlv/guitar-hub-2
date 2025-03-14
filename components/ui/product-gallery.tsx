"use client"

import { useState } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductGalleryProps {
  images: string[]
}

export default function ProductGallery({ images = [] }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [mainCarouselRef, mainCarousel] = useEmblaCarousel()
  const [thumbCarouselRef, thumbCarousel] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  })

  const scrollPrev = () => {
    if (mainCarousel) mainCarousel.scrollPrev()
  }

  const scrollNext = () => {
    if (mainCarousel) mainCarousel.scrollNext()
  }

  const onThumbClick = (index: number) => {
    if (!mainCarousel || !thumbCarousel) return

    mainCarousel.scrollTo(index)
    setSelectedIndex(index)
  }

  // If there are no images, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image src="/placeholder.svg" alt="Product image" fill className="object-cover" />
      </div>
    )
  }

  // Filter out any invalid image URLs
  const validImages = images.filter(img => img && typeof img === 'string');
  
  // If all images were invalid, show placeholder
  if (validImages.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image src="/placeholder.svg" alt="Product image" fill className="object-cover" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Carousel */}
      <div className="relative overflow-hidden rounded-lg" ref={mainCarouselRef}>
        <div className="flex">
          {validImages.map((image, index) => (
            <div key={index} className="relative min-w-0 flex-[0_0_100%]">
              <div className="aspect-square">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {validImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80"
              onClick={scrollNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Carousel */}
      {validImages.length > 1 && (
        <div className="overflow-hidden" ref={thumbCarouselRef}>
          <div className="flex gap-2">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => onThumbClick(index)}
                className={`relative min-w-0 flex-[0_0_20%] cursor-pointer overflow-hidden rounded-md ${
                  selectedIndex === index ? "ring-2 ring-primary" : "ring-1 ring-border"
                }`}
              >
                <div className="aspect-square">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

