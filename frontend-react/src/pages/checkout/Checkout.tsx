import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import GuestLayout from '@/components/layouts/GuestLayouts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchCourseByUid, joinCourse } from '@/services/course'
import { fetchPaymentMethods, type PaymentMethodItem } from '@/services/payment'
import { createPayment } from '@/services/payment'
import { courseKeys, paymentKeys } from '@/hooks/query-keys'
import { ROUTES } from '@/lib/routes'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

function CheckoutSkeleton() {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[120px] w-full rounded-2xl" />
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-[280px] rounded-2xl" />
    </div>
  )
}

function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: {
  method: PaymentMethodItem
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all duration-150
        ${selected
          ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-600/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
        }`}
    >
      {selected && (
        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      {method.image_url ? (
        <img
          src={method.image_url}
          alt={method.name}
          className="h-8 w-auto max-w-[80px] object-contain"
        />
      ) : (
        <div className="flex h-8 w-12 items-center justify-center rounded bg-slate-100 text-[10px] font-semibold text-slate-500">
          {method.name}
        </div>
      )}
      <span className="text-xs font-medium text-slate-700">{method.name}</span>
    </button>
  )
}

export default function CheckoutPage() {
  const { courseUid } = useParams<{ courseUid: string }>()
  const navigate = useNavigate()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const courseQuery = useQuery({
    queryKey: courseKeys.detail(courseUid ?? ''),
    queryFn: () => fetchCourseByUid(courseUid!),
    enabled: !!courseUid,
  })

  const methodsQuery = useQuery({
    queryKey: [...paymentKeys.all, 'methods'],
    queryFn: fetchPaymentMethods,
    staleTime: 300_000,
  })

  const joinMutation = useMutation({ mutationFn: joinCourse })
  const paymentMutation = useMutation({ mutationFn: createPayment })

  const course = courseQuery.data
  const methods = methodsQuery.data ?? []
  const isLoading = courseQuery.isLoading || methodsQuery.isLoading
  const price = course?.price ?? 0

  const selectedMethodData = useMemo(
    () => methods.find((m) => m.name === selectedMethod),
    [methods, selectedMethod],
  )

  const handleCheckout = useCallback(async () => {
    if (!courseUid || !selectedMethod || !course) return

    try {
      const joinResult = await joinMutation.mutateAsync(courseUid)
      const enrollmentUid = joinResult.enrollment.uid

      const paymentResult = await paymentMutation.mutateAsync({
        enrollment_uid: enrollmentUid,
        method: selectedMethod,
        amount: price,
        order_items: [
          {
            sku: courseUid,
            name: course.title,
            price: price,
            quantity: 1,
            product_url: '',
            image_url: course.cover_url ?? '',
          },
        ],
        return_url: `${window.location.origin}${ROUTES.student.transactions}`,
      })

      const ref = paymentResult?.data?.reference
      const merchantRef = paymentResult?.data?.merchant_ref
      if (ref || merchantRef) {
        navigate(ROUTES.student.transactionPayment({ reference: ref, merchantRef }))
      } else {
        toast.success('Pembayaran berhasil dibuat')
        navigate(ROUTES.student.transactions)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses pembayaran'
      toast.error(message)
    }
  }, [courseUid, selectedMethod, course, price, joinMutation, paymentMutation, navigate])

  const isProcessing = joinMutation.isPending || paymentMutation.isPending

  if (isLoading) {
    return (
      <GuestLayout>
        <main className="min-h-[100dvh] bg-slate-50">
          <CheckoutSkeleton />
        </main>
      </GuestLayout>
    )
  }

  if (!course) {
    return (
      <GuestLayout>
        <main className="flex min-h-[60dvh] items-center justify-center bg-slate-50">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-800">Kursus tidak ditemukan</h2>
            <p className="mt-1 text-sm text-slate-500">Silakan kembali dan coba lagi.</p>
            <Button className="mt-4" onClick={() => navigate(ROUTES.courses)}>
              Kembali
            </Button>
          </div>
        </main>
      </GuestLayout>
    )
  }

  return (
    <GuestLayout>
      <main className="min-h-[100dvh] bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <h1 className="mb-8 text-2xl font-bold text-slate-900">Checkout</h1>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Left - Payment Method Selection */}
            <div className="space-y-6">
              {/* Course Summary (mobile-first, shows above on small screens) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:hidden">
                <CourseSummaryContent course={course} price={price} />
              </div>

              {/* Payment Methods */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h2 className="mb-1 text-base font-semibold text-slate-900">Pilih Metode Pembayaran</h2>
                <p className="mb-5 text-sm text-slate-500">Pilih salah satu metode untuk melanjutkan pembayaran</p>

                {methods.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
                    Tidak ada metode pembayaran tersedia
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {methods.map((method) => (
                      <PaymentMethodCard
                        key={method.uid}
                        method={method}
                        selected={selectedMethod === method.name}
                        onSelect={() => setSelectedMethod(method.name)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button (mobile) */}
              <div className="lg:hidden">
                <Button
                  className="w-full rounded-xl py-3 text-sm font-semibold"
                  disabled={!selectedMethod || isProcessing}
                  onClick={handleCheckout}
                >
                  {isProcessing ? 'Memproses...' : `Bayar ${formatCurrency(price)}`}
                </Button>
              </div>
            </div>

            {/* Right - Order Summary (desktop sticky) */}
            <div className="hidden lg:block">
              <div className="sticky top-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-base font-semibold text-slate-900">Ringkasan Pesanan</h2>
                <CourseSummaryContent course={course} price={price} />

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Total</span>
                    <span className="text-lg font-bold text-slate-900">{formatCurrency(price)}</span>
                  </div>
                </div>

                {selectedMethodData && (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    {selectedMethodData.image_url && (
                      <img src={selectedMethodData.image_url} alt="" className="h-5 w-auto" />
                    )}
                    <span className="text-xs text-slate-600">Bayar via <strong>{selectedMethodData.name}</strong></span>
                  </div>
                )}

                <Button
                  className="w-full rounded-xl py-3 text-sm font-semibold"
                  disabled={!selectedMethod || isProcessing}
                  onClick={handleCheckout}
                >
                  {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GuestLayout>
  )
}

function CourseSummaryContent({ course, price }: { course: { cover_url?: string; title?: string; level?: string }; price: number }) {
  return (
    <div className="flex gap-4">
      {course.cover_url ? (
        <img
          src={course.cover_url}
          alt={course.title}
          className="h-20 w-28 flex-shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
          <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      )}
      <div className="flex min-w-0 flex-col justify-center">
        <h3 className="truncate text-sm font-semibold text-slate-900">{course.title}</h3>
        {course.level && (
          <span className="mt-0.5 text-xs text-slate-500">{course.level}</span>
        )}
        <span className="mt-1 text-sm font-bold text-blue-600">{formatCurrency(price)}</span>
      </div>
    </div>
  )
}
