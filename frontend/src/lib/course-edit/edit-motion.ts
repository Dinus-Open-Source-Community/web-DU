/** Shared motion tokens for course edit UI (tw-animate-css). */
export const editMotion = {
  panel:
    'animate-in fade-in duration-300 ease-out fill-mode-both',
  panelFromRight: 'slide-in-from-right-3',
  panelFromLeft: 'slide-in-from-left-3',
  panelFromBottom: 'slide-in-from-bottom-2',
  outlineItem: 'animate-in fade-in slide-in-from-left-2 duration-300 ease-out fill-mode-both',
  rowSelect:
    'transition-[background-color,border-color,color,transform] duration-200 ease-out',
  tabTitle: 'animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out fill-mode-both',
  reducedMotion: 'motion-reduce:animate-none motion-reduce:transition-none',
} as const

export type PanelSlideDirection = 'left' | 'right' | 'bottom' | 'none'

export function panelSlideClass(direction: PanelSlideDirection): string {
  switch (direction) {
    case 'left':
      return editMotion.panelFromLeft
    case 'right':
      return editMotion.panelFromRight
    case 'bottom':
      return editMotion.panelFromBottom
    default:
      return ''
  }
}

export function tabSlideDirection(
  current: 'content' | 'homework',
  previous: 'content' | 'homework',
): PanelSlideDirection {
  if (current === previous) return 'bottom'
  if (current === 'homework') return 'right'
  return 'left'
}
