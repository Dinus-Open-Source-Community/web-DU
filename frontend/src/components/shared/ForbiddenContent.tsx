import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ErrorPageIllustration } from '@/components/playful/ErrorPageIllustration'
import { dashboardPathForUserRole } from '@/lib/dashboard-route'
import type { UserRole } from '@/lib/types/user'

type ForbiddenContentProps = {
  userRole?: UserRole | null
}

export function ForbiddenContent({ userRole }: ForbiddenContentProps) {
  const navigate = useNavigate()
  const dashboardHref = userRole ? dashboardPathForUserRole(userRole) : '/'

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-4 py-10 text-center duration-500 animate-in fade-in">
      <ErrorPageIllustration variant="forbidden" />

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold text-muted-foreground">403</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Akses ditolak</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2 rounded-sm shadow-none"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
        {userRole ? (
          <Button variant="outline" className="rounded-sm shadow-none" asChild>
            <Link to={dashboardHref}>Ke dashboard saya</Link>
          </Button>
        ) : (
          <Button variant="outline" className="rounded-sm shadow-none" asChild>
            <Link to="/">Beranda</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
