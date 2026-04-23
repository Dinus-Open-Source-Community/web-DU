'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { get, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

type InvoiceData = {
  enrollment_uid: string
  user_uid: string
  course_uid: string
  filename: string
  invoice_url: string
  enrolled_at: string
}

export function useInvoiceUrl(enrollmentId: string, userId: string, courseId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.invoices.url(enrollmentId, userId, courseId),
    queryFn: () =>
      get<Envelope<InvoiceData>>('/invoices/url', {
        enrollment_id: enrollmentId,
        user_id: userId,
        course_id: courseId,
      }).then((r) => r.data),
  })
}

export function useInvoiceByEnrollment(enrollmentUid: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.invoices.byEnrollment(enrollmentUid),
    queryFn: () => get<Envelope<InvoiceData>>(`/invoices/${enrollmentUid}`).then((r) => r.data),
  })
}
