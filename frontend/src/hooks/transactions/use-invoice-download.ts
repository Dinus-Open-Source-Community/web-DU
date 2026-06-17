import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { downloadProtectedFile } from '@/lib/files/download-protected-file'
import { parseGetInvoiceUrlQuery } from '@/lib/validator/invoice'
import { fetchInvoiceUrl } from '@/services/invoice'

export function useInvoiceDownload() {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadInvoice = useCallback(
    async (enrollmentUid: string, userUid: string, courseUid: string) => {
      setIsDownloading(true)
      try {
        const query = parseGetInvoiceUrlQuery({
          enrollment_id: enrollmentUid,
          user_id: userUid,
          course_id: courseUid,
        })
        const invoiceUrl = await fetchInvoiceUrl({
          enrollment_id: query.enrollment_id,
          user_id: query.user_id,
          course_id: query.course_id,
        })

        await downloadProtectedFile(invoiceUrl, `invoice-${courseUid}.pdf`)
        toast.success('Invoice berhasil diunduh')
      } catch {
        toast.error('Gagal mengunduh invoice')
      } finally {
        setIsDownloading(false)
      }
    },
    [],
  )

  return { isDownloading, downloadInvoice }
}
