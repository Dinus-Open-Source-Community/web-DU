import { useEffect, useMemo, useState } from 'react'
import { Check, Search, type LucideIcon } from 'lucide-react'

import { UserIdentityCell } from '@/components/admin/user-manage/UserIdentityCell'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
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
        <Button type="button" className="h-10 shrink-0 rounded-xl px-4">
          <TriggerIcon className="mr-2 size-4" aria-hidden />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 rounded-xl border-slate-200 bg-white pl-10"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-500">
            <span>{filteredCandidates.length} kandidat cocok</span>
            <span>Pilih satu user untuk melanjutkan</span>
          </div>

          <ScrollArea className="h-[360px] rounded-2xl border border-slate-200/80 bg-slate-50/40 p-2">
            <div className="space-y-2 p-1">
              {filteredCandidates.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-6 text-center">
                  <p className="text-sm font-semibold text-slate-700">{emptyTitle}</p>
                  <p className="max-w-sm text-sm leading-relaxed text-slate-500">
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
                      onClick={() => setSelectedUid(candidate.uid)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                        selected
                          ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.12)]'
                          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80',
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
                        <Badge variant="userRole">{candidate.sourceRoleLabel}</Badge>
                        <span
                          className={cn(
                            'flex size-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400',
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
          </ScrollArea>

          {selectedCandidate ? (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
              {footerHint(selectedCandidate.name)}
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t border-slate-100 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => setOpen(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="h-10 rounded-xl"
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
