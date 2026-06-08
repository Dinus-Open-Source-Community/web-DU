export interface IChartDataPoint {
  label: string
  value: number
}

export interface IChartRatioPoint extends IChartDataPoint {
  color: string
}

export interface ITimelinePoint {
  label: string
  [key: string]: string | number
}

export interface ITimelineSeries {
  dataKey: string
  label: string
  color: string
}

export interface ITransactionTimelinePoint {
  label: string
  paid: number
  pending: number
  failed: number
  [key: string]: string | number
}

/** Alias backward-compat. */
export type TransactionRatioPoint = IChartRatioPoint
export type TopCoursePoint = IChartDataPoint
export type NewUsersPoint = IChartDataPoint
export type CategoryPoint = IChartDataPoint
export type RevenuePoint = IChartDataPoint
export type TimelinePoint = ITimelinePoint
export type TimelineSeries = ITimelineSeries
export type TransactionTimelinePoint = ITransactionTimelinePoint
export type ChartRatioPoint = IChartRatioPoint
export type ChartDataPoint = IChartDataPoint
