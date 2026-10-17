import { cn } from '@/lib/utils'

import { editLayout } from '@/lib/course-edit/edit-layout'
import {
  HOMEWORK_PANEL_SECTIONS,
  type HomeworkPanelSection,
} from '@/lib/course-edit/homework-panel.constants'

type HomeworkSectionNavProps = {
  activeSection: HomeworkPanelSection
  onSectionChange: (section: HomeworkPanelSection) => void
}

export function HomeworkSectionNav({
  activeSection,
  onSectionChange,
}: HomeworkSectionNavProps) {
  return (
    <nav aria-label="Bagian konfigurasi tugas" className={cn(editLayout.divider, 'mt-2')}>
      <div className="flex gap-1 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {HOMEWORK_PANEL_SECTIONS.map((section) => {
          const isActive = section.value === activeSection

          return (
            <button
              key={section.value}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSectionChange(section.value)}
              className={cn(
                'min-w-[7.5rem] shrink-0 rounded-t-lg px-3 py-2.5 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30',
                isActive
                  ? 'border-2 border-b-paper-white border-ink-900/10 bg-paper-white text-ink-900'
                  : 'text-ink-600 hover:bg-paper-paper hover:text-ink-900',
              )}
            >
              <span className="block text-sm font-medium">{section.label}</span>
              <span className={cn(editLayout.meta, 'mt-0.5 block normal-case tracking-normal')}>
                {section.description}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
