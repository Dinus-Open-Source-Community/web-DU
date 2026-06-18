import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Message } from '@/lib/Message'
import { useCourseDetail } from '@/hooks/use-course'
import { getApiErrorMessage } from '@/services/api-error'
import { joinCourse } from '@/services/course'
import { createPayment, fetchPaymentMethods } from '@/services/payment'
import type { PaymentMethodItem } from '@/lib/types/checkout/payment-method'
import { paymentKeys } from '@/hooks/query-keys'
import { ROUTES } from '@/lib/routes'
import { parseCourseUidParam } from '@/lib/validator/course-form'
import { parseCreatePaymentRequest } from '@/lib/validator/payment'
import type { CreatePaymentRequestValidated } from '@/lib/validator/payment.schema'

export type PaymentMethodGroup = {
  name: string
  methods: PaymentMethodItem[]
}

type UseCheckoutOptions = {
  enabled?: boolean
  onPaymentStarted?: () => void
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

export function useCheckout(courseUid: string, options: UseCheckoutOptions = {}) {
  const { enabled = true, onPaymentStarted } = options
  const navigate = useNavigate()
  const [selectedCode, setSelectedCode] = useState<CreatePaymentRequestValidated['method'] | null>(null)

  const courseQuery = useCourseDetail(courseUid)

  const methodsQuery = useQuery({
    queryKey: [...paymentKeys.all, 'methods'],
    queryFn: fetchPaymentMethods,
    staleTime: 300_000,
    enabled,
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

  const isLoading =
    enabled &&
    (courseQuery.isLoading || courseQuery.isResolvingImages || methodsQuery.isLoading)
  const isProcessing = joinMutation.isPending || paymentMutation.isPending
  const canSubmit = !!selectedCode && !isProcessing && !!course

  const selectMethod = useCallback((code: CreatePaymentRequestValidated['method']) => {
    setSelectedCode(code)
  }, [])

  const reset = useCallback(() => {
    setSelectedCode(null)
  }, [])

  useEffect(() => {
    if (!enabled) {
      reset()
    }
  }, [enabled, reset])

  const submit = useCallback(async () => {
    if (!courseUid || !selectedCode || !course) return

    const validatedCourseUid = parseCourseUidParam(courseUid)
    const paymentAmount = Math.max(1, Math.round(price))

    try {
      const { enrollment } = await joinMutation.mutateAsync(validatedCourseUid)

      const paymentPayload = parseCreatePaymentRequest({
        enrollment_uid: enrollment.uid,
        method: selectedCode,
        amount: paymentAmount,
        order_items: [{
          sku: validatedCourseUid,
          name: course.title,
          price: paymentAmount,
          quantity: 1,
          product_url: '',
          image_url: course.cover_url ?? '',
        }],
        return_url: `${window.location.origin}${ROUTES.student.transactions}`,
      })

      const result = await paymentMutation.mutateAsync(paymentPayload)

      const ref = result?.data?.reference
      const merchantRef = result?.data?.merchant_ref

      onPaymentStarted?.()

      if (ref || merchantRef) {
        navigate(ROUTES.student.transactionPayment({ reference: ref, merchantRef }))
      } else {
        toast.success(Message.payment.created)
        navigate(ROUTES.student.transactions)
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? getApiErrorMessage(err, Message.payment.processFailed)
          : Message.payment.processFailed,
      )
    }
  }, [
    courseUid,
    selectedCode,
    course,
    price,
    joinMutation,
    paymentMutation,
    navigate,
    onPaymentStarted,
  ])

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
    reset,
  }
}
