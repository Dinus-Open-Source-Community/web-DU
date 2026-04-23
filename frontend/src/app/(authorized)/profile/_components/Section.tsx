'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Image as ImageIcon, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import { useUpdateProfile, useChangePassword, useUploadAvatar } from '@/hooks/api'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

export default function Section() {
  const user = useUser()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const uploadAvatar = useUploadAvatar()

  const [name, setName] = useState(user.nama)
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState(user.email)
  const [passwordForEmail, setPasswordForEmail] = useState('')
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('')

  useEffect(() => {
    setLastUpdatedLabel(
      new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
    )
  }, [])

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile.mutateAsync({ name, email })
      toast.success('Profil berhasil diperbarui')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui profil')
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Password baru tidak cocok')
      return
    }
    try {
      await changePassword.mutateAsync({ old_password: currentPassword, new_password: newPassword })
      toast.success('Password berhasil diperbarui')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui password')
    }
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile.mutateAsync({ email: newEmail })
      toast.success('Email berhasil diperbarui')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui email')
    }
  }

  const handleAvatarChange = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        await uploadAvatar.mutateAsync(file)
        toast.success('Avatar berhasil diperbarui')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Gagal mengunggah avatar')
      }
    }
    input.click()
  }

  const isSaving = updateProfile.isPending || changePassword.isPending

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-10 md:px-8">
      <div className="flex flex-col gap-1 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Pengaturan Profil</h1>
        <p className="text-sm text-slate-500">Kelola informasi pribadi dan keamanan di akun Anda.</p>
      </div>

      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-1">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-emerald-50">
              {user.avatar ? (
                <Image src={user.avatar} alt="" fill className="object-cover" sizes="96px" />
              ) : (
                <span className="text-2xl font-bold text-emerald-800">{initialsFromName(user.nama)}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{user.nama}</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {user.role}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Diperbarui {lastUpdatedLabel || '—'}</p>
          </div>
        </div>
        <div className="mt-2 flex w-full shrink-0 gap-3 sm:mt-0 sm:w-auto">
          <button
            type="button"
            onClick={handleAvatarChange}
            disabled={uploadAvatar.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 sm:flex-none">
            {uploadAvatar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            Ganti Avatar
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-transparent bg-primary px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-primary/95 sm:flex-none">
            <Sparkles className="h-4 w-4" />
            Kelola Langganan
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="mb-6 text-lg font-bold text-slate-800">Informasi User</h2>
        <form onSubmit={handleSavePreferences} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Nama Tampilan</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">Alamat Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
              />
            </div>
          </div>
          <div className="mt-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/95 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60">
              {updateProfile.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="mb-8 text-lg font-bold text-slate-800">Keamanan Akun</h2>

        <div className="mb-8 flex flex-col gap-5 border-b border-slate-100 pb-8">
          <h3 className="ml-1 text-xs font-bold uppercase tracking-wider text-primary/80">Ubah Password Akun</h3>
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-sm font-medium text-slate-700">Password Saat Ini</label>
              <input
                type="password"
                value={currentPassword}
                placeholder="*********"
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-lg tracking-[0.2em] text-slate-900 shadow-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-sm font-medium text-slate-700">Password Baru</label>
                <input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <PasswordStrengthIndicator password={newPassword} className="mt-1" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <p className="ml-1 text-xs font-medium text-rose-500">Password tidak cocok</p>
                )}
              </div>
            </div>
            <div className="flex justify-start">
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/95 disabled:opacity-60">
                {changePassword.isPending ? 'Memperbarui...' : 'Perbarui Password'}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-5">
          <div className="mb-2 ml-1 flex flex-col gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80">Perbarui Alamat Email</h3>
            <p className="text-sm font-medium text-slate-500">
              Instruksi dan link konfirmasi akan dikirim ke kotak masuk email baru Anda.
            </p>
          </div>
          <form onSubmit={handleUpdateEmail} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-sm font-medium text-slate-700">Alamat Email Baru</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-sm font-medium text-slate-700">Password Saat Ini</label>
                <input
                  type="password"
                  value={passwordForEmail}
                  onChange={(e) => setPasswordForEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-lg tracking-[0.2em] text-slate-900 shadow-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-start">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/95 disabled:opacity-60">
                {updateProfile.isPending ? 'Memperbarui...' : 'Ajukan Perubahan Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
