import { PaymentSkeletonBone } from './payment-detail/PaymentSkeletonBone'

export function PaymentDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6" aria-busy role="status">
      <span className="sr-only">Memuat detail pembayaran</span>

      <PaymentSkeletonBone className="mb-6 h-8 w-24 rounded-xl" />

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-center gap-0">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <PaymentSkeletonBone className="size-8 !rounded-full" />
              <PaymentSkeletonBone className="h-3 w-16" />
            </div>
            {i < 2 && <PaymentSkeletonBone className="mb-5 h-0.5 w-12 sm:w-20 md:w-28" />}
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <PaymentSkeletonBone className="mb-5 h-5 w-40" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <PaymentSkeletonBone className="h-3 w-20" />
                  <PaymentSkeletonBone className="h-4 w-32" />
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <PaymentSkeletonBone className="h-3 w-24" />
              <PaymentSkeletonBone className="mt-1.5 h-5 w-48" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <PaymentSkeletonBone className="h-4 w-36" />
          </div>

          {/* Course preview */}
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex gap-3">
              <PaymentSkeletonBone className="size-14 !rounded-xl" />
              <div className="flex-1 space-y-2">
                <PaymentSkeletonBone className="h-4 w-40" />
                <PaymentSkeletonBone className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="px-5 py-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex justify-between py-2">
                <PaymentSkeletonBone className="h-4 w-24" />
                <PaymentSkeletonBone className="h-4 w-20" />
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">
            <PaymentSkeletonBone className="h-4 w-32" />
            <PaymentSkeletonBone className="h-6 w-28" />
          </div>

          {/* Action button */}
          <div className="px-5 pb-5">
            <PaymentSkeletonBone className="h-9 w-full !rounded-4xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
