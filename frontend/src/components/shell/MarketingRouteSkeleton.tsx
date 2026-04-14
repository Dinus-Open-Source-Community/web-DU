"use client"

import { DuLoader } from "@/components/feedback/DuLoader"
import { Skeleton } from "@/components/ui/skeleton"

/** Simpler skeleton for auth & marketing routes without sidebar. */
export function MarketingRouteSkeleton() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-8 px-4 py-12">
      <DuLoader size={40} label="Memuat" />
      <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-8 shadow-none">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}
