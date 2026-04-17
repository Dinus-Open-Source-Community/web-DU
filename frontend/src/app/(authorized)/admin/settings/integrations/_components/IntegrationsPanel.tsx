'use client'

import { useState } from 'react'
import {
  BadgeCheck,
  CreditCard,
  Mail,
  Plug,
  QrCode,
  Send,
  Wallet,
} from 'lucide-react'

import { SettingsSection } from '@/components/admin/SettingsSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  keyLabel?: string
  keyValue?: string
}

export function IntegrationsPanel() {
  const [payments, setPayments] = useState<Integration[]>([
    {
      id: 'midtrans',
      name: 'Midtrans',
      description: 'Payment gateway untuk bank transfer, VA, dan e-wallet.',
      icon: <CreditCard className="h-4 w-4" />,
      connected: true,
      keyLabel: 'Server Key',
      keyValue: 'Mid-server-xxxxxxxxxxxxxxxx',
    },
    {
      id: 'xendit',
      name: 'Xendit',
      description: 'Alternatif payment gateway untuk disbursement & payout.',
      icon: <Wallet className="h-4 w-4" />,
      connected: false,
      keyLabel: 'Secret Key',
    },
    {
      id: 'qris',
      name: 'QRIS Aggregator',
      description: 'Terima pembayaran QRIS nasional dari seluruh bank.',
      icon: <QrCode className="h-4 w-4" />,
      connected: true,
      keyLabel: 'Merchant ID',
      keyValue: 'ID20250999123',
    },
  ])

  const [emails, setEmails] = useState<Integration[]>([
    {
      id: 'resend',
      name: 'Resend',
      description: 'Layanan email transaksional dan notifikasi.',
      icon: <Send className="h-4 w-4" />,
      connected: true,
      keyLabel: 'API Key',
      keyValue: 're_xxxxxxxxxxxxxxxx',
    },
    {
      id: 'mailgun',
      name: 'Mailgun',
      description: 'Alternatif penyedia SMTP untuk notifikasi email.',
      icon: <Mail className="h-4 w-4" />,
      connected: false,
      keyLabel: 'SMTP Password',
    },
  ])

  const toggleIntegration = (list: 'payment' | 'email', id: string) => {
    const updater = (arr: Integration[]) =>
      arr.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
    if (list === 'payment') setPayments(updater(payments))
    else setEmails(updater(emails))
  }

  return (
    <div className="flex flex-col gap-5">
      <SettingsSection
        title="Payment Integrations"
        description="Hubungkan penyedia pembayaran untuk proses checkout siswa.">
        <div className="flex flex-col gap-3">
          {payments.map((p) => (
            <IntegrationRow
              key={p.id}
              integration={p}
              onToggle={() => toggleIntegration('payment', p.id)}
            />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Email & Notifications"
        description="Provider pengiriman email transaksional dan notifikasi sistem.">
        <div className="flex flex-col gap-3">
          {emails.map((e) => (
            <IntegrationRow
              key={e.id}
              integration={e}
              onToggle={() => toggleIntegration('email', e.id)}
            />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Webhook"
        description="Kirim event transaksi dan pendaftaran ke URL custom.">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">URL Webhook</Label>
          <div className="flex gap-2">
            <Input id="webhook-url" placeholder="https://..." />
            <Button className="h-10 rounded-xl">Simpan</Button>
          </div>
          <p className="text-xs text-slate-500">
            Doscom akan mengirim POST JSON ke URL ini setiap kali event terjadi.
          </p>
        </div>
      </SettingsSection>
    </div>
  )
}

function IntegrationRow({
  integration,
  onToggle,
}: {
  integration: Integration
  onToggle: () => void
}) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:gap-4',
        integration.connected
          ? 'border-slate-200/80 bg-white'
          : 'border-dashed border-slate-200 bg-slate-50/40'
      )}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {integration.icon}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{integration.name}</span>
            {integration.connected ? (
              <Badge variant="couponActive">
                <BadgeCheck className="mr-1 h-3 w-3" aria-hidden /> Terhubung
              </Badge>
            ) : (
              <Badge variant="couponExpired">
                <Plug className="mr-1 h-3 w-3" aria-hidden /> Belum Terhubung
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">{integration.description}</p>
        </div>
      </div>

      <div className="ml-auto flex flex-1 flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-end">
        {integration.keyLabel && (
          <div className="flex items-center gap-2 md:w-[260px]">
            <Label className="sr-only" htmlFor={`key-${integration.id}`}>
              {integration.keyLabel}
            </Label>
            <Input
              id={`key-${integration.id}`}
              type={revealed ? 'text' : 'password'}
              placeholder={integration.keyLabel}
              defaultValue={integration.keyValue ?? ''}
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 shrink-0 rounded-lg px-3 text-xs font-medium text-slate-500 hover:bg-slate-100"
              onClick={() => setRevealed((v) => !v)}>
              {revealed ? 'Sembunyikan' : 'Lihat'}
            </Button>
          </div>
        )}
        <Switch checked={integration.connected} onCheckedChange={onToggle} />
      </div>
    </div>
  )
}
