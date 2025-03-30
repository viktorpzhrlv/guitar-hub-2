"use client"

import { Skeleton } from "@/components/ui/skeleton"
import AdminLayout from "@/components/layout/admin-layout"

export default function Loading() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="mt-6">
        <Skeleton className="h-12 w-full mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-md">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}