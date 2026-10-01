import { courseFormLayout } from '@/lib/course-form/layout'

export const courseMasterLayout = {
  fieldLabel: courseFormLayout.label,
  fieldHint: 'text-xs leading-5 text-muted-foreground',
  fieldStack: 'flex flex-col gap-2',
  input: courseFormLayout.input,
  textarea: courseFormLayout.textarea,
  activeRow:
    'flex items-center justify-between rounded-xl border border-ink-900/10 bg-paper-paper px-4 py-3',
} as const
