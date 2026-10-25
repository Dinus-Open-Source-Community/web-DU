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
import { appToolbarPrimaryButtonClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

type UserPromoteDialogProps = {
  triggerLabel: string
  triggerIcon: LucideIcon
  triggerClassName?: string
  title: string
  description: string
  confirmLabel: string
  searchPlaceholder: string
  emptyTitle: string
  emptyDescription: string
  footerHint: (name: string) => string
  candidates: PromoteCandidate[]
  candidateCount?: number
  candidatesLoading?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSearchChange?: (value: string) => void
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  onConfirm: (uids: string[]) => Promise<void>
}

function formatSelectedSummary(candidates: PromoteCandidate[]): string {
  if (candidates.length === 0) return ''
  if (candidates.length === 1) return candidates[0].name
  if (candidates.length === 2) return `${candidates[0].name} dan ${candidates[1].name}`
  return `${candidates[0].name}, ${candidates[1].name}, dan ${candidates.length - 2} pengguna lainnya`
}

export function UserPromoteDialog({
  triggerLabel,
  triggerIcon: TriggerIcon,
  triggerClassName,
  title,
  description,
  confirmLabel,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  footerHint,
  candidates,
  candidateCount,
  candidatesLoading = false,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  onSearchChange,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onConfirm,
}: UserPromoteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedUids, setSelectedUids] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const open = openProp ?? internalOpen

  const setOpen = (nextOpen: boolean) => {
    if (openProp === undefined) setInternalOpen(nextOpen)
    onOpenChangeProp?.(nextOpen)
  }

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
    setSelectedUids([])
  }, [open])

  useEffect(() => {
    if (!open) return
    const validSet = new Set(candidates.map((c) => c.uid))
    setSelectedUids((prev) => {
      const next = prev.filter((uid) => validSet.has(uid))
      return next.length === prev.length ? prev : next
    })
  }, [candidates, open])

  const selectedSet = useMemo(() => new Set(selectedUids), [selectedUids])

  const selectedCandidates = useMemo(
    () => candidates.filter((candidate) => selectedSet.has(candidate.uid)),
    [candidates, selectedSet],
  )

  const allVisibleSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((candidate) => selectedSet.has(candidate.uid))

  const toggleCandidate = (uid: string) => {
    setSelectedUids((prev) =>
      prev.includes(uid) ? prev.filter((item) => item !== uid) : [...prev, uid],
    )
  }

  const toggleSelectAllVisible = () => {
    if (filteredCandidates.length === 0) return
    const visibleUids = filteredCandidates.map((c) => c.uid)
    if (allVisibleSelected) {
      const visibleSet = new Set(visibleUids)
      setSelectedUids((prev) => prev.filter((uid) => !visibleSet.has(uid)))
    } else {
      setSelectedUids((prev) => {
        const merged = new Set([...prev, ...visibleUids])
        return Array.from(merged)
      })
    }
  }

  const handleConfirm = async () => {
    if (selectedUids.length === 0) return
    setIsSubmitting(true)
    try {
      await onConfirm(selectedUids)
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className={cn(appToolbarPrimaryButtonClassName, 'shrink-0 self-start', triggerClassName)}
        >
          <TriggerIcon className="mr-2 size-4" aria-hidden />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden rounded-2xl border-2 border-ink-900/10 bg-paper-white p-0 text-ink-900 shadow-paper ring-0 sm:max-w-2xl"
        onWheel={(event) => event.stopPropagation()}
      >
        <DialogHeader className="shrink-0 border-b border-line-light bg-paper-white px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-ink-900/10 bg-brand-soft text-brand-ink">
              <TriggerIcon className="size-4" aria-hidden />
            </span>
            <DialogTitle className="text-lg font-bold tracking-tight text-ink-900">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs font-medium leading-relaxed text-ink-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-hidden bg-paper-white px-6 py-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => {
                const value = event.target.value
                setQuery(value)
                onSearchChange?.(value)
              }}
              placeholder={searchPlaceholder}
              className="h-10 rounded-xl border-2 border-ink-900/10 bg-paper-paper pl-10 text-sm text-ink-900 placeholder:text-ink-400 shadow-none focus-visible:border-brand-blue focus-visible:bg-paper-white focus-visible:ring-brand-blue/25"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line-light bg-paper-paper px-4 py-2.5 text-xs font-medium text-ink-600">
            <div className="flex items-center gap-2">
              <span>
                {candidateCount ?? filteredCandidates.length} kandidat cocok
              </span>
              <span className="text-ink-400" aria-hidden>
                •
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-sm border border-ink-900/10 px-2.5 py-0.5 text-xs font-semibold shadow-none transition-colors',
                  selectedUids.length > 0
                    ? 'bg-primary text-white'
                    : 'bg-paper-white text-ink-500',
                )}
              >
                {selectedUids.length} dipilih
              </span>
            </div>
            <div className="flex items-center gap-3">
              {selectedUids.length > 0 && !allVisibleSelected ? (
                <button
                  type="button"
                  onClick={() => setSelectedUids([])}
                  className="font-semibold text-ink-500 transition-colors hover:text-ink-900"
                >
                  Reset pilihan
                </button>
              ) : null}
              {filteredCandidates.length > 0 ? (
                <button
                  type="button"
                  onClick={toggleSelectAllVisible}
                  className="font-semibold text-brand-ink transition-colors hover:text-brand-hover hover:underline"
                >
                  {allVisibleSelected ? 'Batal pilih semua' : 'Pilih semua'}
                </button>
              ) : (
                <span className="text-ink-400">Pilih satu atau beberapa user</span>
              )}
            </div>
          </div>

          <DialogScrollArea
            className="h-[min(48vh,350px)] rounded-xl border-2 border-ink-900/10 bg-paper-offwhite p-2"
            role="listbox"
            aria-multiselectable="true"
            aria-label="Daftar kandidat"
            onScroll={(event) => {
              const element = event.currentTarget
              const reachedBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 72
              if (reachedBottom && hasMore && !isLoadingMore && onLoadMore) onLoadMore()
            }}
          >
            <div className="space-y-2 p-1">
              {candidatesLoading ? (
                <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-line-medium bg-paper-white px-6 text-center">
                  <p className="text-sm font-medium text-ink-500">Memuat kandidat siswa...</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-medium bg-paper-white px-6 text-center">
                  <p className="text-sm font-bold text-ink-800">{emptyTitle}</p>
                  <p className="max-w-sm text-xs font-medium leading-relaxed text-ink-500">
                    {emptyDescription}
                  </p>
                </div>
              ) : (
                filteredCandidates.map((candidate) => {
                  const selected = selectedSet.has(candidate.uid)
                  return (
                    <button
                      key={candidate.uid}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => toggleCandidate(candidate.uid)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                        selected
                          ? 'border-brand-blue bg-brand-soft/35'
                          : 'border-ink-900/10 bg-paper-white hover:border-ink-900/20 hover:bg-paper-paper',
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
                      <div className="flex shrink-0 items-center gap-2.5">
                        <AdminMetaLabel>{candidate.sourceRoleLabel}</AdminMetaLabel>
                        <span
                          className={cn(
                            'flex size-6 items-center justify-center rounded-sm border-2 shadow-none transition-all',
                            selected
                              ? 'border-ink-900/10 bg-primary text-white'
                              : 'border-line-medium bg-paper-white text-transparent',
                          )}
                        >
                          <Check className={cn('size-3.5 stroke-[2.5]', selected ? 'opacity-100' : 'opacity-0')} />
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-ink-500" aria-live="polite">
                  <span className="size-3 animate-spin rounded-full border-2 border-line-medium border-t-brand-blue" aria-hidden />
                  Memuat kandidat berikutnya...
                </div>
              ) : null}
            </div>
          </DialogScrollArea>

          {selectedCandidates.length > 0 ? (
            <div className="rounded-xl border-2 border-ink-900/10 border-l-4 border-l-brand-blue bg-note-sky/35 px-4 py-3 text-xs font-semibold leading-relaxed text-ink-800">
              {footerHint(formatSelectedSummary(selectedCandidates))}
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-line-light bg-paper-white px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-sm border-2 border-ink-900/10 bg-paper-white px-5 font-semibold text-ink-700 shadow-none hover:bg-paper-paper hover:text-ink-900"
            disabled={isSubmitting}
            onClick={() => setOpen(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="h-11 shrink-0 gap-2 rounded-sm border-2 border-ink-900/10 bg-primary px-5 font-semibold text-white shadow-none hover:bg-brand-hover"
            onClick={() => void handleConfirm()}
            disabled={selectedUids.length === 0 || isSubmitting}
          >
            {isSubmitting
              ? 'Memproses...'
              : selectedUids.length > 0
                ? `${confirmLabel} (${selectedUids.length})`
                : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
