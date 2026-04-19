'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Image as ImageIcon, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

const Section = () => {
  const user = useUser()
  const [name, setName] = useState(user.nama)
  const [email, setEmail] = useState(user.email)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [newEmail, setNewEmail] = useState(user.email)
  const [passwordForEmail, setPasswordForEmail] = useState('')

  /** Tanggal diformat hanya di klien agar output Intl konsisten dengan SSR. */
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('')

  useEffect(() => {
    setLastUpdatedLabel(
      new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())
    )
  }, [])

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info('Menyimpan profil memerlukan layanan backend yang terhubung.')
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info('Pembaruan kata sandi memerlukan layanan backend yang terhubung.')
  }

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info('Perubahan email memerlukan layanan backend yang terhubung.')
  }

  const roleLabel = user.role

  return (
    <section className="px-5 md:px-8 py-10 w-full max-w-4xl flex flex-col gap-8 mx-auto">
      <div className="flex flex-col gap-1 pb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">Pengaturan Profil</h1>
        <p className="text-sm text-slate-500">Kelola informasi pribadi dan keamanan di akun Anda.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between shadow-xs">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 p-1">
            <div className="w-full h-full relative rounded-xl overflow-hidden bg-emerald-50 flex items-center justify-center">
              {user.avatar ? (
                <Image src={user.avatar} alt="" fill className="object-cover" sizes="96px" />
              ) : (
                <span className="text-2xl font-bold text-emerald-800">{initialsFromName(user.nama)}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{user.nama}</h2>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">{roleLabel}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Diperbarui {lastUpdatedLabel || '—'}</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
          <button
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs">
            <ImageIcon className="w-4 h-4" />
            Ganti Avatar
          </button>
          <button
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/95 transition-colors shadow-sm border border-transparent">
            <Sparkles className="w-4 h-4" />
            Kelola Langganan
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Informasi User</h2>
        <form onSubmit={handleSavePreferences} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Tampilan</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>
            <div className="flex flex-col gap-2 relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Alamat Email</label>
              <input type="email" value={email} readOnly className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-4 py-3 outline-none cursor-not-allowed" />
            </div>
          </div>

          <div className="flex justify-end mt-2 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-colors outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 mb-8">Keamanan Akun</h2>

        <div className="flex flex-col gap-5 mb-8 pb-8 border-b border-slate-100">
          <h3 className="text-xs font-bold text-primary/80 uppercase tracking-wider ml-1">Ubah Password Akun</h3>
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 ">
              <label className="text-sm font-medium text-slate-700 ml-1">Password Saat Ini</label>
              <input
                type="password"
                value={currentPassword}
                placeholder="*********"
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full  bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary shadow-xs font-mono text-lg tracking-[0.2em]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Password Baru</label>
                <input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
                />
                <PasswordStrengthIndicator password={newPassword} className="mt-1" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
                />
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <p className="text-xs font-medium text-rose-500 ml-1">Password tidak cocok</p>
                )}
              </div>
            </div>
            <div className="flex justify-start">
              <button type="submit" className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-colors shadow-sm">
                Perbarui Password
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 mb-2 ml-1">
            <h3 className="text-xs font-bold text-primary/80 uppercase tracking-wider">Perbarui Alamat Email</h3>
            <p className="text-sm text-slate-500 font-medium">Instruksi dan link konfirmasi akan dikirim ke kotak masuk email baru Anda.</p>
          </div>
          <form onSubmit={handleUpdateEmail} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Alamat Email Baru</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Password Saat Ini</label>
                <input
                  type="password"
                  value={passwordForEmail}
                  onChange={(e) => setPasswordForEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary shadow-xs font-mono text-lg tracking-[0.2em]"
                />
              </div>
            </div>
            <div className="flex justify-start">
              <button type="submit" className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-colors shadow-sm">
                Ajukan Perubahan Email
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Section
