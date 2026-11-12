import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * Landing motion gate — entrance/scroll animations play only on the first
 * landing mount after a full page load. Module scope survives client-side
 * navigation and resets on refresh.
 */
let landingMotionPlayed = false

const LandingMotionContext = createContext(true)

export function LandingMotionProvider({ children }: { children: ReactNode }) {
  const [enabled] = useState(() => !landingMotionPlayed)

  useEffect(() => {
    landingMotionPlayed = true
  }, [])

  return <LandingMotionContext.Provider value={enabled}>{children}</LandingMotionContext.Provider>
}

/** True on the first landing mount per page load; false on later SPA visits. */
export function useLandingMotion(): boolean {
  return useContext(LandingMotionContext)
}
