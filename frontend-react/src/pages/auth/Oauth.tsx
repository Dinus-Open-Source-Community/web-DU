'use client'

import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { SafeLottie } from '../../components/ui/lottie'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // const { signInWithToken } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    // const expiresAt = searchParams.get('expires_at') ?? undefined
    const error = searchParams.get('error')

    if (error) {
      toast.error(decodeURIComponent(error))
      navigate('/auth/login')
      return
    }

    if (!token) {
      toast.error('Token OAuth tidak ditemukan')
      navigate('/auth/login')
      return
    }

    // void signInWithToken(token, expiresAt)
    //   .then(({ redirectPath }) => {
    //     navigate(redirectPath)
    //     toast.success('Login berhasil')
    //   })
    //   .catch((err: unknown) => {
    //     toast.error(err instanceof Error ? err.message : 'OAuth login gagal')
    //     router.replace('/auth/login')
    //   })
  }, [navigate, searchParams /* signInWithToken */])

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <SafeLottie src="/Book-loading.lottie" className="size-36" />
    </main>
  )
}
