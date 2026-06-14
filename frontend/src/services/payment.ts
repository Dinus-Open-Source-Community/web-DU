import type {
  PaymentDetailQuery,
  TripayPaymentApiEnvelope,
} from "@/lib/transactions/payment-api-types";
import { mapTripayPaymentDetail } from "@/lib/transactions/map-tripay-payment-detail";
import type { PaymentDetail } from "@/lib/transactions/payment-types";
import { unwrapTripayPaymentResponse } from "@/lib/transactions/unwrap-tripay-response";

import { api } from "./axios";
import { API_ROUTES, type IQueryParamsPayload } from "./api-path";
import { withApiErrorHandling } from "./api-error";
import type { IResponse } from "@/lib/types/api";

export interface TripayFee {
  flat: number;
  percent: number;
}

export interface PaymentMethodItem {
  group: string;
  code: string;
  name: string;
  type: 'direct' | 'redirect';
  fee_merchant: TripayFee;
  fee_customer: TripayFee;
  total_fee: TripayFee;
  minimum_fee: number;
  maximum_fee: number;
  minimum_amount: number;
  maximum_amount: number;
  icon_url: string;
  active: boolean;
}

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
  return withApiErrorHandling(async () => {
    const response = await api.get<TripayPaymentApiEnvelope>(
      API_ROUTES.payment.tripay({
        ...(query.reference ? { reference: query.reference } : {}),
        ...(query.merchantRef ? { merchant_ref: query.merchantRef } : {}),
      }),
    );

    const data = unwrapTripayPaymentResponse(
      response.data,
      "Gagal mengambil detail pembayaran Tripay",
    );

    return mapTripayPaymentDetail(data);
  }, "Gagal mengambil detail pembayaran Tripay");
}

export async function createPayment(paymentData: unknown) {
  const response = await api.post(API_ROUTES.payment.create, paymentData);
  return response.data;
}
