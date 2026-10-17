import type { ReactNode } from 'react'
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
import { editLayout } from '@/lib/course-edit/edit-layout'
import { cn } from '@/lib/utils'

type UnsavedChangesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  isSaving?: boolean
  onDiscardAndContinue: () => void
  onSaveAndContinue: () => void
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  title,
  description,
  isSaving = false,
  onDiscardAndContinue,
  onSaveAndContinue,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(editLayout.dialogShell, 'sm:max-w-lg')}
      >
        <div className={editLayout.dialogHeader}>
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-amber-200/80 bg-amber-50 text-amber-800"
                aria-hidden
              >
                <AlertTriangle className="size-5" />
              </span>
              <div className="min-w-0 space-y-1.5">
                <DialogTitle className="text-base font-semibold tracking-tight text-ink-900">
                  {title}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="text-sm leading-relaxed text-ink-600">{description}</div>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <DialogFooter className={cn(editLayout.dialogFooter, 'sm:flex-wrap')}>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-sm border-2 border-ink-900/10 sm:w-auto"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-sm border-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 sm:w-auto"
            disabled={isSaving}
            onClick={onDiscardAndContinue}
          >
            Buang & Lanjut
          </Button>
          <Button
            type="button"
            className="h-10 w-full rounded-sm sm:w-auto"
            disabled={isSaving}
            onClick={onSaveAndContinue}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan & Lanjut'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
