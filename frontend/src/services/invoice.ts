import type { IResponse } from '@/lib/types/api'
import { parseGetInvoiceUrlQuery } from '@/lib/validator/invoice'

import { API_ROUTES } from './api-path'
import { unwrapApiResponse, withApiErrorHandling } from './api-error'
import { api } from './axios'

export type InvoiceUrlQuery = {
  enrollment_id: string
  user_id: string
  course_id: string
}

export async function fetchInvoiceUrl(query: InvoiceUrlQuery): Promise<string> {
  const validated = parseGetInvoiceUrlQuery(query)

  return withApiErrorHandling(async () => {
    const response = await api.get<IResponse<{ invoice_url: string }>>(
      API_ROUTES.invoices.getInvoiceUrl({
        enrollment_id: validated.enrollment_id,
        user_id: validated.user_id,
        course_id: validated.course_id,
      }),
    )
    const data = unwrapApiResponse(response.data, 'Gagal mengambil URL invoice')
    const invoiceUrl = data.invoice_url?.trim()
    if (!invoiceUrl) {
      throw new Error('URL invoice tidak tersedia')
    }
    return invoiceUrl
  }, 'Gagal mengambil URL invoice')
}
