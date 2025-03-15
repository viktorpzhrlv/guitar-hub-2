"use client"

import type React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Package, ShoppingBag, LayoutGrid, LogOut, Menu, Users, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/auth/protected-route"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const navigation = [
    { name: "Продукти", href: "/admin/products", icon: Package },
    { name: "Категории", href: "/admin/categories", icon: LayoutGrid },
    { name: "Поръчки", href: "/admin/orders", icon: ShoppingBag },
    { name: "Потребители", href: "/admin/users", icon: Users },
    { name: "Одобрения", href: "/admin/approvals", icon: CheckCircle },
  ]

  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen flex-col">
        {/* Mobile header - Мобилен хедър */}
        <header className="border-b bg-background px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin/products" className="flex items-center gap-2 font-semibold">
              <Package className="h-5 w-5" />
              <span>Guitar Hub Admin</span>
            </Link>

            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="flex h-full flex-col">
                    <div className="flex items-center gap-2 border-b py-4 font-semibold">
                      <Package className="h-5 w-5" />
                      <span>Guitar Hub Admin</span>
                    </div>
                    <nav className="flex-1 py-4">
                      <ul className="space-y-2">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={`flex items-center gap-3 rounded-md px-3 py-2 ${
                                pathname === item.href
                                  ? "bg-muted font-medium text-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              <item.icon className="h-5 w-5" />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                    <div className="border-t py-4">
                      <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="mr-2 h-5 w-5" />
                        Изход
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Sidebar (desktop) - Странична лента (десктоп) */}
          <aside className="hidden w-64 flex-shrink-0 border-r bg-muted/20 lg:block">
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 border-b px-6 py-4 font-semibold">
                <Package className="h-5 w-5" />
                <span>Guitar Hub Admin</span>
              </div>
              <nav className="flex-1 px-4 py-6">
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 ${
                          pathname === item.href
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="border-t p-4">
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-5 w-5" />
                  Изход
                </Button>
              </div>
            </div>
          </aside>

          {/* Main content - Основно съдържание */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
