import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function CourseLessonsSkeleton() {
  return (
    <main
      role="status"
      aria-busy="true"
      className="min-h-dvh bg-background text-foreground"
    >
      <span className="sr-only">Memuat daftar materi...</span>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground opacity-60">
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          <span>Kembali ke materi</span>
        </div>

        <header className="mt-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Daftar Materi
          </p>
          <Skeleton className="h-8 w-80 max-w-full rounded-md sm:h-9" />

          <div className="space-y-2 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <Skeleton className="h-4 w-44 rounded-sm" />
              <Skeleton className="h-4 w-10 rounded-sm" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </header>

        <div className="mt-6 space-y-6">
          {[0, 1].map((modIdx) => (
            <section key={modIdx} aria-hidden>
              <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
                <Skeleton className="h-5 w-52 rounded-sm" />
                <Skeleton className="h-4 w-16 rounded-sm" />
              </div>

              <div className="space-y-2">
                {[0, 1, 2].map((lessonIdx) => (
                  <div
                    key={lessonIdx}
                    className="flex items-center gap-3 rounded-xl border bg-card px-3 py-3 sm:px-4"
                  >
                    <Skeleton className="size-5 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Skeleton
                        className={
                          lessonIdx === 0
                            ? 'h-4 w-64 max-w-[85%] rounded-sm'
                            : lessonIdx === 1
                              ? 'h-4 w-52 max-w-[75%] rounded-sm'
                              : 'h-4 w-60 max-w-[80%] rounded-sm'
                        }
                      />
                      <Skeleton className="h-3.5 w-16 rounded-sm" />
                    </div>
                    <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}