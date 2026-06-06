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

type UnsavedLessonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonTitle: string
  targetLabel: string
  isSaving?: boolean
  onSaveAndContinue: () => void
}

export function UnsavedLessonDialog({
  open,
  onOpenChange,
  lessonTitle,
  targetLabel,
  isSaving = false,
  onSaveAndContinue,
}: UnsavedLessonDialogProps) {
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
                  <span className="font-medium text-slate-800">{lessonTitle}</span> belum
                  disimpan. Anda perlu menyimpan sebelum {targetLabel}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-2 px-6 py-5 text-sm text-slate-600">
          <p>Hanya lesson yang sedang diedit yang akan disinkronkan ke backend.</p>
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
            {isSaving ? 'Menyimpan...' : 'Simpan & lanjut'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
