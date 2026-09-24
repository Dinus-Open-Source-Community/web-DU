import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ArrowLeft, SearchX } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '../ui/button'

interface NotFoundContentProps {
  title?: string
  description?: string
  backHref?: string
  backLabel?: string
  showBackButton?: boolean
  actions?: ReactNode
}

export function NotFoundContent({
  title = 'Halaman tidak ditemukan',
  description = 'Alamat yang Anda buka tidak ada atau sudah dipindahkan. Coba mulai dari beranda atau jelajahi kursus.',
  showBackButton = true,
  actions,
}: NotFoundContentProps) {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 text-center duration-500 animate-in fade-in">
      <div className="flex size-32 items-center justify-center rounded-[28px] bg-slate-100 text-slate-400">
        <SearchX className="size-14" aria-hidden />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {showBackButton ? (
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2 rounded-sm shadow-none">
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
        ) : null}
        {actions}
      </div>
    </div>
  )
}

type ErrorFallbackContentProps = {
  onRetry: () => void
}

function ErrorFallbackContent({ onRetry }: ErrorFallbackContentProps) {
  return (
    <NotFoundContent
      title="Terjadi kesalahan"
      description="Aplikasi mengalami gangguan sementara. Coba lagi atau kembali ke beranda."
      showBackButton={false}
      actions={
        <>
          <Button variant="outline" onClick={onRetry} className="rounded-sm shadow-none">
            Coba lagi
          </Button>
          <Button asChild className="rounded-sm">
            <Link to="/">Ke beranda</Link>
          </Button>
        </>
      }
    />
  )
}

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorFallbackContent onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}
