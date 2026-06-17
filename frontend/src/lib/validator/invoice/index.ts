import { parseWithValidationMessage } from '../errors'
import {
  getInvoiceUrlQuerySchema,
  invoiceEnrollmentUidParamSchema,
  type GetInvoiceUrlQueryValidated,
} from '../invoice.schema'

export * from '../invoice.schema'

export function parseGetInvoiceUrlQuery(
  query: {
    enrollment_id: string
    user_id: string
    course_id: string
  },
  fallback = 'Parameter invoice tidak valid',
): GetInvoiceUrlQueryValidated {
  return parseWithValidationMessage(getInvoiceUrlQuerySchema, query, fallback)
}

export function parseInvoiceEnrollmentUidParam(uid: string, fallback = 'UID enrollment tidak valid'): string {
  return parseWithValidationMessage(invoiceEnrollmentUidParamSchema, uid, fallback)
}
