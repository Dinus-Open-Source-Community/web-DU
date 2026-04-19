'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { LogoDu } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { GlobalInput } from '@/components/ui/GlobalInput'

export function FormForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-50">
          <CheckCircle2 className="size-8 text-emerald-500" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cek Email Kamu</h1>
          <p className="text-sm leading-relaxed text-slate-500">
            Kami telah mengirimkan link reset password ke <span className="font-semibold text-slate-700">{email}</span>. Silakan cek inbox atau folder spam kamu.
          </p>
        </div>
        <Button asChild variant="outline" className="h-11 rounded-xl border-slate-200 text-sm font-semibold shadow-none">
          <Link href="/auth/login" className="gap-2">
            <ArrowLeft className="size-4" />
            Kembali ke Login
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 lg:items-start">
        <Link href="/" className="mb-2 flex items-center gap-2 lg:hidden">
          <LogoDu className="size-8 text-primary" />
          <span className="text-lg font-bold tracking-tight text-primary">Doscom University</span>
        </Link>
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Mail className="size-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lupa Password</h1>
        <p className="text-sm leading-relaxed text-slate-500">
          Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset password kamu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <GlobalInput
          label="Email"
          placeholder="nama@email.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" className="h-12 rounded-xl text-sm font-bold" disabled={!email.trim()}>
          Kirim Link Reset
        </Button>
      </form>

      <div className="text-center">
        <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="size-4" />
          Kembali ke Login
        </Link>
      </div>
    </div>
  )
}
