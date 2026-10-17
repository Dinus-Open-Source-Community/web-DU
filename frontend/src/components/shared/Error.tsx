import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '../ui/button'

const ErrorPageIllustration = lazy(() =>
  import('@/components/playful/ErrorPageIllustration').then((module) => ({
    default: module.ErrorPageIllustration,
  })),
)

interface NotFoundContentProps {
  title?: string
  description?: string
  backHref?: string
  backLabel?: string
  showBackButton?: boolean
  illustrationVariant?: 'not-found' | 'error'
  actions?: ReactNode
}

export function NotFoundContent({
  title = 'Halaman tidak ditemukan',
  description = 'Alamat yang Anda buka tidak ada atau sudah dipindahkan. Coba mulai dari beranda atau jelajahi kursus.',
  showBackButton = true,
  illustrationVariant = 'not-found',
  actions,
}: NotFoundContentProps) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 px-4 py-10 text-center duration-500 animate-in fade-in">
      <Suspense
        fallback={
          <div
            className="w-full max-w-[20rem] animate-pulse rounded-2xl bg-muted/30 sm:max-w-[22rem] sm:min-h-[280px]"
            aria-hidden
          />
        }
      >
        <ErrorPageIllustration variant={illustrationVariant} />
      </Suspense>

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-2 text-center">
        {illustrationVariant === 'not-found' ? (
          <p className="text-sm font-semibold text-muted-foreground">404</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
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
  const navigate = useNavigate()

  return (
    <NotFoundContent
      title="Terjadi kesalahan"
      description="Aplikasi mengalami gangguan sementara. Coba lagi atau kembali ke halaman sebelumnya."
      illustrationVariant="error"
      showBackButton={false}
      actions={
        <>
          <Button variant="outline" onClick={onRetry} className="rounded-sm shadow-none">
            Coba lagi
          </Button>
          <Button onClick={() => navigate(-1)} className="gap-2 rounded-sm">
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
        </>
      }
    />
  )
}

/** Clears the error fallback when the route changes (without remounting the whole app). */
export function RouterErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation()
  return <ErrorBoundary resetKey={location.key}>{children}</ErrorBoundary>
}

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
  resetKey?: string
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

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.props.resetKey !== undefined &&
      prevProps.resetKey !== this.props.resetKey &&
      this.state.hasError
    ) {
      this.setState({ hasError: false })
    }
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
