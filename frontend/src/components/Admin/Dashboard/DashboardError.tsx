import { AlertCircle, RefreshCw } from 'lucide-react'

interface DashboardErrorProps {
  message: string
  onRetry?: () => void
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <AlertCircle className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-rose-700">Gagal memuat data</h3>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-rose-600">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Coba lagi
        </button>
      )}
    </div>
  )
}
