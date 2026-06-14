import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Lock, ShieldCheck, BookOpen, Loader2 } from 'lucide-react'

import GuestLayout from '@/components/layouts/GuestLayouts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { useCheckout, type PaymentMethodGroup } from '@/hooks/use-checkout'
import {
  formatCurrency,
  formatFeeLabel,
  presentCheckoutCourse,
  presentPaymentMethod,
  type CheckoutCourseViewModel,
  type PaymentMethodCardViewModel,
} from '@/lib/checkout/present-checkout-view'
import type { PaymentMethodItem } from '@/services/payment'

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function CheckoutSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[140px] w-full rounded-2xl" />
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-[320px] rounded-2xl" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Course Not Found
// ---------------------------------------------------------------------------

function CourseNotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-4 text-center">
      <BookOpen className="size-12 text-slate-300" aria-hidden />
      <h2 className="mt-4 text-lg font-bold text-slate-900">Kursus tidak ditemukan</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">
        Kursus yang Anda cari tidak tersedia atau sudah dihapus.
      </p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.courses}>Kembali ke Katalog</Link>
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Payment Method Card
// ---------------------------------------------------------------------------

function MethodCard({
  vm,
  selected,
  onSelect,
}: {
  vm: PaymentMethodCardViewModel
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-150',
        selected
          ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
      )}
    >
      {selected && (
        <span className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-primary">
          <Check className="size-3 text-white" strokeWidth={3} aria-hidden />
        </span>
      )}

      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
        {vm.iconUrl ? (
          <img src={vm.iconUrl} alt="" className="h-6 w-auto max-w-[40px] object-contain" />
        ) : (
          <span className="text-[9px] font-bold text-slate-400">{vm.code}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{vm.name}</p>
        <p className={cn(
          'text-xs',
          vm.isFree ? 'font-medium text-emerald-600' : 'text-slate-400',
        )}>
          {vm.isFree ? 'Tanpa biaya tambahan' : `Biaya ${vm.feeLabel}`}
        </p>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Method Group
// ---------------------------------------------------------------------------

function MethodGroupSection({
  group,
  selectedCode,
  onSelect,
}: {
  group: PaymentMethodGroup
  selectedCode: string | null
  onSelect: (code: string) => void
}) {
  const viewModels = useMemo(
    () => group.methods.map(presentPaymentMethod),
    [group.methods],
  )

  return (
    <div className="px-5 py-5 sm:px-6">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        {group.name}
      </h3>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {viewModels.map((vm) => (
          <MethodCard
            key={vm.code}
            vm={vm}
            selected={selectedCode === vm.code}
            onSelect={() => onSelect(vm.code)}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Course Preview
// ---------------------------------------------------------------------------

function CoursePreview({ vm }: { vm: CheckoutCourseViewModel }) {
  return (
    <div className="flex gap-4">
      {vm.coverUrl ? (
        <img
          src={vm.coverUrl}
          alt={vm.title}
          className="size-16 shrink-0 rounded-xl object-cover sm:size-20"
        />
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 sm:size-20">
          <BookOpen className="size-7 text-primary/40" aria-hidden />
        </div>
      )}
      <div className="flex min-w-0 flex-col justify-center">
        <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{vm.title}</p>
        {vm.level && (
          <p className="mt-0.5 text-xs text-slate-500">{vm.level}</p>
        )}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-extrabold tracking-tight text-primary">{vm.priceLabel}</span>
          {vm.strikePriceLabel && (
            <span className="text-xs text-slate-400 line-through">{vm.strikePriceLabel}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Order Summary Sidebar
// ---------------------------------------------------------------------------

function OrderSummary({
  courseVm,
  price,
  selectedMethod,
  canSubmit,
  isProcessing,
  onSubmit,
}: {
  courseVm: CheckoutCourseViewModel
  price: number
  selectedMethod: PaymentMethodItem | null
  canSubmit: boolean
  isProcessing: boolean
  onSubmit: () => void
}) {
  const feeLabel = selectedMethod ? formatFeeLabel(selectedMethod.fee_customer) : null

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-sm font-bold text-slate-900">Ringkasan Pesanan</h2>
      </div>

      <div className="border-b border-slate-100 px-6 py-5">
        <CoursePreview vm={courseVm} />
      </div>

      <div className="space-y-2.5 px-6 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Harga</span>
          <span className="font-semibold tabular-nums text-slate-800">{formatCurrency(price)}</span>
        </div>
        {feeLabel && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Biaya admin</span>
            <span className={cn(
              'font-semibold tabular-nums',
              feeLabel === 'Gratis' ? 'text-emerald-600' : 'text-slate-800',
            )}>
              {feeLabel}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-6 py-4">
        <span className="text-sm font-bold text-slate-900">Total</span>
        <span className="text-lg font-extrabold tabular-nums tracking-tight text-primary">
          {formatCurrency(price)}
        </span>
      </div>

      {selectedMethod && (
        <div className="px-6 pt-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2">
            {selectedMethod.icon_url && (
              <img src={selectedMethod.icon_url} alt="" className="h-4 w-auto shrink-0" />
            )}
            <span className="text-xs text-slate-500">
              Bayar via <strong className="font-semibold text-slate-700">{selectedMethod.name}</strong>
            </span>
          </div>
        </div>
      )}

      <div className="p-6 pt-4">
        <Button
          className="w-full text-sm font-bold"
          size="lg"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Memproses...
            </>
          ) : (
            'Bayar Sekarang'
          )}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Trust Bar
// ---------------------------------------------------------------------------

function TrustBar() {
  return (
    <div className="flex items-center justify-center gap-6 py-3">
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        <Lock className="size-3" aria-hidden />
        Terenkripsi SSL
      </span>
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="size-3" aria-hidden />
        Pembayaran Aman
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const {
    course,
    price,
    groups,
    selectedCode,
    selectedMethod,
    isLoading,
    isProcessing,
    canSubmit,
    selectMethod,
    submit,
    goBack,
  } = useCheckout()

  if (isLoading) {
    return (
      <GuestLayout>
        <main className="min-h-[100dvh] bg-slate-50/60">
          <CheckoutSkeleton />
        </main>
      </GuestLayout>
    )
  }

  if (!course) {
    return (
      <GuestLayout>
        <main className="min-h-[100dvh] bg-slate-50/60">
          <CourseNotFound />
        </main>
      </GuestLayout>
    )
  }

  const courseVm = presentCheckoutCourse(course)

  return (
    <GuestLayout>
      <main className="min-h-[100dvh] bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* Navigation */}
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-6 text-slate-500 hover:text-slate-800"
            onClick={goBack}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Kembali
          </Button>

          {/* Title */}
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pilih metode pembayaran untuk menyelesaikan pesanan
          </p>

          {/* Two-column layout */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">

            {/* Left: Method Selection */}
            <div className="space-y-5">

              {/* Course card (mobile only) */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:hidden">
                <CoursePreview vm={courseVm} />
              </div>

              {/* Methods */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                  <h2 className="text-sm font-bold text-slate-900">
                    Metode Pembayaran
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Pilih salah satu metode di bawah
                  </p>
                </div>

                {groups.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <p className="text-sm text-slate-400">Tidak ada metode tersedia saat ini</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {groups.map((g) => (
                      <MethodGroupSection
                        key={g.name}
                        group={g}
                        selectedCode={selectedCode}
                        onSelect={selectMethod}
                      />
                    ))}
                  </div>
                )}
              </div>

              <TrustBar />

              {/* CTA (mobile) */}
              <div className="lg:hidden">
                <Button
                  className="w-full text-sm font-bold"
                  size="lg"
                  disabled={!canSubmit}
                  onClick={submit}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Memproses...
                    </>
                  ) : (
                    `Bayar ${formatCurrency(price)}`
                  )}
                </Button>
              </div>
            </div>

            {/* Right: Order Summary (desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <OrderSummary
                  courseVm={courseVm}
                  price={price}
                  selectedMethod={selectedMethod}
                  canSubmit={canSubmit}
                  isProcessing={isProcessing}
                  onSubmit={submit}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </GuestLayout>
  )
}
