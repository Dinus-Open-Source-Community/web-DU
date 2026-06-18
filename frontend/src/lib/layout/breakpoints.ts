/** Tailwind-aligned layout tiers: sm/md mobile, lg tablet, xl/2xl desktop. */
export const LAYOUT_BREAKPOINTS = {
  lg: 1024,
  xl: 1280,
} as const

export type LayoutTier = 'mobile' | 'tablet' | 'desktop'

/** Sidebar sheet overlay below xl; fixed sidebar at xl+. */
export const SIDEBAR_SHEET_MAX_WIDTH = LAYOUT_BREAKPOINTS.xl - 1

export function getLayoutTier(width: number): LayoutTier {
  if (width >= LAYOUT_BREAKPOINTS.xl) return 'desktop'
  if (width >= LAYOUT_BREAKPOINTS.lg) return 'tablet'
  return 'mobile'
}

export function isSidebarSheetViewport(width: number) {
  return width < LAYOUT_BREAKPOINTS.xl
}
