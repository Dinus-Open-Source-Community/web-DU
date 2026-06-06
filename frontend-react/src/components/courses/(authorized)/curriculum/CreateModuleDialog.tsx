import { useEffect, useState } from 'react'
import { FolderPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type CreateModuleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateModule: (title: string) => void | Promise<void>
  nextOrder: number
  isSubmitting?: boolean
}

export function CreateModuleDialog({
  open,
  onOpenChange,
  onCreateModule,
  nextOrder,
  isSubmitting = false,
}: CreateModuleDialogProps) {
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!open) {
      setTitle('')
    }
  }, [open])

  const handleSubmit = async () => {
    try {
      await onCreateModule(title.trim() || `Modul ${nextOrder}`)
      onOpenChange(false)
    } catch {
      // Dialog stays open so the user can retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderPlus className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900">
                Modul baru
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Modul {nextOrder} akan ditambahkan ke kurikulum kursus ini.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="module-title" className="text-slate-700">
            Nama modul
          </Label>
          <Input
            id="module-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={`Contoh: Modul ${nextOrder} - Pengenalan`}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSubmit()
              }
            }}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Membuat...' : 'Buat modul'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
