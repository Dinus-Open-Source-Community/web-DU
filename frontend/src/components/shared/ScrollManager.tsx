import { useLenis } from 'lenis/react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Cari elemen target dari hash tanpa memakainya sebagai selector CSS.
 * Fragment callback OAuth/SSO berbentuk `#expires_at=...&token=...`, dan
 * `document.querySelector(hash)` melempar SyntaxError untuk nilai seperti itu
 * sehingga seluruh aplikasi gagal render (halaman blank). `getElementById`
 * aman untuk hash apa pun.
 */
function resolveHashTarget(hash: string): HTMLElement | null {
  if (!hash.startsWith('#')) return null

  const rawId = hash.slice(1)
  if (!rawId) return null

  try {
    return (
      document.getElementById(decodeURIComponent(rawId)) ??
      document.getElementById(rawId)
    )
  } catch {
    return document.getElementById(rawId)
  }
}

export default function ScrollManager() {
  const { pathname, hash } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    if (hash) {
      const target = resolveHashTarget(hash)
      if (target) {
        if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -88 })
        else target.scrollIntoView()
        return
      }
    }
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, hash, lenis])

  return null
}
