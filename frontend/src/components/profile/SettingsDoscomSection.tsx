import { useState } from 'react'
import { Link2, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useDoscomBindStatus } from '@/hooks/use-user'
import { Message, resolveApiActionError } from '@/lib/Message'
import { settingsLayout } from '@/lib/profile/settings-layout'
import { cn } from '@/lib/utils'
import { startDoscomAccountBind } from '@/services/auth'

/** Kartu Settings untuk bind akun lokal ke akun DOSCOM lewat sso-auth. */
export function SettingsDoscomSection() {
  const { data, isLoading, isError } = useDoscomBindStatus()
  const [isPending, setIsPending] = useState(false)
  const [justBound, setJustBound] = useState(false)
  const isBound = justBound || data?.bound === true

  const handleBind = async () => {
    if (isPending || isBound) return

    setIsPending(true)
    try {
      const result = await startDoscomAccountBind()
      if (result.bound) {
        setJustBound(true)
        toast.success(Message.profile.doscomAlreadyBound)
        return
      }
      if (!result.url) {
        throw new Error('URL verifikasi DOSCOM tidak tersedia')
      }
      window.location.assign(result.url)
    } catch (error) {
      const source =
        error instanceof Error ? error : new Error(Message.profile.doscomBindFailed)
      toast.error(resolveApiActionError(source, Message.profile.doscomBindFailed))
    } finally {
      setIsPending(false)
    }
  }

  const statusLabel = isLoading
    ? 'Memeriksa status…'
    : isBound
      ? 'Sudah terhubung'
      : isError
        ? Message.profile.doscomBindStatusUnknown
        : 'Belum terhubung'

  const statusDescription = isBound
    ? 'Akun ini sudah terhubung ke DOSCOM. Kamu bisa masuk memakai akun DOSCOM.'
    : isError
      ? 'Status koneksi belum bisa diperiksa. Klik tombol untuk mencoba menghubungkan.'
      : 'Hubungkan akun ini ke akun DOSCOM supaya satu akun bisa dipakai di seluruh layanan DOSCOM.'

  return (
    <div className={settingsLayout.cardLg} data-testid="settings-doscom-section">
      <div className={settingsLayout.cardHeader}>
        <h2 className={settingsLayout.sectionTitle}>Akun DOSCOM</h2>
        <p className={settingsLayout.sectionDescription}>
          Hubungkan akun ini ke akun DOSCOM untuk memakai satu akun di seluruh layanan
          DOSCOM.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border-2 border-ink-900/10 bg-paper-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              isBound
                ? 'bg-note-mint/60 text-ink-900'
                : 'bg-paper-paper text-ink-500',
            )}
            aria-hidden
          >
            <ShieldCheck className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">{statusLabel}</p>
            <p className={cn(settingsLayout.personalRowHint, 'max-w-xl')}>
              {statusDescription}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleBind}
          disabled={isBound || isPending || isLoading}
          className={cn(settingsLayout.primaryButton, 'shrink-0')}
          data-testid="doscom-bind-button"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : isBound ? (
            <ShieldCheck className="size-4" aria-hidden />
          ) : (
            <Link2 className="size-4" aria-hidden />
          )}
          {isPending ? 'Menghubungkan…' : isBound ? 'Sudah terhubung' : 'Hubungkan akun'}
        </Button>
      </div>

      <p className={cn(settingsLayout.meta, 'mt-4 text-xs')}>
        Kamu akan diarahkan ke halaman DOSCOM untuk verifikasi. Setelah selesai, kamu
        kembali ke halaman ini.
      </p>
    </div>
  )
}
