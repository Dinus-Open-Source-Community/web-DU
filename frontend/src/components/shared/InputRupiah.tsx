import { useState } from 'react'
import { cn } from '../../lib/utils'
import { FormatRupiah } from '../../lib/func/func'

export function RupiahInput({ id, value, onChange, disabled, placeholder }: { id: string; value: number | ''; onChange: (v: number | '') => void; disabled?: boolean; placeholder?: string }) {
  const [focused, setFocused] = useState(false)
  const [rawText, setRawText] = useState(() => (typeof value === 'number' && value > 0 ? value.toString() : ''))

  const displayValue = (() => {
    if (disabled) return ''
    if (focused) return rawText
    if (value === '' || value === 0) return ''
    return FormatRupiah(value, 'display')
  })()

  const showPrefix = !focused && !disabled && value !== '' && value > 0

  return (
    <div className="relative">
      {showPrefix && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => {
          const parsed = FormatRupiah(e.target.value, 'parse')
          setRawText(Number(parsed) > 0 ? parsed.toString() : '')
          onChange(Number(parsed) > 0 ? Number(parsed) : '')
        }}
        onFocus={() => {
          setFocused(true)
          setRawText(typeof value === 'number' && value > 0 ? value.toString() : '')
        }}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground shadow-none outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-line-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
          showPrefix && 'pl-10',
        )}
      />
    </div>
  )
}
