import { api } from './axios'
import { API_ROUTES, type IQueryParamsPayload } from './api-path'
import type { IResponse } from '@/lib/types/api'

export async function fetchPayments(params?: IQueryParamsPayload) {
  const response = await api.get<IResponse<[]>>(API_ROUTES.payment.getAll(params))
  return response.data
}

export async function createPayment(paymentData: unknown) {
  const response = await api.post(API_ROUTES.payment.create, paymentData)
  return response.data
}
