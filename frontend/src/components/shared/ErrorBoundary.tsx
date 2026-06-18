import { Component, type ErrorInfo, type ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-slate-500">Terjadi kesalahan. Silakan muat ulang halaman.</p>
          <button
            className="text-xs text-blue-500 underline"
            onClick={() => this.setState({ hasError: false })}
          >
            Coba lagi
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
