/** Shared motion tokens for course edit UI. */
export const editMotion = {
  panel: '',
  panelFromRight: '',
  panelFromLeft: '',
  panelFromBottom: '',
  outlineItem: '',
  rowSelect:
    'transition-colors duration-150 ease-out',
  tabTitle: '',
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
