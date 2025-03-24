"use client"

import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16 text-center md:px-6 lg:px-8">
      <div className="rounded-full bg-primary/10 p-3">
        <CheckCircle className="h-12 w-12 text-primary" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">Поръчката е направена успешно!</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Благодарим ви за вашата покупка. Получихме вашата поръчка и ще я обработим веднага.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/">Продължете с пазаруването</Link>
        </Button>
        {/* Свържете се с поддръжката */}
        <Button asChild variant="outline">
          <Link href="/contact">Свържете се с поддръжка</Link>
        </Button>
      </div>
    </div>
  )
}
