import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { fetchCourseByUid, joinCourse } from '@/services/course'
import { fetchPaymentMethods, createPayment, type PaymentMethodItem } from '@/services/payment'
import { courseKeys, paymentKeys } from '@/hooks/query-keys'
import { ROUTES } from '@/lib/routes'

export type PaymentMethodGroup = {
  name: string
  methods: PaymentMethodItem[]
}

function groupByCategory(methods: PaymentMethodItem[]): PaymentMethodGroup[] {
  const map = new Map<string, PaymentMethodItem[]>()
  for (const m of methods) {
    const list = map.get(m.group) ?? []
    list.push(m)
    map.set(m.group, list)
  }
  return Array.from(map.entries()).map(([name, methods]) => ({ name, methods }))
}

export function useCheckout() {
  const { courseUid } = useParams<{ courseUid: string }>()
  const navigate = useNavigate()
  const [selectedCode, setSelectedCode] = useState<string | null>(null)

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

  const course = courseQuery.data ?? null
  const methods = useMemo(() => methodsQuery.data ?? [], [methodsQuery.data])
  const groups = useMemo(() => groupByCategory(methods), [methods])
  const price = course?.price ?? 0

  const selectedMethod = useMemo(
    () => methods.find((m) => m.code === selectedCode) ?? null,
    [methods, selectedCode],
  )

  const isLoading = courseQuery.isLoading || methodsQuery.isLoading
  const isProcessing = joinMutation.isPending || paymentMutation.isPending
  const canSubmit = !!selectedCode && !isProcessing

  const selectMethod = useCallback((code: string) => {
    setSelectedCode(code)
  }, [])

  const submit = useCallback(async () => {
    if (!courseUid || !selectedCode || !course) return

    try {
      const { enrollment } = await joinMutation.mutateAsync(courseUid)

      const result = await paymentMutation.mutateAsync({
        enrollment_uid: enrollment.uid,
        method: selectedCode,
        amount: price,
        order_items: [{
          sku: courseUid,
          name: course.title,
          price,
          quantity: 1,
          product_url: '',
          image_url: course.cover_url ?? '',
        }],
        return_url: `${window.location.origin}${ROUTES.student.transactions}`,
      })

      const ref = result?.data?.reference
      const merchantRef = result?.data?.merchant_ref

      if (ref || merchantRef) {
        navigate(ROUTES.student.transactionPayment({ reference: ref, merchantRef }))
      } else {
        toast.success('Pembayaran berhasil dibuat')
        navigate(ROUTES.student.transactions)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal memproses pembayaran')
    }
  }, [courseUid, selectedCode, course, price, joinMutation, paymentMutation, navigate])

  const goBack = useCallback(() => navigate(-1), [navigate])

  return {
    course,
    price,
    groups,
    methods,
    selectedCode,
    selectedMethod,
    isLoading,
    isProcessing,
    canSubmit,
    selectMethod,
    submit,
    goBack,
  }
}
