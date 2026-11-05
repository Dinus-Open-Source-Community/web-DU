import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSimulateEmpty } from '@/lib/simulation'

export function SimulationToggle() {
  const [isEmpty, setIsEmpty] = useSimulateEmpty()

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border-2 border-ink-900 bg-paper-white p-2 shadow-button">
      <span className="flex items-center gap-2 pl-2 font-mono text-xs font-bold text-ink-900">
        <span
          className={cn(
            'size-2.5 rounded-full',
            isEmpty ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500',
          )}
        />
        <span className="hidden sm:inline">Simulasi Data Kosong:</span>
        <strong className={isEmpty ? 'text-amber-700' : 'text-emerald-700'}>
          {isEmpty ? 'AKTIF' : 'NONAKTIF'}
        </strong>
      </span>
      <button
        type="button"
        onClick={() => setIsEmpty(!isEmpty)}
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-900 bg-note-yellow px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-900 shadow-2xs transition-all hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px]"
      >
        {isEmpty ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
        <span>{isEmpty ? 'Lihat Data Asli' : 'Simulasi Kosong'}</span>
      </button>
    </div>
  )
}
