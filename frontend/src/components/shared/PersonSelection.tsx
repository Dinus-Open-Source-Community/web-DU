import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Check, Search, type LucideIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import { cn } from '../../lib/utils'
import type { PersonSelectionItem } from '../../lib/types/utils'

type PersonSelectionDialogProps<T extends PersonSelectionItem> = {
  triggerLabel: string
  triggerIcon: LucideIcon
  title: string
  description: string
  confirmLabel: string
  searchPlaceholder: string
  items: T[]
  emptyTitle: string
  emptyDescription: string
  onConfirm: (item: T) => void | Promise<void>
  renderFooterHint?: (item: T) => ReactNode
}

export function PersonSelectionDialog<T extends PersonSelectionItem>({
  triggerLabel,
  triggerIcon: TriggerIcon,
  title,
  description,
  confirmLabel,
  searchPlaceholder,
  items,
  emptyTitle,
  emptyDescription,
  onConfirm,
  renderFooterHint,
}: PersonSelectionDialogProps<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredItems = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return items

    return items.filter((item) => {
      const haystack = [item.uid, item.name, item.email, item.detail ?? ''].join(' ').toLowerCase()
      return haystack.includes(normalized)
    })
  }, [items, query])

  useEffect(() => {
    if (!open) return

    setQuery('')
    setSelectedId(items[0]?.uid ?? '')
  }, [items, open])

  useEffect(() => {
    if (filteredItems.length === 0) return
    if (filteredItems.some((item) => item.uid === selectedId)) return
    setSelectedId(filteredItems[0].uid)
  }, [filteredItems, selectedId])

  const selectedItem = filteredItems.find((item) => item.uid === selectedId) ?? null

  const handleConfirm = async () => {
    if (!selectedItem) return
    setIsSubmitting(true)
    try {
      await onConfirm(selectedItem)
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 shrink-0 rounded-sm px-4">
          <TriggerIcon className="mr-1.5 h-4 w-4" aria-hidden />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} className="h-11 rounded-xl pl-10" />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-input bg-muted px-4 py-3 text-xs text-muted-foreground">
            <span>{filteredItems.length} hasil cocok</span>
            <span>Pilih satu item lalu lanjutkan</span>
          </div>

          <ScrollArea className="h-[420px] rounded-2xl border border-input bg-muted/50 p-2">
            <div className="flex flex-col gap-2 p-1">
              {filteredItems.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 px-6 text-center">
                  <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{emptyDescription}</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const selected = item.uid === selectedId
                  return (
                    <button
                      key={item.uid}
                      type="button"
                      onClick={() => setSelectedId(item.uid)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors',
                        selected ? 'border-primary bg-primary/5 ring-1 ring-ring/30' : 'border-input bg-card hover:border-line-medium hover:bg-muted',
                      )}>
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
                        <img src={item.avatar} alt={item.name} className="object-cover" sizes="44px" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{item.email}</p>
                          </div>
                          {item.meta ? <div className="shrink-0">{item.meta}</div> : null}
                        </div>

                        {item.detail ? <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.detail}</p> : null}
                      </div>

                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-input bg-card text-muted-foreground">
                        <Check className={cn('h-4 w-4 transition-opacity', selected ? 'opacity-100' : 'opacity-0')} aria-hidden />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>

          {selectedItem && renderFooterHint ? <div className="rounded-2xl border border-input bg-muted px-4 py-3 text-sm text-muted-foreground">{renderFooterHint(selectedItem)}</div> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="h-10 rounded-sm" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button type="button" className="h-10 rounded-sm" onClick={() => void handleConfirm()} disabled={!selectedItem || isSubmitting}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
