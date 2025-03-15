"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/types"

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, items } = useCart()

  // Проверка дали продуктът вече е в количката
  const isInCart = items.some((item) => item.productId === product.id)

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/images/product-placeholder.jpg",
      quantity: 1,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
    })
  }

  return (
    <Button onClick={handleAddToCart} className="w-full" disabled={isInCart}>
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isInCart ? "Добавен в количката" : "Добави в количката"}
    </Button>
  )
}
