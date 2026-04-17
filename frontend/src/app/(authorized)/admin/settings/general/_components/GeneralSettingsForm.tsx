'use client'

import { useState } from 'react'
import { Globe, Save } from 'lucide-react'

import { SettingsSection } from '@/components/admin/SettingsSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export function GeneralSettingsForm() {
  const [brandName, setBrandName] = useState('Doscom University')
  const [brandTagline, setBrandTagline] = useState('Platform pembelajaran digital terbaik di Indonesia.')
  const [supportEmail, setSupportEmail] = useState('support@doscom.id')
  const [defaultLocale, setDefaultLocale] = useState('id-ID')
  const [timezone, setTimezone] = useState('Asia/Jakarta')
  const [currency, setCurrency] = useState('IDR')
  const [maintenance, setMaintenance] = useState(false)
  const [allowRegistration, setAllowRegistration] = useState(true)
  const [reviewsEnabled, setReviewsEnabled] = useState(true)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <SettingsSection
        title="Identitas Brand"
        description="Informasi yang ditampilkan di halaman publik, email, dan faktur.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand-name">Nama platform</Label>
            <Input
              id="brand-name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Email support</Label>
            <Input
              id="support-email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand-tagline">Tagline</Label>
          <Textarea
            id="brand-tagline"
            value={brandTagline}
            onChange={(e) => setBrandTagline(e.target.value)}
            rows={2}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Regional"
        description="Bahasa, zona waktu, dan mata uang default di seluruh platform.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="locale">Bahasa default</Label>
            <Select value={defaultLocale} onValueChange={setDefaultLocale}>
              <SelectTrigger id="locale" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id-ID">Bahasa Indonesia (id-ID)</SelectItem>
                <SelectItem value="en-US">English (en-US)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Zona waktu</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Jakarta">Asia/Jakarta (UTC+7)</SelectItem>
                <SelectItem value="Asia/Makassar">Asia/Makassar (UTC+8)</SelectItem>
                <SelectItem value="Asia/Jayapura">Asia/Jayapura (UTC+9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Mata uang</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">IDR — Rupiah</SelectItem>
                <SelectItem value="USD">USD — US Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Fitur Platform"
        description="Aktifkan atau nonaktifkan fitur secara global.">
        <ToggleRow
          icon={<Globe className="h-4 w-4" />}
          label="Pendaftaran siswa baru"
          description="Izinkan pengunjung melakukan registrasi akun siswa."
          checked={allowRegistration}
          onChange={setAllowRegistration}
        />
        <ToggleRow
          label="Review & rating publik"
          description="Siswa dapat memberi ulasan yang tampil di halaman kursus."
          checked={reviewsEnabled}
          onChange={setReviewsEnabled}
        />
        <ToggleRow
          label="Mode pemeliharaan"
          description="Tampilkan halaman maintenance untuk seluruh user kecuali admin."
          checked={maintenance}
          onChange={setMaintenance}
          destructive
        />
      </SettingsSection>

      <div className="flex justify-end">
        <Button type="submit" className="h-10 gap-1.5 rounded-xl">
          <Save className="h-4 w-4" aria-hidden />
          Simpan perubahan
        </Button>
      </div>
    </form>
  )
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
  destructive = false,
}: {
  icon?: React.ReactNode
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  destructive?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 ${
        destructive && checked
          ? 'border-rose-200 bg-rose-50/50'
          : 'border-slate-200/60 bg-slate-50/40'
      }`}>
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {icon}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {description && <span className="text-xs text-slate-500">{description}</span>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
