import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Message } from '@/lib/Message'
import { downloadProtectedFile } from '@/lib/files/download-protected-file'
import { parseGetInvoiceUrlQuery } from '@/lib/validator/invoice'
import { fetchInvoiceUrl } from '@/services/invoice'
import { useAuth } from '@/providers/auth-provider'

export function useInvoiceDownload() {
  const { user } = useAuth()
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadInvoice = useCallback(
    async (enrollmentUid: string, courseUid: string) => {
      if (!user?.uid) {
        toast.error(Message.invoice.loginRequired)
        return
      }

      setIsDownloading(true)
      try {
        const query = parseGetInvoiceUrlQuery({
          enrollment_id: enrollmentUid,
          user_id: user.uid,
          course_id: courseUid,
        })
        const invoiceUrl = await fetchInvoiceUrl({
          enrollment_id: query.enrollment_id,
          user_id: query.user_id,
          course_id: query.course_id,
        })

        await downloadProtectedFile(invoiceUrl, `invoice-${courseUid}.pdf`)
        toast.success(Message.invoice.downloadSuccess)
      } catch {
        toast.error(Message.invoice.downloadFailed)
      } finally {
        setIsDownloading(false)
      }
    },
    [user],
  )

  return { isDownloading, downloadInvoice }
}
