"use client"

import { useEffect } from "react"
import { ErrorBurstIllustration } from "@/components/feedback/ErrorPageIllustrations"

export default function GlobalError({
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
    <html lang="id">
      <body className="m-0 min-h-[100dvh] bg-[#fdfdfb] font-sans antialiased text-[#232323]">
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 px-6 py-16">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-8 w-[min(100%,220px)] text-[#0a84dc]">
              <ErrorBurstIllustration className="h-auto w-full" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Aplikasi bermasalah</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#545454]">
              Muat ulang halaman untuk mencoba lagi.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-8 inline-flex h-10 items-center justify-center rounded-xl bg-[#0a84dc] px-5 text-sm font-medium text-white transition-colors hover:bg-[#0a84dc]/90">
              Muat ulang
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
