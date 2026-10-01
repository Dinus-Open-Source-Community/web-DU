import { useEffect } from 'react'
import type { TouchEvent, WheelEvent } from 'react'

import { getAppScrollY, hasAppLenis, restoreAppScrollY, startAppLenis, stopAppLenis } from '@/lib/lenis-control'

const DOM_DELTA_LINE = 1
const DOM_DELTA_PAGE = 2

function wheelDeltaPixels(event: WheelEvent<HTMLDivElement>) {
  const node = event.currentTarget
  if (event.deltaMode === DOM_DELTA_LINE) {
    return event.deltaY * 16
  }
  if (event.deltaMode === DOM_DELTA_PAGE) {
    return event.deltaY * node.clientHeight
  }
  return event.deltaY
}

function isScrollableElement(element: HTMLElement) {
  const style = getComputedStyle(element)
  const overflowY = style.overflowY
  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') {
    return false
  }
  return element.scrollHeight > element.clientHeight + 1
}

/** Kontainer scroll di dalam modal (DialogScrollArea atau overflow-y auto/scroll). */
export function findDialogScrollContainer(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null

  const explicit = target.closest('[data-slot="dialog-scroll-area"]')
  if (explicit instanceof HTMLElement) return explicit

  const dialog = target.closest('[data-slot="dialog-content"]')
  if (!dialog) return null

  let node: Element | null = target
  while (node && node !== dialog) {
    if (node instanceof HTMLElement && isScrollableElement(node)) {
      return node
    }
    node = node.parentElement
  }

  return null
}

export function shouldAllowDialogWheelTarget(target: EventTarget | null) {
  return Boolean(findDialogScrollContainer(target))
}

/** Lenis: biarkan scroll native pada area scroll di dalam dialog. */
export function shouldLenisPreventNode(node: EventTarget | null) {
  return shouldAllowDialogWheelTarget(node)
}

/** Wheel di dalam modal — scroll kontainer sendiri, cegah chaining ke halaman. */
export function handleDialogWheelScroll(event: WheelEvent<HTMLDivElement>) {
  event.stopPropagation()
  event.preventDefault()

  const node = event.currentTarget
  const maxScroll = node.scrollHeight - node.clientHeight
  if (maxScroll <= 0) return

  const delta = wheelDeltaPixels(event)
  const nextScroll = node.scrollTop + delta
  node.scrollTop = Math.max(0, Math.min(maxScroll, nextScroll))
}

/** Touch scroll di dalam modal — hindari gesture tertangkap overlay. */
export function handleDialogTouchScrollBubble(event: TouchEvent<HTMLDivElement>) {
  event.stopPropagation()
}

type ScrollLockSnapshot = {
  scrollY: number
  /** Tanpa body fixed saat Lenis aktif (hindari double offset scrollTop + top). */
  lenisScrollLock?: boolean
  htmlOverflow: string
  bodyOverflow: string
  bodyPosition: string
  bodyTop: string
  bodyLeft: string
  bodyRight: string
  bodyWidth: string
  htmlOverscroll: string
}

/**
 * Kunci scroll halaman saat dialog terbuka.
 *
 * App memakai Lenis — CSS overflow/position saja tidak cukup.
 * Wheel/touch hanya diizinkan pada kontainer scroll di dalam dialog.
 */
export function lockPageScrollForDialog() {
  const html = document.documentElement
  const body = document.body
  const count = Number(html.dataset.dialogScrollLockCount ?? '0')

  html.dataset.dialogScrollLockCount = String(count + 1)

  if (count === 0) {
    const scrollY = getAppScrollY()
    const lenisScrollLock = hasAppLenis()
    const snapshot: ScrollLockSnapshot = {
      scrollY,
      lenisScrollLock,
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      htmlOverscroll: html.style.overscrollBehavior,
    }
    html.dataset.dialogScrollLockSnapshot = JSON.stringify(snapshot)

    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    body.style.overflow = 'hidden'

    if (!lenisScrollLock) {
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.width = '100%'
    }
  }

  stopAppLenis()

  const onWheel = (event: globalThis.WheelEvent) => {
    if (shouldAllowDialogWheelTarget(event.target)) return
    event.preventDefault()
    event.stopPropagation()
  }

  const onTouchMove = (event: globalThis.TouchEvent) => {
    if (shouldAllowDialogWheelTarget(event.target)) return
    event.preventDefault()
    event.stopPropagation()
  }

  document.addEventListener('wheel', onWheel, { passive: false, capture: true })
  document.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })

  return () => {
    document.removeEventListener('wheel', onWheel, { capture: true })
    document.removeEventListener('touchmove', onTouchMove, { capture: true })

    const next = Number(html.dataset.dialogScrollLockCount ?? '1') - 1
    if (next > 0) {
      html.dataset.dialogScrollLockCount = String(next)
      startAppLenis()
      return
    }

    let snapshot: ScrollLockSnapshot | null = null
    try {
      snapshot = JSON.parse(
        html.dataset.dialogScrollLockSnapshot ?? 'null',
      ) as ScrollLockSnapshot | null
    } catch {
      snapshot = null
    }

    html.style.overflow = snapshot?.htmlOverflow ?? ''
    html.style.overscrollBehavior = snapshot?.htmlOverscroll ?? ''
    body.style.overflow = snapshot?.bodyOverflow ?? ''

    if (!snapshot?.lenisScrollLock) {
      body.style.position = snapshot?.bodyPosition ?? ''
      body.style.top = snapshot?.bodyTop ?? ''
      body.style.left = snapshot?.bodyLeft ?? ''
      body.style.right = snapshot?.bodyRight ?? ''
      body.style.width = snapshot?.bodyWidth ?? ''
    }

    const restoreY = snapshot?.scrollY ?? 0
    delete html.dataset.dialogScrollLockCount
    delete html.dataset.dialogScrollLockSnapshot

    restoreAppScrollY(restoreY)
    startAppLenis()
  }
}

/** Pasang kunci scroll halaman selama komponen dialog ter-mount. */
export function useDialogPageScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    return lockPageScrollForDialog()
  }, [enabled])
}
