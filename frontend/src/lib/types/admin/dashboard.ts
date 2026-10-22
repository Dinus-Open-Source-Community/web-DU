export type AdminKpiIconName =
  | 'users'
  | 'ticket'
  | 'courses'
  | 'completion'
  | 'mint'
  | 'yellow'
  | 'sky'
  | 'lavender'
  | (string & {})

export interface AdminKpi {
  id: string
  label: string
  value: string
  trendValue: number
  trendDirection: 'up' | 'down' | 'neutral'
  trendLabel: string
  iconName: AdminKpiIconName
}
