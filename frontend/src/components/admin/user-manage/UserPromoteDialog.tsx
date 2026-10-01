import { useEffect, useMemo, useState } from 'react'
import { Check, Search, type LucideIcon } from 'lucide-react'

import { UserIdentityCell } from '@/components/admin/user-manage/UserIdentityCell'
import { AdminMetaLabel } from '@/lib/admin/status-label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DialogScrollArea } from '@/components/ui/dialog-scroll-area'
import { Input } from '@/components/ui/input'
import type { PromoteCandidate } from '@/lib/user-manage/view-models'
import { cn } from '@/lib/utils'

type UserPromoteDialogProps = {
  triggerLabel: string
  triggerIcon: LucideIcon
  title: string
  description: string
  confirmLabel: string
  searchPlaceholder: string
  emptyTitle: string
  emptyDescription: string
  footerHint: (name: string) => string
  candidates: PromoteCandidate[]
  onConfirm: (uid: string) => Promise<void>
}

export function UserPromoteDialog({
  triggerLabel,
  triggerIcon: TriggerIcon,
  title,
  description,
  confirmLabel,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  footerHint,
  candidates,
  onConfirm,
}: UserPromoteDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedUid, setSelectedUid] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredCandidates = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return candidates

    return candidates.filter((candidate) => {
      const haystack = [
        candidate.uid,
        candidate.name,
        candidate.email,
        candidate.detail,
        candidate.sourceRoleLabel,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalized)
    })
  }, [candidates, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelectedUid(candidates[0]?.uid ?? '')
  }, [candidates, open])

  useEffect(() => {
    if (filteredCandidates.length === 0) return
    if (filteredCandidates.some((item) => item.uid === selectedUid)) return
    setSelectedUid(filteredCandidates[0].uid)
  }, [filteredCandidates, selectedUid])

  const selectedCandidate =
    filteredCandidates.find((candidate) => candidate.uid === selectedUid) ?? null

  const handleConfirm = async () => {
    if (!selectedCandidate) return
    setIsSubmitting(true)
    try {
      await onConfirm(selectedCandidate.uid)
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="h-10 shrink-0 rounded-sm px-4">
          <TriggerIcon className="mr-2 size-4" aria-hidden />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        onWheel={(event) => event.stopPropagation()}
      >
        <DialogHeader className="shrink-0 border-b border-line-light px-6 py-5">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 rounded-xl border-line-light bg-paper-white pl-10"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-900/10 bg-paper-paper/70 px-4 py-2.5 text-xs text-ink-500">
            <span>{filteredCandidates.length} kandidat cocok</span>
            <span>Pilih satu user untuk melanjutkan</span>
          </div>

          <DialogScrollArea
            className="h-[min(50vh,360px)] rounded-2xl border border-ink-900/10 bg-paper-paper/40 p-2"
            role="listbox"
            aria-label="Daftar kandidat"
          >
            <div className="space-y-2 p-1">
              {filteredCandidates.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-6 text-center">
                  <p className="text-sm font-semibold text-ink-700">{emptyTitle}</p>
                  <p className="max-w-sm text-sm leading-relaxed text-ink-500">
                    {emptyDescription}
                  </p>
                </div>
              ) : (
                filteredCandidates.map((candidate) => {
                  const selected = candidate.uid === selectedUid
                  return (
                    <button
                      key={candidate.uid}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => setSelectedUid(candidate.uid)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                        selected
                          ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.12)]'
                          : 'border-ink-900/10 bg-paper-white hover:border-line-medium hover:bg-paper-paper/80',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <UserIdentityCell
                          name={candidate.name}
                          email={candidate.email}
                          avatar={candidate.avatar}
                          meta={candidate.detail}
                        />
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <AdminMetaLabel>{candidate.sourceRoleLabel}</AdminMetaLabel>
                        <span
                          className={cn(
                            'flex size-7 items-center justify-center rounded-full border border-line-light bg-paper-white text-ink-400',
                            selected && 'border-primary text-primary',
                          )}
                        >
                          <Check className={cn('size-4', selected ? 'opacity-100' : 'opacity-0')} />
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </DialogScrollArea>

          {selectedCandidate ? (
            <div className="rounded-xl border border-ink-900/10 bg-paper-paper/70 px-4 py-3 text-sm text-ink-600">
              {footerHint(selectedCandidate.name)}
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-line-light px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-sm"
            onClick={() => setOpen(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="h-10 rounded-sm"
            onClick={() => void handleConfirm()}
            disabled={!selectedCandidate || isSubmitting}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
