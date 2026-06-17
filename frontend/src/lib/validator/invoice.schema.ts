import { z } from 'zod'
import { beResolvableUidSchema } from './common'

/** Query GET `/invoices/url` — selaras handler course invoice (enrollment_id, user_id, course_id). */
export const getInvoiceUrlQuerySchema = z
  .object({
    enrollment_id: beResolvableUidSchema,
    user_id: beResolvableUidSchema,
    course_id: beResolvableUidSchema,
  })
  .strict()

export const invoiceEnrollmentUidParamSchema = beResolvableUidSchema

export type GetInvoiceUrlQueryValidated = z.infer<typeof getInvoiceUrlQuerySchema>
