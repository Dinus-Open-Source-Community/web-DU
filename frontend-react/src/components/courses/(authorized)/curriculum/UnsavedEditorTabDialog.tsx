import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CourseEditorTab } from '@/lib/course-edit/types'

type UnsavedEditorTabDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTab: CourseEditorTab
  targetTab: CourseEditorTab | null
  isSaving?: boolean
  onSaveAndContinue: () => void
}

const TAB_LABELS: Record<CourseEditorTab, string> = {
  content: 'Konten',
  homework: 'Tugas',
}

export function UnsavedEditorTabDialog({
  open,
  onOpenChange,
  currentTab,
  targetTab,
  isSaving = false,
  onSaveAndContinue,
}: UnsavedEditorTabDialogProps) {
  const saveLabel = currentTab === 'content' ? 'Simpan lesson' : 'Simpan tugas'
  const sectionLabel = currentTab === 'content' ? 'konten lesson' : 'tugas lesson'
  const targetLabel = targetTab ? TAB_LABELS[targetTab] : 'tab lain'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="border-b border-amber-100 bg-amber-50/80 px-6 py-5">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <DialogTitle className="text-base font-semibold text-slate-900">
                  Simpan perubahan dulu
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-slate-600">
                  Perubahan {sectionLabel} belum disimpan. Simpan dulu sebelum pindah ke tab{' '}
                  <span className="font-medium text-slate-800">{targetLabel}</span>.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <DialogFooter className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            disabled={isSaving}
            onClick={onSaveAndContinue}
          >
            {isSaving ? 'Menyimpan...' : saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
