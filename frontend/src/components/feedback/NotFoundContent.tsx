'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Button } from '@/components/ui/button'

const LOTTIE_404 = '/404.lottie'

interface NotFoundContentProps {
  title?: string
  description?: string
  backHref?: string
  backLabel?: string
  showBackButton?: boolean
  actions?: React.ReactNode
}

export function NotFoundContent({
  title = 'Halaman tidak ditemukan',
  description = 'Alamat yang Anda buka tidak ada atau sudah dipindahkan. Coba mulai dari beranda atau jelajahi kursus.',
  showBackButton = true,
  actions,
}: NotFoundContentProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-500">
      <div className="w-full">
        <DotLottieReact src={LOTTIE_404} loop autoplay className="size-full" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {showBackButton && (
          <Button variant="outline" onClick={() => router.back()} className="gap-2 rounded-xl shadow-none">
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
        )}
        {actions}
      </div>
    </div>
  )
}
