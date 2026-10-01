import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ReactLenis, useLenis } from 'lenis/react'
import { useEffect, type ReactNode } from 'react'

import { registerAppLenis } from '@/lib/lenis-control'
import { shouldLenisPreventNode } from '@/lib/dialog-scroll'

gsap.registerPlugin(ScrollTrigger)

function ScrollBridge() {
  const lenis = useLenis(() => {
    ScrollTrigger.update()
  })

  useEffect(() => {
    registerAppLenis(lenis ?? null)
    return () => registerAppLenis(null)
  }, [lenis])

  useEffect(() => {
    void document.fonts.ready.then(() => {
      ScrollTrigger.refresh()
    })
  }, [])

  return null
}

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        // Biarkan scroll native di dalam kontainer scroll modal.
        prevent: (node) => shouldLenisPreventNode(node),
      }}
    >
      <ScrollBridge />
      {children}
    </ReactLenis>
  )
}
