"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ErrorBurstIllustration } from "@/components/feedback/ErrorPageIllustrations"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 bg-background px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 w-[min(100%,220px)] text-primary">
          <ErrorBurstIllustration className="h-auto w-full" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Halaman tidak bisa dimuat sementara. Anda bisa mencoba lagi atau kembali ke beranda.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-[11px] text-muted-foreground/80">Ref: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={() => reset()} className="rounded-xl shadow-none">
            Coba lagi
          </Button>
          <Button type="button" variant="outline" asChild className="rounded-xl shadow-none">
            <Link href="/">Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
