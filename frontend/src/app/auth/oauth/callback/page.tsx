'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { DuLoader } from '@/components/feedback/DuLoader'
import { useAuth } from '@/providers/auth-provider'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithToken } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const expiresAt = searchParams.get('expires_at') ?? undefined
    const error = searchParams.get('error')

    if (error) {
      toast.error(decodeURIComponent(error))
      router.replace('/auth/login')
      return
    }

    if (!token) {
      toast.error('Token OAuth tidak ditemukan')
      router.replace('/auth/login')
      return
    }

    void signInWithToken(token, expiresAt)
      .then(({ redirectPath }) => {
        router.replace(redirectPath)
        toast.success('Login berhasil')
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : 'OAuth login gagal')
        router.replace('/auth/login')
      })
  }, [router, searchParams, signInWithToken])

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <DuLoader size={56} label="Memproses login OAuth" />
    </main>
  )
}
