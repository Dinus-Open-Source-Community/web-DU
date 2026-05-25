import { useState } from 'react'
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

  return (
    <div className="relative">
      {!focused && !disabled && value !== '' && value > 0 && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rp</span>}
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
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary ${disabled ? 'bg-slate-50 text-slate-400' : ''}`}
      />
    </div>
  )
}
