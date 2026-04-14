import Link from "next/link"
import { NotFoundIllustration } from "@/components/feedback/ErrorPageIllustrations"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 bg-background px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 w-[min(100%,240px)] text-primary">
          <NotFoundIllustration className="h-auto w-full" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Alamat yang Anda buka tidak ada atau sudah dipindahkan. Coba mulai dari beranda atau jelajahi kursus.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-xl shadow-none">
            <Link href="/">Beranda</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl shadow-none">
            <Link href="/course">Katalog kursus</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
