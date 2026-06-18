import * as React from 'react'

import {
  getLayoutTier,
  isSidebarSheetViewport,
  type LayoutTier,
} from '@/lib/layout/breakpoints'

function readViewportWidth() {
  return typeof window !== 'undefined' ? window.innerWidth : LAYOUT_FALLBACK_WIDTH
}

const LAYOUT_FALLBACK_WIDTH = 1280

export function useLayoutTier(): LayoutTier {
  const [tier, setTier] = React.useState<LayoutTier>(() =>
    getLayoutTier(readViewportWidth()),
  )

  React.useEffect(() => {
    const xlQuery = window.matchMedia(`(min-width: ${1280}px)`)
    const lgQuery = window.matchMedia(`(min-width: ${1024}px)`)

    const update = () => {
      setTier(getLayoutTier(window.innerWidth))
    }

    xlQuery.addEventListener('change', update)
    lgQuery.addEventListener('change', update)
    update()

    return () => {
      xlQuery.removeEventListener('change', update)
      lgQuery.removeEventListener('change', update)
    }
  }, [])

  return tier
}

/** Sheet sidebar below xl; fixed sidebar at xl+. */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() =>
    isSidebarSheetViewport(readViewportWidth()),
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${1279}px)`)
    const onChange = () => {
      setIsMobile(isSidebarSheetViewport(window.innerWidth))
    }

    mql.addEventListener('change', onChange)
    onChange()

    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
