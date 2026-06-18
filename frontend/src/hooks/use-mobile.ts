import * as React from 'react'

import {
  getLayoutTier,
  isSidebarSheetViewport,
  LAYOUT_BREAKPOINTS,
  SIDEBAR_SHEET_MAX_WIDTH,
  type LayoutTier,
} from '@/lib/layout/breakpoints'

function readViewportWidth() {
  return typeof window !== 'undefined' ? window.innerWidth : LAYOUT_FALLBACK_WIDTH
}

const LAYOUT_FALLBACK_WIDTH = LAYOUT_BREAKPOINTS.lg

/** Sheet sidebar below lg; fixed sidebar at lg+. */
export function useLayoutTier(): LayoutTier {
  const [tier, setTier] = React.useState<LayoutTier>(() =>
    getLayoutTier(readViewportWidth()),
  )

  React.useEffect(() => {
    const lgQuery = window.matchMedia(`(min-width: ${LAYOUT_BREAKPOINTS.lg}px)`)
    const mdQuery = window.matchMedia(`(min-width: ${LAYOUT_BREAKPOINTS.md}px)`)

    const update = () => {
      setTier(getLayoutTier(window.innerWidth))
    }

    lgQuery.addEventListener('change', update)
    mdQuery.addEventListener('change', update)
    update()

    return () => {
      lgQuery.removeEventListener('change', update)
      mdQuery.removeEventListener('change', update)
    }
  }, [])

  return tier
}

/** Sheet sidebar below lg; fixed sidebar at lg+. */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() =>
    isSidebarSheetViewport(readViewportWidth()),
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SIDEBAR_SHEET_MAX_WIDTH}px)`)
    const onChange = () => {
      setIsMobile(isSidebarSheetViewport(window.innerWidth))
    }

    mql.addEventListener('change', onChange)
    onChange()

    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
