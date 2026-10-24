import { useState } from 'react'
import { Ticket, ArrowRight, HelpCircle, CheckCircle2, AlertCircle, BookOpen, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { StudentAppPageShell } from '@/components/student/StudentAppPageShell'
import { PageHeader } from '@/components/shared/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { useAuth } from '@/providers/auth-provider'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { redeemCourseCode, type IRedeemResult } from '@/services/redeem'
import { getApiErrorMessage, coerceAppError } from '@/services/api-error'

export default function StudentRedeemPage() {
  const sidebarUser = useSidebarUser('student')
  const { refreshProfile } = useAuth()
  const queryClient = useQueryClient()

  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<IRedeemResult | null>(null)

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) return

    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessResult(null)

    try {
      const res = await redeemCourseCode({ code: cleanCode })
      setSuccessResult(res)
      toast.success(`Selamat! Berhasil bergabung ke kursus "${res.course.title}".`)
      setCode('')

      // Perbarui profile & cache query agar kursus langsung muncul di daftar pembelajaran
      void refreshProfile()
      void queryClient.invalidateQueries({ queryKey: ['courses'] })
    } catch (err: unknown) {
      const appErr = coerceAppError(err as Error)
      const message = appErr
        ? getApiErrorMessage(appErr, 'Gagal menukarkan kode redeem. Silakan periksa kembali kode Anda.')
        : 'Gagal menukarkan kode redeem. Silakan periksa kembali kode Anda.'
      setErrorMsg(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <StudentAppPageShell user={sidebarUser}>
      <section className="flex w-full flex-col gap-6">
        <PageHeader
          className={studentDashboardLayout.pageHeader}
          title="Redeem Code"
          subtitle="Gunakan kode voucher atau token akses yang Anda miliki untuk membuka dan bergabung ke kelas kursus."
        />

        {successResult ? (
          <div className="flex flex-col gap-4 rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/70 p-6 shadow-sm">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-emerald-600" aria-hidden />
              <div className="min-w-0">
                <h3 className="text-base font-bold text-emerald-950 sm:text-lg">
                  Penukaran Kode Berhasil!
                </h3>
                <p className="mt-1 text-sm text-emerald-800">
                  Anda telah terdaftar secara aktif dalam kursus{' '}
                  <strong className="font-semibold text-emerald-950">{successResult.course.title}</strong>.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button asChild className="gap-2 font-bold shadow-button" variant="default">
                    <Link to={ROUTES.student.learningCourse(successResult.course.uid)}>
                      <BookOpen className="size-4" aria-hidden />
                      <span>Mulai Belajar</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="font-semibold">
                    <Link to={ROUTES.student.learning}>Lihat di Pembelajaran Saya</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className={cn(appCardClassName, 'p-6 sm:p-8 lg:col-span-2')}>
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-ink-900 bg-note-yellow shadow-button">
                <Ticket className="size-6 text-ink-900" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink-900 sm:text-xl">
                  Tukarkan Kode Akses Kursus
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  Masukkan kode unik yang Anda terima untuk mengaktifkan kursus ke akun Anda secara instan.
                </p>
              </div>
            </div>

            <form onSubmit={handleRedeem} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="redeem-code" className="text-xs font-bold uppercase tracking-wider text-ink-600">
                  Kode Voucher / Token
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="redeem-code"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase())
                      if (errorMsg) setErrorMsg(null)
                    }}
                    placeholder="Contoh: KURSUS-REACT-2026"
                    className="h-11 font-mono uppercase tracking-wider"
                    disabled={isSubmitting}
                    maxLength={64}
                  />
                  <Button
                    type="submit"
                    className="h-11 gap-2 whitespace-nowrap px-6 font-bold"
                    disabled={!code.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <span>Tukarkan</span>
                        <ArrowRight className="size-4" aria-hidden />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {errorMsg ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <p>{errorMsg}</p>
                </div>
              ) : null}
            </form>
          </div>

          <div className={cn(appCardClassName, 'flex flex-col gap-4 p-6')}>
            <div className="flex items-center gap-2 text-ink-900">
              <HelpCircle className="size-5 text-brand-blue" aria-hidden />
              <h3 className="font-bold">Panduan Redeem</h3>
            </div>
            <ul className="flex flex-col gap-3 text-sm text-ink-600">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-paper-paper text-xs font-bold text-ink-900">
                  1
                </span>
                <span>Pastikan kode yang dimasukkan sudah sesuai (huruf besar/kecil tidak berpengaruh).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-paper-paper text-xs font-bold text-ink-900">
                  2
                </span>
                <span>Kode redeem yang ditargetkan untuk akun atau email khusus hanya bisa digunakan oleh akun terkait.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-paper-paper text-xs font-bold text-ink-900">
                  3
                </span>
                <span>Setiap kode voucher hanya dapat digunakan satu kali per akun dan memiliki batas masa berlaku serta kuota.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-paper-paper text-xs font-bold text-ink-900">
                  4
                </span>
                <span>
                  Setelah berhasil ditukarkan, kursus akan langsung aktif di menu{' '}
                  <strong className="text-ink-900">Pembelajaran Saya &gt; Kursus</strong>.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </StudentAppPageShell>
  )
}
