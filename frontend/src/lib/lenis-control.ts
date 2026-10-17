import type Lenis from 'lenis'

let lenisInstance: Lenis | null = null
let stopCount = 0

/** Dipanggil dari MotionProvider agar dialog bisa pause/resume Lenis. */
export function registerAppLenis(instance: Lenis | null) {
  lenisInstance = instance
  if (instance && stopCount > 0) {
    instance.stop()
  }
}

export function stopAppLenis() {
  stopCount += 1
  if (stopCount === 1) {
    lenisInstance?.stop()
  }
}

export function startAppLenis() {
  stopCount = Math.max(0, stopCount - 1)
  if (stopCount === 0) {
    lenisInstance?.start()
  }
}

/** App shell memakai ReactLenis root — body `position: fixed` bentrok dengan scrollTop html. */
export function hasAppLenis() {
  return lenisInstance != null
}

/** Posisi scroll aktual — Lenis root tidak selalu sama dengan window.scrollY. */
export function getAppScrollY() {
  const windowY =
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    0

  if (lenisInstance) {
    const lenisY =
      lenisInstance.scroll ??
      lenisInstance.actualScroll ??
      lenisInstance.animatedScroll ??
      0
    // Wheel/native scroll bisa lebih jauh dari animatedScroll Lenis; kunci harus match tampilan.
    return Math.max(windowY, lenisY)
  }

  return windowY
}

export function restoreAppScrollY(y: number) {
  if (lenisInstance) {
    lenisInstance.scrollTo(y, { immediate: true })
    return
  }
  window.scrollTo(0, y)
}
