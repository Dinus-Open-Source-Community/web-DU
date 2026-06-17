import type { LessonAssignmentStatus } from '@/lib/types/lesson'

export type HomeworkPanelSection = 'instruction' | 'rules'

export const HOMEWORK_PANEL_SECTIONS: {
  value: HomeworkPanelSection
  label: string
  description: string
}[] = [
  {
    value: 'instruction',
    label: 'Instruksi',
    description: 'Judul, tipe, dan konten tugas',
  },
  {
    value: 'rules',
    label: 'Aturan',
    description: 'Status, tenggat, dan pengumpulan',
  },
]

export const ASSIGNMENT_STATUS_META: Record<
  LessonAssignmentStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  TERBIT: { label: 'Terbit', className: 'bg-emerald-50 text-emerald-700' },
  DITUTUP: { label: 'Ditutup', className: 'bg-amber-50 text-amber-800' },
}
