import { z } from 'zod'
import {
  beResolvableUidSchema,
  paymentMethodCodeSchema,
  positiveIntSchema,
  returnUrlSchema,
} from './common'

/** Selaras `dto.OrderItem`. */
export const paymentOrderItemSchema = z
  .object({
    sku: z.string().trim().max(128, 'SKU terlalu panjang').optional().default(''),
    name: z.string({ message: 'Nama item wajib diisi' }).trim().min(1, 'Nama item wajib diisi').max(255, 'Nama item terlalu panjang'),
    price: positiveIntSchema,
    quantity: positiveIntSchema,
    product_url: z.string().trim().max(2048, 'Product URL terlalu panjang').optional().default(''),
    image_url: z.string().trim().max(2048, 'Image URL terlalu panjang').optional().default(''),
  })
  .strict()

/** Payload POST `/payment/create` — selaras `dto.CreatePaymentRequest`. */
export const createPaymentRequestSchema = z
  .object({
    enrollment_uid: beResolvableUidSchema.optional(),
    method: paymentMethodCodeSchema,
    amount: positiveIntSchema,
    order_items: z
      .array(paymentOrderItemSchema)
      .min(1, 'Minimal satu item pesanan harus diisi'),
    return_url: returnUrlSchema,
  })
  .strict()

/** Query GET `/payment/tripay` — minimal salah satu param. */
export const paymentTripayQuerySchema = z
  .object({
    reference: z.string().trim().max(128, 'Reference terlalu panjang').optional(),
    merchant_ref: z.string().trim().max(128, 'Merchant ref terlalu panjang').optional(),
  })
  .strict()
  .refine((data) => Boolean(data.reference?.trim()) || Boolean(data.merchant_ref?.trim()), {
    message: 'Reference atau merchant_ref wajib diisi',
  })

export type PaymentOrderItemValidated = z.infer<typeof paymentOrderItemSchema>
export type CreatePaymentRequestValidated = z.infer<typeof createPaymentRequestSchema>
export type PaymentTripayQueryValidated = z.infer<typeof paymentTripayQuerySchema>
