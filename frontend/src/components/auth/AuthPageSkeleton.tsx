import { Skeleton } from '@/components/ui/skeleton'

const PLACEHOLDER = 'bg-foreground/10'

/**
 * AuthPageSkeleton — loading state yang meniru struktur AuthLayout supaya
 * tata letak auth sudah terbaca sebelum halaman selesai dimuat. Panel kiri
 * hanya tampil di layar lg+, sama seperti layout asli.
 * Statis: tanpa hover maupun press-effect.
 */
export function AuthPageSkeleton() {
  return (
    <main
      role="status"
      aria-busy
      aria-label="Memuat halaman autentikasi"
      className="grid min-h-dvh bg-muted lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,560px)] xl:grid-cols-[minmax(0,1.15fr)_minmax(480px,620px)] 2xl:grid-cols-[minmax(0,1.2fr)_minmax(520px,680px)]"
    >
      <span className="sr-only">Memuat halaman autentikasi...</span>

      {/* Panel kiri — brand + heading (hanya lg+). */}
      <section className="relative hidden overflow-hidden bg-muted lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.6]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(5,9,20,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(5,9,20,0.05) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-10 pb-12 text-center xl:px-14">
          <Skeleton className={`size-20 rounded-2xl sm:size-24 xl:size-28 ${PLACEHOLDER}`} />
          <Skeleton className={`mt-8 h-9 w-64 max-w-full rounded-xl ${PLACEHOLDER}`} />
          <div className="mt-4 w-full max-w-lg space-y-2">
            <Skeleton className={`mx-auto h-5 w-full rounded-md ${PLACEHOLDER}`} />
            <Skeleton className={`mx-auto h-5 w-4/5 rounded-md ${PLACEHOLDER}`} />
          </div>
        </div>

        {/* Teks footer. */}
        <div className="relative z-10 px-10 pb-8 xl:px-14">
          <Skeleton className={`h-3 w-64 max-w-full rounded-md ${PLACEHOLDER}`} />
        </div>
      </section>

      {/* Panel kanan — kartu form. */}
      <section className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 xl:px-14 2xl:px-20">
        <div className="w-full">
          <div className="mx-auto w-full max-w-md xl:max-w-lg">
            <div className="rounded-[10px] border-2 border-border bg-background p-6 shadow-md sm:p-8">
              {/* Brand mark mobile (lg:hidden seperti aslinya). */}
              <Skeleton className={`mb-2 h-8 w-40 rounded-xl lg:hidden ${PLACEHOLDER}`} />

              <div className="flex flex-col gap-7">
                {/* Judul + deskripsi. */}
                <div className="space-y-2">
                  <Skeleton className={`h-7 w-32 rounded-lg ${PLACEHOLDER}`} />
                  <Skeleton className={`h-4 w-full max-w-[36ch] rounded-md ${PLACEHOLDER}`} />
                  <Skeleton className={`h-4 w-3/4 rounded-md ${PLACEHOLDER}`} />
                </div>

                {/* Baris input. */}
                <div className="space-y-5">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className={`h-4 w-24 rounded-md ${PLACEHOLDER}`} />
                      <Skeleton className={`h-12 w-full rounded-xl ${PLACEHOLDER}`} />
                    </div>
                  ))}
                </div>

                {/* Tombol submit. */}
                <Skeleton className={`h-12 w-full rounded-xl ${PLACEHOLDER}`} />

                {/* Divider. */}
                <div className="relative py-1">
                  <div aria-hidden className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-border/15" />
                  </div>
                  <div className="relative flex justify-center">
                    <Skeleton className={`h-3 w-32 rounded-md bg-background`} />
                  </div>
                </div>

                {/* Tombol OAuth. */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Skeleton className={`h-12 w-full rounded-xl ${PLACEHOLDER}`} />
                  <Skeleton className={`h-12 w-full rounded-xl ${PLACEHOLDER}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
