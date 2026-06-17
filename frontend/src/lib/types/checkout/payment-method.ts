export interface TripayFee {
  flat: number
  percent: number
}

export interface PaymentMethodItem {
  group: string
  code: string
  name: string
  type: 'direct' | 'redirect'
  fee_merchant: TripayFee
  fee_customer: TripayFee
  total_fee: TripayFee
  minimum_fee: number
  maximum_fee: number
  minimum_amount: number
  maximum_amount: number
  icon_url: string
  active: boolean
}
