/** Tailwind-aligned layout tiers: sm/md mobile, lg desktop (default). */
export const LAYOUT_BREAKPOINTS = {
  md: 768,
  lg: 1024,
} as const

export type LayoutTier = 'mobile' | 'tablet' | 'desktop'

/** Sidebar sheet overlay below lg; fixed sidebar at lg+. */
export const SIDEBAR_SHEET_MAX_WIDTH = LAYOUT_BREAKPOINTS.lg - 1

export function getLayoutTier(width: number): LayoutTier {
  if (width >= LAYOUT_BREAKPOINTS.lg) return 'desktop'
  if (width >= LAYOUT_BREAKPOINTS.md) return 'tablet'
  return 'mobile'
}

export function isSidebarSheetViewport(width: number) {
  return width < LAYOUT_BREAKPOINTS.lg
}
