/** Props data untuk komponen di `components/charts/` (Recharts). */

export interface TransactionRatioPoint {
  label: string
  value: number
  color?: string
}

export interface TopCoursePoint {
  label: string
  value: number
}

export interface NewUsersPoint {
  label: string
  value: number
}

export interface CategoryPoint {
  label: string
  value: number
}

export interface RevenuePoint {
  label: string
  value: number
}

export interface TimelinePoint {
  label: string
  [key: string]: string | number
}

export interface TimelineSeries {
  dataKey: string
  label: string
  color: string
}
