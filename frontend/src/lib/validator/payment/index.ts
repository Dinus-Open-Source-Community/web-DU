import type { z } from 'zod'
import { parseWithValidationMessage } from '../errors'
import {
  createPaymentRequestSchema,
  paymentTripayQuerySchema,
  type CreatePaymentRequestValidated,
  type PaymentTripayQueryValidated,
} from '../payment.schema'

export * from '../payment.schema'

export function parseCreatePaymentRequest(
  payload: z.input<typeof createPaymentRequestSchema>,
  fallback = 'Payload pembayaran tidak valid',
): CreatePaymentRequestValidated {
  return parseWithValidationMessage(createPaymentRequestSchema, payload, fallback)
}

export function parsePaymentTripayQuery(
  query: { reference?: string | null; merchantRef?: string | null },
  fallback = 'Parameter detail pembayaran tidak valid',
): PaymentTripayQueryValidated {
  return parseWithValidationMessage(
    paymentTripayQuerySchema,
    {
      reference: query.reference ?? undefined,
      merchant_ref: query.merchantRef ?? undefined,
    },
    fallback,
  )
}
