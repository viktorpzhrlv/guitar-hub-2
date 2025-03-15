"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16 text-center md:px-6 lg:px-8">
        <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Вашата количка е празна</h1>
        {/* Ако количката е празна */}
        <p className="mb-6 text-muted-foreground">Изглежда, че все още не сте добавили продукти в количката си.</p>
        {/* Съобщение, че количката е празна */}
        <Button asChild>
          <Link href="/">Продължете с пазаруването</Link>
          {/* Бутон за продължаване на пазаруването */}
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold">Количка за пазаруване</h1>
      {/* Заглавие на страницата */}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Продукт</th>
                    {/* Заглавие на колоната за продукт */}
                    <th className="px-4 py-3 text-center text-sm font-medium">Количество</th>
                    {/* Заглавие на колоната за количество */}
                    <th className="px-4 py-3 text-right text-sm font-medium">Цена</th>
                    {/* Заглавие на колоната за цена */}
                    <th className="px-4 py-3 text-right text-sm font-medium">Общо</th>
                    {/* Заглавие на колоната за обща сума */}
                    <th className="px-4 py-3 text-right text-sm font-medium">Действия</th>
                    {/* Заглавие на колоната за действия */}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{item.name}</h3>
                            {/* Име на продукта */}
                            <p className="mt-1 text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                            {/* Цена на продукта */}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-sm">1</td>
                      {/* Количество на продукта */}
                      <td className="px-4 py-4 text-right text-sm">${item.price.toFixed(2)}</td>
                      {/* Цена на продукта */}
                      <td className="px-4 py-4 text-right text-sm font-medium">${item.price.toFixed(2)}</td>
                      {/* Обща цена на продукта */}
                      <td className="px-4 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <Trash className="h-4 w-4 text-destructive" />
                          {/* Икона за изтриване */}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={clearCart}>
              Изчисти количката
              {/* Бутон за изчистване на количката */}
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Продължете с пазаруването</Link>
              {/* Бутон за продължаване на пазаруването */}
            </Button>
          </div>
        </div>

        <div>
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">Резюме на поръчката</h2>
            {/* Заглавие на резюмето на поръчката */}

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Междинна сума</span>
                {/* Текст за междинна сума */}
                <span>${totalPrice.toFixed(2)}</span>
                {/* Стойност на междинната сума */}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доставка</span>
                {/* Текст за доставка */}
                <span>Ще бъде изчислена при плащане</span>
                {/* Стойност на доставката */}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Данък</span>
                {/* Текст за данък */}
                <span>Ще бъде изчислен при плащане</span>
                {/* Стойност на данъка */}
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>Общо</span>
                  {/* Текст за обща сума */}
                  <span>${totalPrice.toFixed(2)}</span>
                  {/* Стойност на общата сума */}
                </div>
              </div>
            </div>

            <Button asChild className="mt-6 w-full">
              <Link href="/checkout">Пристъпете към плащане</Link>
              {/* Бутон за преминаване към плащане */}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
