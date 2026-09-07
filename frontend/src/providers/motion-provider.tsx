import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gsap } from 'gsap'
import { ReactLenis, useLenis } from 'lenis/react'
import { useEffect, type ReactNode } from 'react'

gsap.registerPlugin(ScrollTrigger)

function ScrollBridge() {
  useLenis(() => {
    ScrollTrigger.update()
  })
  useEffect(() => {
    void document.fonts.ready.then(() => {
      ScrollTrigger.refresh()
    })
  }, [])
  return null
}

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1 }}>
      <ScrollBridge />
      {children}
    </ReactLenis>
  )
}
