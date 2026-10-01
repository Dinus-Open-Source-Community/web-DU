import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

/**
 * Splash 1× per sesi pada landing. Saat aktif, SplashSessionProvider hanya
 * merender overlay — navbar/konten tidak dimount. Dismiss ≤1200ms, klik, atau load.
 */

const SPLASH_MAX_MS = 1200
const STORAGE_KEY = 'du-splash-seen'

function hasSeenSplash(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function useSplashSessionState() {
  const reduceMotion = useReducedMotion()
  const [show, setShow] = useState<boolean>(() => {
    if (prefersReducedMotion() || hasSeenSplash()) return false
    return true
  })

  useEffect(() => {
    if (reduceMotion) {
      setShow(false)
    }
  }, [reduceMotion])

  useEffect(() => {
    if (!show) return

    const dismiss = (): void => {
      setShow(false)
      try {
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* abaikan */
      }
    }

    if (document.readyState === 'complete') {
      const t = window.setTimeout(dismiss, SPLASH_MAX_MS)
      return () => window.clearTimeout(t)
    }

    window.addEventListener('load', dismiss, { once: true })
    const t = window.setTimeout(dismiss, SPLASH_MAX_MS)

    return () => {
      window.removeEventListener('load', dismiss)
      window.clearTimeout(t)
    }
  }, [show])

  useEffect(() => {
    if (!show) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [show])

  const skip = (): void => {
    setShow(false)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* abaikan */
    }
  }

  return { show, skip }
}

function SplashOverlay({ onSkip }: { onSkip: () => void }) {
  return (
    <motion.div
      role="status"
      aria-label="Memuat DOSCOM"
      onClick={onSkip}
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center bg-paper-white"
    >
      <p className="font-display text-5xl font-bold tracking-tight text-ink-900 md:text-6xl">
        DOSCOM
      </p>

      <div className="mt-6 h-2 w-44 overflow-hidden rounded-full border-2 border-ink-900 bg-paper-panel">
        <motion.div
          aria-hidden
          className="h-full bg-brand-blue"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </div>

      <p className="text-ink-500 mt-4 text-xs font-bold tracking-[0.2em] uppercase">
        menyiapkan kertas dan tinta…
      </p>
    </motion.div>
  )
}

/** Bungkus halaman landing: saat splash aktif, anak (layout + konten) tidak dirender. */
export function SplashSessionProvider({ children }: { children: ReactNode }) {
  const { show, skip } = useSplashSessionState()

  if (!show) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait">
      <SplashOverlay key="splash" onSkip={skip} />
    </AnimatePresence>
  )
}
