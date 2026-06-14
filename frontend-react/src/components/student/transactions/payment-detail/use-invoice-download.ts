import { useCallback, useState } from 'react'

import type { IResponse } from '@/lib/types/api'
import { API_ROUTES } from '@/services/api-path'
import { api } from '@/services/axios'

export function useInvoiceDownload() {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadInvoice = useCallback(
    async (enrollmentUid: string, userUid: string, courseUid: string) => {
      setIsDownloading(true)
      try {
        const response = await api.get<IResponse<{ invoice_url: string }>>(
          API_ROUTES.invoices.getInvoiceUrl({
            enrollment_id: enrollmentUid,
            user_id: userUid,
            course_id: courseUid,
          }),
        )
        const invoiceUrl = response.data.data?.invoice_url
        if (invoiceUrl) window.open(invoiceUrl, '_blank', 'noopener,noreferrer')
      } catch {
        return
      } finally {
        setIsDownloading(false)
      }
    },
    [],
  )

  return { isDownloading, downloadInvoice }
}
