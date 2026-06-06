import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { ImageIcon, Loader2 } from 'lucide-react'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrength'
import type { IAuthSessionUser } from '@/lib/types/auth'
import { toast } from 'sonner'
import { useUpdatePassword, useUpdateProfile, useUpdateProfilePhoto } from '@/hooks/use-user'
import { Input } from '../ui/input'
import { avatarFileSchema, changePasswordFormSchema, getValidationMessage, updateProfileSchema } from '@/lib/validator'

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

interface ProfileSectionProps {
  user: IAuthSessionUser
  onAvatarUpdated?: () => Promise<unknown>
}

export default function ProfileSection({ user, onAvatarUpdated }: ProfileSectionProps) {
  const [displayName, setDisplayName] = useState(user.name)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('')

  const { mutateAsync: updatePhoto, isPending: isPhotoPending } = useUpdateProfilePhoto()
  const { mutateAsync: updateProfile, isPending: isProfilePending } = useUpdateProfile()
  const { mutateAsync: updatePassword, isPending: isPasswordPending } = useUpdatePassword()

  const handleSubmitChangePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] || null
    const validation = avatarFileSchema.safeParse(file)
    if (!validation.success) {
      toast.error(getValidationMessage(validation.error, 'Foto profil tidak valid'))
      return
    }

    await updatePhoto(validation.data)
    await onAvatarUpdated?.()
    event.currentTarget.value = ''
  }

  const handleSubmitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isProfilePending) return

    const validation = updateProfileSchema.safeParse({ name: displayName })
    if (!validation.success) {
      toast.error(getValidationMessage(validation.error, 'Data profil tidak valid'))
      return
    }

    await updateProfile(validation.data)
  }

  const handleSubmitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPasswordPending) return

    const validation = changePasswordFormSchema.safeParse({
      new_password: newPassword,
      confirm_password: confirmPassword,
    })
    if (!validation.success) {
      toast.error(getValidationMessage(validation.error, 'Data password tidak valid'))
      return
    }

    await updatePassword({
      new_password: validation.data.new_password,
    })
    setNewPassword('')
    setConfirmPassword('')
  }

  useEffect(() => {
    setLastUpdatedLabel(new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()))
  }, [])

  useEffect(() => {
    setDisplayName(user.name)
  }, [user.name])

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-1 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Pengaturan Profil</h1>
        <p className="text-sm text-slate-500">Kelola informasi pribadi dan keamanan di akun Anda.</p>
      </div>

      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-1">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-emerald-50">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-emerald-800">{initialsFromName(user.name)}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{user.name}</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{user.role}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Diperbarui {lastUpdatedLabel || '-'}</p>
          </div>
        </div>
        <div className="mt-2 flex w-full shrink-0 gap-3 sm:mt-0 sm:w-auto">
          <Input type="file" accept="image/jpeg,image/png,image/gif" onChange={handleSubmitChangePhoto} className="hidden" id="avatar-upload" />
          <label
            htmlFor="avatar-upload"
            aria-disabled={isPhotoPending}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-primary focus:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-60">
            {isPhotoPending ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
            Ubah Foto
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="mb-6 text-lg font-bold text-slate-800">Informasi User</h2>
        <form onSubmit={handleSubmitProfile} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Nama Tampilan</label>
              <Input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Alamat Email</label>
              <Input type="email" defaultValue={user.email} readOnly className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none" />
            </div>
          </div>
          <div className="mt-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isProfilePending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/95 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60">
              {isProfilePending ? <Loader2 className="size-4 animate-spin" /> : null}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="mb-8 text-lg font-bold text-slate-800">Keamanan Akun</h2>

        <div className="mb-8 flex flex-col gap-5 border-b border-slate-100 pb-8">
          <h3 className="ml-1 text-xs font-bold uppercase tracking-wider text-primary/80">Ubah Password Akun</h3>
          <form onSubmit={handleSubmitPassword} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-sm font-medium text-slate-700">Password Baru</label>
                <Input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <PasswordStrengthIndicator password={newPassword} className="mt-1" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
                <Input
                  type="password"
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {confirmPassword.length > 0 && newPassword !== confirmPassword && <p className="ml-1 text-xs font-medium text-rose-500">Password tidak cocok</p>}
              </div>
            </div>
            <div className="flex justify-start">
              <button type="submit" disabled={isPasswordPending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/95 disabled:opacity-60">
                {isPasswordPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Perbarui Password
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-5">
          <div className="mb-2 ml-1 flex flex-col gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80">Perbarui Alamat Email</h3>
            <p className="text-sm font-medium text-slate-500">Instruksi dan link konfirmasi akan dikirim ke kotak masuk email baru Anda.</p>
          </div>
          <form className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-sm font-medium text-slate-700">Alamat Email Baru</label>
                <Input
                  type="email"
                  defaultValue={user.email}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-sm font-medium text-slate-700">Password Saat Ini</label>
                <Input
                  type="password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-lg tracking-[0.2em] text-slate-900 shadow-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-start">
              <button type="button" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/95 disabled:opacity-60">
                Ajukan Perubahan Email
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
