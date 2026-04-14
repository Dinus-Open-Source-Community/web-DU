"use client"

import { usePathname } from "next/navigation"
import { DuLoader } from "@/components/feedback/DuLoader"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Variant = "stats" | "table" | "cards" | "form" | "simple" | "generic"

function matchVariant(pathname: string): Variant {
  const p = pathname.replace(/\/$/, "") || "/"

  if (p.includes("/transactions")) return "table"
  if (p.includes("/assignments")) return "table"
  if (p.includes("/dashboard")) return "stats"
  if (p.includes("/browse")) return "cards"
  if (p.includes("/certificates")) return "cards"
  if (p.includes("/attendance")) return "table"
  if (p.includes("/edit")) return "form"
  if (p.includes("/courses/") && p.includes("/assignments")) return "table"
  if (p.includes("/courses")) return "cards"
  if (p.includes("/learning")) return "simple"
  if (p.includes("/profile")) return "form"
  if (p === "/admin" || p.startsWith("/admin/")) return "stats"
  return "generic"
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-none">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

function SkeletonTable() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-none">
      <div className="mb-4 flex gap-2 border-b border-border pb-3">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-20" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-2 border-b border-border/80 py-3 last:border-0">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-none">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-[75%]" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonForm() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-xl border border-border bg-card p-6 shadow-none">
      <Skeleton className="h-7 w-48" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  )
}

function SkeletonSimple() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-2/3 max-w-md" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-4 w-5/6 max-w-lg" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  )
}

function SkeletonGeneric() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-full max-w-2xl" />
      <Skeleton className="h-64 w-full max-w-3xl rounded-xl" />
    </div>
  )
}

type RouteSegmentSkeletonProps = {
  className?: string
  /** When true, show small loader above skeleton (authorized main padding already applied by parent) */
  showLoader?: boolean
}

export function RouteSegmentSkeleton({ className, showLoader = true }: RouteSegmentSkeletonProps) {
  const pathname = usePathname()
  const variant = matchVariant(pathname)

  return (
    <div className={cn("flex w-full flex-col gap-8", className)}>
      {showLoader ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <DuLoader size={36} label="Memuat halaman" />
          <span className="text-sm font-medium tracking-tight text-muted-foreground">Memuat…</span>
        </div>
      ) : null}
      {variant === "stats" && <SkeletonStats />}
      {variant === "table" && <SkeletonTable />}
      {variant === "cards" && <SkeletonCards />}
      {variant === "form" && <SkeletonForm />}
      {variant === "simple" && <SkeletonSimple />}
      {variant === "generic" && <SkeletonGeneric />}
    </div>
  )
}
