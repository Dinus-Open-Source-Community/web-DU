import type {
  PaymentDetailQuery,
  TripayPaymentApiEnvelope,
} from "@/lib/transactions/payment-api-types";
import { mapTripayPaymentDetail } from "@/lib/transactions/map-tripay-payment-detail";
import type { PaymentDetail } from "@/lib/transactions/payment-types";
import { unwrapTripayPaymentResponse } from "@/lib/transactions/unwrap-tripay-response";
import type { PaymentMethodItem } from "@/lib/types/checkout/payment-method";
import {
  parseCreatePaymentRequest,
  parsePaymentTripayQuery,
} from "@/lib/validator/payment";
import type { z } from "zod";
import { createPaymentRequestSchema } from "@/lib/validator/payment.schema";

import { api } from "./axios";
import { API_ROUTES, type IQueryParamsPayload } from "./api-path";
import { withApiErrorHandling } from "./api-error";
import type { IResponse } from "@/lib/types/api";

export type { PaymentMethodItem, TripayFee } from "@/lib/types/checkout/payment-method";

type CreatePaymentRequestInput = z.input<typeof createPaymentRequestSchema>;

export async function fetchPaymentMethods(): Promise<PaymentMethodItem[]> {
  const response = await api.get<IResponse<PaymentMethodItem[]>>(
    API_ROUTES.payment.method,
  );
  return (response.data.data ?? []).filter((ch) => ch.active);
}

export async function fetchPayments(params?: IQueryParamsPayload) {
  const response = await api.get<IResponse<[]>>(
    API_ROUTES.payment.getAll(params),
  );
  return response.data;
}

export async function fetchTripayPaymentDetail(
  query: PaymentDetailQuery,
): Promise<PaymentDetail> {
  const validatedQuery = parsePaymentTripayQuery({
    reference: query.reference,
    merchantRef: query.merchantRef,
  })

  return withApiErrorHandling(async () => {
    const response = await api.get<TripayPaymentApiEnvelope>(
      API_ROUTES.payment.tripay({
        ...(validatedQuery.reference ? { reference: validatedQuery.reference } : {}),
        ...(validatedQuery.merchant_ref ? { merchant_ref: validatedQuery.merchant_ref } : {}),
      }),
    );

    const data = unwrapTripayPaymentResponse(
      response.data,
      "Gagal mengambil detail pembayaran Tripay",
    );

    return mapTripayPaymentDetail(data);
  }, "Gagal mengambil detail pembayaran Tripay");
}

export async function createPayment(paymentData: CreatePaymentRequestInput) {
  const validated = parseCreatePaymentRequest(paymentData)
  const response = await api.post(API_ROUTES.payment.create, validated);
  return response.data;
}
