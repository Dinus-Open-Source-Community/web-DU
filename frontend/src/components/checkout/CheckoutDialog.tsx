import { useMemo } from 'react'
import { BookOpen, Check, Loader2 } from 'lucide-react'

import { useCheckout, type PaymentMethodGroup } from '@/hooks/use-checkout'
import {
  formatCurrency,
  formatFeeLabel,
  presentCheckoutCourse,
  presentPaymentMethod,
  type CheckoutCourseViewModel,
  type PaymentMethodCardViewModel,
} from '@/lib/checkout/present-checkout-view'
import { CHECKOUT_LOTTIE_SRC } from '@/lib/transactions/payment-motion'
import type { PaymentMethodItem } from '@/lib/types/checkout/payment-method'
import type { CreatePaymentRequestValidated } from '@/lib/validator/payment.schema'
import { SafeLottie } from '@/components/ui/lottie'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type CheckoutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseUid: string
}

function CheckoutDialogSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-2">
      <Skeleton className="mx-auto h-44 w-44 rounded-2xl" />
      <Skeleton className="mx-auto h-5 w-56" />
      <Skeleton className="mx-auto h-4 w-72" />
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

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
        'relative flex items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition-all duration-150',
        selected
          ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
      )}
    >
      {selected && (
        <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-primary">
          <Check className="size-2.5 text-white" strokeWidth={3} aria-hidden />
        </span>
      )}

      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
        {vm.iconUrl ? (
          <img src={vm.iconUrl} alt="" className="h-5 w-auto max-w-[36px] object-contain" />
        ) : (
          <span className="text-[9px] font-bold text-slate-400">{vm.code}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{vm.name}</p>
        <p
          className={cn(
            'text-xs',
            vm.isFree ? 'font-medium text-emerald-600' : 'text-slate-400',
          )}
        >
          {vm.isFree ? 'Tanpa biaya tambahan' : `Biaya ${vm.feeLabel}`}
        </p>
      </div>
    </button>
  )
}

function MethodGroupSection({
  group,
  selectedCode,
  onSelect,
}: {
  group: PaymentMethodGroup
  selectedCode: CreatePaymentRequestValidated['method'] | null
  onSelect: (code: CreatePaymentRequestValidated['method']) => void
}) {
  const viewModels = useMemo(
    () => group.methods.map(presentPaymentMethod),
    [group.methods],
  )

  return (
    <div>
      <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
        {group.name}
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {viewModels.map((vm) => (
          <MethodCard
            key={vm.code}
            vm={vm}
            selected={selectedCode === vm.code}
            onSelect={() => onSelect(vm.code as CreatePaymentRequestValidated['method'])}
          />
        ))}
      </div>
    </div>
  )
}

function CoursePreview({ vm }: { vm: CheckoutCourseViewModel }) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      {vm.coverUrl ? (
        <img
          src={vm.coverUrl}
          alt={vm.title}
          className="size-16 shrink-0 rounded-xl object-cover sm:size-[4.5rem]"
        />
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 sm:size-[4.5rem]">
          <BookOpen className="size-7 text-primary/40" aria-hidden />
        </div>
      )}
      <div className="flex min-w-0 flex-col justify-center">
        <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{vm.title}</p>
        {vm.level && <p className="mt-0.5 text-xs text-slate-500">{vm.level}</p>}
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

function OrderSummaryInline({
  price,
  selectedMethod,
}: {
  price: number
  selectedMethod: PaymentMethodItem | null
}) {
  const feeLabel = selectedMethod ? formatFeeLabel(selectedMethod.fee_customer) : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold text-slate-900">Ringkasan Pesanan</h3>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Harga</span>
          <span className="font-semibold tabular-nums text-slate-800">{formatCurrency(price)}</span>
        </div>
        {feeLabel && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Biaya admin</span>
            <span
              className={cn(
                'font-semibold tabular-nums',
                feeLabel === 'Gratis' ? 'text-emerald-600' : 'text-slate-800',
              )}
            >
              {feeLabel}
            </span>
          </div>
        )}
        <Separator className="my-1" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900">Total</span>
          <span className="text-lg font-extrabold tabular-nums tracking-tight text-primary">
            {formatCurrency(price)}
          </span>
        </div>
      </div>

      {selectedMethod && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
          {selectedMethod.icon_url && (
            <img src={selectedMethod.icon_url} alt="" className="h-4 w-auto shrink-0" />
          )}
          <span className="text-xs text-slate-500">
            Bayar via <strong className="font-semibold text-slate-700">{selectedMethod.name}</strong>
          </span>
        </div>
      )}
    </div>
  )
}

export function CheckoutDialog({ open, onOpenChange, courseUid }: CheckoutDialogProps) {
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
  } = useCheckout(courseUid, {
    enabled: open,
    onPaymentStarted: () => onOpenChange(false),
  })

  const courseVm = course ? presentCheckoutCourse(course) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92dvh,820px)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <div className="flex flex-col items-center px-6 pt-6 pb-5 text-center">
          <div className="mx-auto flex h-44 w-44 shrink-0 items-center justify-center sm:h-48 sm:w-48 [&_canvas]:h-full [&_canvas]:w-full [&_svg]:h-full [&_svg]:w-full">
            <SafeLottie
              src={CHECKOUT_LOTTIE_SRC}
              className="h-full w-full"
              loop
              autoplay
            />
          </div>
          <DialogTitle className="mt-3 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Selesaikan Pendaftaran
          </DialogTitle>
          <DialogDescription className="mt-1 max-w-md text-sm leading-relaxed text-slate-500">
            Pilih metode pembayaran favorit Anda untuk mengakses materi kursus ini.
          </DialogDescription>
        </div>

        <Separator />

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <CheckoutDialogSkeleton />
          ) : !course || !courseVm ? (
            <div className="flex flex-col items-center py-10 text-center">
              <BookOpen className="size-10 text-slate-300" aria-hidden />
              <p className="mt-3 text-sm font-medium text-slate-700">Kursus tidak ditemukan</p>
              <p className="mt-1 text-xs text-slate-500">Silakan tutup dialog dan coba lagi.</p>
            </div>
          ) : (
            <>
              <CoursePreview vm={courseVm} />

              <div>
                <h3 className="text-sm font-bold text-slate-900">Metode Pembayaran</h3>
                <p className="mt-0.5 text-xs text-slate-400">Pilih salah satu metode di bawah</p>

                {groups.length === 0 ? (
                  <p className="mt-6 text-center text-sm text-slate-400">
                    Tidak ada metode tersedia saat ini
                  </p>
                ) : (
                  <div className="mt-4 space-y-5">
                    {groups.map((group) => (
                      <MethodGroupSection
                        key={group.name}
                        group={group}
                        selectedCode={selectedCode}
                        onSelect={selectMethod}
                      />
                    ))}
                  </div>
                )}
              </div>

              <OrderSummaryInline price={price} selectedMethod={selectedMethod} />
            </>
          )}
        </div>

        <Separator />

        <div className="px-6 py-4">
          <Button
            className="w-full text-sm font-bold"
            size="lg"
            disabled={!canSubmit || isLoading}
            onClick={() => void submit()}
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
      </DialogContent>
    </Dialog>
  )
}
