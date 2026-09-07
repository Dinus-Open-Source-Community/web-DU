import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import PenguinMascot from '@/components/playful/PenguinMascot'

/**
 * SplashScreen — preloader 1× per sesi. Muncul saat load (overlay paper),
 * kata "DOSCOM" + pinguin + bar tinta yang terisi. Dismiss otomatis ≤1200ms,
 * atau saat window 'load' / dokumen siap (mana duluan), atau klik untuk skip.
 * Absen total saat prefers-reduced-motion; dilewati jika sesi sudah pernah
 * melihat (sessionStorage 'du-splash-seen'). Body di-scroll-lock selama tampil.
 */

const SPLASH_MAX_MS = 1200
const STORAGE_KEY = 'du-splash-seen'

/** Baca flag sesi — aman walau sessionStorage diblokir. */
function hasSeenSplash(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export default function SplashScreen() {
  const reduceMotion = useReducedMotion()
  // Inisialisasi sinkron: tampil sejak render pertama (hindari flash konten),
  // kecuali reduce-motion atau sesi sudah pernah lihat.
  const [show, setShow] = useState<boolean>(() => !reduceMotion && !hasSeenSplash())

  // Dismiss + scroll lock + simpan flag.
  useEffect(() => {
    if (!show) return

    const dismiss = (): void => {
      setShow(false)
      try {
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* sessionStorage tak tersedia — splash bisa muncul lagi, tidak fatal */
      }
    }

    // Dokumen sudah siap (SPA: 'load' bisa terlewat) atau event load menyusul.
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

  // Scroll lock terpisah — hanya selama show.
  useEffect(() => {
    if (!show) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [show])

  if (reduceMotion) return null

  // Skip manual: tutup + tandai sesi sudah lihat (1× per sesi tetap berlaku).
  const skip = (): void => {
    setShow(false)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* abaikan */
    }
  }

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="splash"
          role="status"
          aria-label="Memuat DOSCOM"
          onClick={skip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed inset-0 z-[80] flex cursor-pointer flex-col items-center justify-center bg-paper-white"
        >
          {/* Pinguin bob santai */}
          <PenguinMascot className="w-28 md:w-36" />

          {/* Wordmark */}
          <p className="font-display mt-6 text-5xl font-bold tracking-tight text-ink-900 md:text-6xl">
            DOSCOM
          </p>

          {/* Bar tinta yang terisi */}
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
      ) : null}
    </AnimatePresence>
  )
}
