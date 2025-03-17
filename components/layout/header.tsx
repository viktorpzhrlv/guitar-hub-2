"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ShoppingCart, Menu, X, Guitar, Search, User, LogOut, Settings, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { isAdmin } from "@/lib/firebase/auth"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems } = useCart()
  const { user, signOut } = useAuth()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <nav className="container mx-auto flex items-center justify-between p-4 lg:px-8" aria-label="Глобална">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <Guitar className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Китара Хъб</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Отвори главното меню</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-xl mr-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Търсене на продукти..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                    {totalItems}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <CartSheet />
            </SheetContent>
          </Sheet>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Потребител"} />
                    <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : "П"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Профил
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/seller" className="flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Табло на продавача
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Моите поръчки
                  </Link>
                </DropdownMenuItem>

                {isAdmin(user) && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/products" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Админ панел
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={signOut} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Изход
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default">
              <Link href="/auth/login">Вход</Link>
            </Button>
          )}
        </div>
      </nav>

      {/* Мобилно меню */}
      <div className={`lg:hidden ${mobileMenuOpen ? "fixed inset-0 z-50" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <Guitar className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Китара Хъб</span>
            </Link>
            <Button variant="ghost" className="-m-2.5 rounded-md p-2.5" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">Затвори меню</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="py-6">
                <form onSubmit={handleSearch} className="relative w-full mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Търсене на продукти..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="w-full mb-4">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Виж кошницата
                      {totalItems > 0 && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-primary">
                          {totalItems}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <CartSheet />
                  </SheetContent>
                </Sheet>

                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 py-2">
                      <Avatar>
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Потребител"} />
                        <AvatarFallback>
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : "П"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Профил
                    </Link>

                    <Link
                      href="/seller"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Табло на продавача
                    </Link>

                    <Link
                      href="/orders"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Моите поръчки
                    </Link>

                    {isAdmin(user) && (
                      <Link
                        href="/admin/products"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Админ панел
                      </Link>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        signOut()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Изход
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button asChild className="w-full">
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        Вход
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                        Регистрация
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function CartSheet() {
  const { items, removeItem, totalPrice } = useCart()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold">Кошница</h2>
        <ShoppingCart className="h-5 w-5" />
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Вашата кошница е празна</p>
          <p className="text-sm text-muted-foreground mt-1">Добавете продукти във вашата кошница</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex py-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium">
                        <h3>{item.name}</h3>
                        <p className="ml-4">{item.price.toFixed(2)} лв.</p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-end text-sm">
                      <button
                        type="button"
                        className="font-medium text-destructive hover:text-destructive/80"
                        onClick={() => removeItem(item.id)}
                      >
                        Премахни
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between text-base font-medium">
              <p>Междинна сума</p>
              <p>{totalPrice.toFixed(2)} лв.</p>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">Доставката и данъците се изчисляват при плащане.</p>
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/checkout">Плащане</Link>
              </Button>
            </div>
            <div className="mt-2 flex justify-center text-center text-sm text-muted-foreground">
              <p>
                или{" "}
                <Link href="/cart" className="font-medium text-primary hover:text-primary/80">
                  Виж кошницата
                </Link>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

