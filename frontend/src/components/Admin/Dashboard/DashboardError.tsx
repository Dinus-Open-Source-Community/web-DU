interface DashboardErrorProps {
  message: string
  onRetry?: () => void
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-destructive/25 bg-paper-white px-6 py-10 text-center"
      role="alert"
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-destructive">Gagal memuat data</p>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-600">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-md border-2 border-ink-900/10 bg-paper-paper px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-none transition-colors hover:bg-paper-white"
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  )
}
