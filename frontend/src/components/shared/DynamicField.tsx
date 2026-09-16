import { Plus, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface DynamicFieldProps {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
  labelClass?: string
  inputClass?: string
  draft: string
  setDraft: (value: string) => void
}

export function DynamicListField({ label, items, onChange, placeholder, labelClass, inputClass, draft, setDraft }: DynamicFieldProps) {
  const add = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...items, v])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 rounded-xl border border-input bg-muted px-3 py-1.5 text-sm text-foreground">
              <span className="flex-1">{item}</span>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Hapus item" className="shrink-0 rounded-md p-0.5 text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/30">
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          className={inputClass}
        />
        <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-sm px-3 text-xs" onClick={add}>
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
