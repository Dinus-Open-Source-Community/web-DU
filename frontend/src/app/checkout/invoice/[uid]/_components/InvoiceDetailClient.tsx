'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, Clock, Copy, Check as CheckIcon, Download, QrCode, Landmark, Wallet, CreditCard } from 'lucide-react'
import GuestLayout from '@/components/layout/GuestLayout'
import { SafeLottie } from '@/components/ui/SafeLottie'
import { Button } from '@/components/ui/button'
import { PaymentBadge } from '@/components/ui/badge'
import { PaymentProgressStepper, PaymentResultBanner } from '@/components/ui/PaymentProgressStepper'
import { formatCountdown, formatDateTime, formatRupiah, getPaymentInstructions, type PaymentInstructionSet } from '@/lib/func'
import type { TransactionHistoryItem } from '@/lib/types'

const DISCOUNT_PERCENTAGE = 0
const PENDING_PAYMENT_WINDOW_MINUTES = 15

const instructionIconMap: Record<PaymentInstructionSet['iconKey'], React.ReactNode> = {
  'qr-code': <QrCode className="size-4" />,
  wallet: <Wallet className="size-4" />,
  landmark: <Landmark className="size-4" />,
  'credit-card': <CreditCard className="size-4" />,
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <button type="button" onClick={() => setOpen((prev) => !prev)} className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-slate-50/60">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
          {title}
        </span>
        <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-4 pb-4 pt-3.5">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function TransactionNotFound() {
  return (
    <GuestLayout>
      <main className="flex min-h-dvh w-full items-center justify-center px-5 py-16">
        <div className="flex w-full max-w-md flex-col items-center gap-5 text-center animate-in fade-in duration-500">
          <div className="w-full max-w-sm aspect-square">
            <SafeLottie src="/transaction-not-found.lottie" className="size-full" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Transaksi Tidak Ditemukan</h1>
            <p className="text-sm leading-relaxed text-slate-500">Transaksi dengan ID tersebut tidak tersedia atau sudah dihapus. Silakan periksa kembali atau kembali ke halaman riwayat transaksi.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button asChild className="h-10 rounded-xl px-5 text-sm font-semibold">
              <Link href="/student/transactions">Riwayat Transaksi</Link>
            </Button>
            <Button asChild variant="outline" className="h-10 rounded-xl border-slate-200 px-5 text-sm font-semibold shadow-none">
              <Link href="/course">Jelajahi Kursus</Link>
            </Button>
          </div>
        </div>
      </main>
    </GuestLayout>
  )
}

export function InvoiceDetailClient({ transaction }: { transaction: TransactionHistoryItem }) {
  const subtotal = transaction.price
  const discountAmount = Math.round(subtotal * (DISCOUNT_PERCENTAGE / 100))
  const total = subtotal - discountAmount
  const isPending = transaction.paymentStatus === 'PENDING'
  const isQrisPayment = transaction.paymentMethod === 'QRIS'

  const pendingExpiredAt = useMemo(() => new Date(new Date(transaction.purchasedAt).getTime() + PENDING_PAYMENT_WINDOW_MINUTES * 60 * 1000), [transaction.purchasedAt])

  const getRemainingSeconds = useCallback(() => {
    if (!isPending) return 0
    const remaining = Math.ceil((pendingExpiredAt.getTime() - Date.now()) / 1000)
    return Math.max(0, remaining)
  }, [isPending, pendingExpiredAt])

  const [secondsLeft, setSecondsLeft] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isPending) {
      setSecondsLeft(0)
      return
    }
    setSecondsLeft(getRemainingSeconds())
    const timer = setInterval(() => setSecondsLeft(getRemainingSeconds()), 1000)
    return () => clearInterval(timer)
  }, [isPending, getRemainingSeconds])

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.transactionId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isExpired = isPending && secondsLeft === 0
  const progressPercent = isPending ? Math.max(0, (secondsLeft / (PENDING_PAYMENT_WINDOW_MINUTES * 60)) * 100) : 0
  const instructions = getPaymentInstructions(transaction.paymentMethod)

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto w-full max-w-5xl px-5 py-6 md:px-8 md:py-8">
        <Button asChild variant="outline" size="sm" className="mb-5 h-9 rounded-lg border-slate-200 text-sm font-medium text-slate-600 shadow-none hover:bg-slate-50">
          <Link href="/student/transactions" className="gap-1.5">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>

        <section className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-7">
          <PaymentProgressStepper status={transaction.paymentStatus} purchasedAt={transaction.purchasedAt} />
        </section>

        {transaction.paymentStatus !== 'PENDING' && (
          <div className="mb-5">
            <PaymentResultBanner status={transaction.paymentStatus} />
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="flex flex-col gap-5 lg:col-span-3">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-36 w-full shrink-0 sm:h-auto sm:w-40 md:w-48">
                  <Image src={transaction.courseImage} alt={transaction.courseName} fill className="object-cover" sizes="(max-width: 640px) 100vw, 192px" />
                </div>
                <div className="flex flex-col justify-center p-4 md:p-5">
                  <span className="mb-1.5 inline-flex w-fit rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">{transaction.classType}</span>
                  <h2 className="text-sm font-semibold leading-snug text-slate-900 md:text-base">{transaction.courseName}</h2>
                </div>
              </div>
            </section>

            {isPending && (
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                <div className={`border-l-[5px] ${isExpired ? 'border-rose-500' : 'border-primary'}`}>
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${isExpired ? 'bg-rose-50 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                        <Clock className="size-4" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-sm font-semibold text-slate-900">{isExpired ? 'Batas waktu pembayaran telah habis' : 'Selesaikan pembayaran'}</h2>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                          {isExpired ? 'Silakan buat transaksi baru jika masih ingin melanjutkan.' : 'Transfer sebelum batas waktu agar tidak dibatalkan otomatis.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className={`rounded-xl border px-3.5 py-3 ${isExpired ? 'border-rose-100 bg-rose-50/50' : 'border-primary/15 bg-primary/5'}`}>
                        <p className={`text-[10px] font-semibold uppercase tracking-widest ${isExpired ? 'text-rose-500' : 'text-primary/70'}`}>Sisa Waktu</p>
                        <p className={`mt-1 font-mono text-2xl font-bold leading-none tabular-nums tracking-tight ${isExpired ? 'text-rose-600' : 'text-primary'}`}>{formatCountdown(secondsLeft)}</p>
                        {!isExpired && (
                          <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-primary/15">
                            <div className="h-full rounded-full bg-primary transition-[width] duration-200 ease-linear" style={{ width: `${progressPercent}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Batas Akhir</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{formatDateTime(pendingExpiredAt.toISOString())}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Durasi {PENDING_PAYMENT_WINDOW_MINUTES} menit</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {isQrisPayment && isPending && transaction.qrImage && (
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                <div className="p-5">
                  <div className="flex gap-5">
                    <div className="shrink-0">
                      <div className="w-44 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
                        <Image src={transaction.qrImage} alt="QRIS code" width={176} height={176} className="h-auto w-full" priority unoptimized />
                      </div>
                      <button
                        type="button"
                        className="mt-2.5 flex w-44 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                        <Download className="size-3" />
                        Unduh Kode QR
                      </button>
                    </div>
                    <div className="flex-1 py-1">
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <QrCode className="size-3" />
                        QRIS
                      </div>
                      <h2 className="text-sm font-semibold text-slate-900">Pembayaran via QRIS</h2>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">Scan kode QR menggunakan aplikasi e-wallet atau mobile banking yang mendukung QRIS.</p>
                      <div className="mt-3 flex flex-col gap-1.5">
                        {['GoPay, OVO, DANA, ShopeePay, LinkAja', 'Semua mobile banking dengan fitur QRIS', 'Screenshot QR jika tidak bisa scan langsung'].map((text) => (
                          <div key={text} className="flex items-center gap-2 text-[11px] text-slate-500">
                            <div className="size-1 rounded-full bg-primary/50" />
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="flex flex-col gap-2.5">
              <h2 className="text-sm font-semibold text-slate-900">Instruksi Pembayaran</h2>
              <CollapsibleSection title={instructions.title} icon={instructionIconMap[instructions.iconKey]} defaultOpen>
                <ol className="flex flex-col gap-2.5">
                  {instructions.steps.map((step, i) => (
                    <li key={step} className="flex gap-2.5 text-xs leading-relaxed text-slate-600">
                      <span className="mt-px flex size-4.5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CollapsibleSection>
            </section>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Detail Transaksi</h2>
              <dl className="text-[13px]">
                <div className="flex items-center justify-between border-b border-slate-100 py-2.5">
                  <dt className="font-medium text-slate-500">ID Transaksi</dt>
                  <dd className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">{transaction.transactionId}</span>
                    <button type="button" onClick={handleCopyId} className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                      {copied ? <CheckIcon className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    </button>
                  </dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 py-2.5">
                  <dt className="font-medium text-slate-500">Tanggal</dt>
                  <dd className="font-semibold text-slate-800">{formatDateTime(transaction.purchasedAt)}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 py-2.5">
                  <dt className="font-medium text-slate-500">Metode</dt>
                  <dd className="font-semibold text-slate-800">{transaction.paymentMethod}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="font-medium text-slate-500">Status</dt>
                  <dd>
                    <PaymentBadge status={transaction.paymentStatus} />
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Ringkasan Pembayaran</h2>
              <div className="text-[13px]">
                <div className="flex items-center justify-between border-b border-slate-100 py-2.5">
                  <span className="font-medium text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 py-2.5">
                  <span className="font-medium text-slate-500">Diskon {DISCOUNT_PERCENTAGE > 0 && `(${DISCOUNT_PERCENTAGE}%)`}</span>
                  <span className={`font-semibold ${discountAmount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>{discountAmount > 0 ? `- ${formatRupiah(discountAmount)}` : '-'}</span>
                </div>
                <div className="flex items-center justify-between pt-3.5">
                  <span className="text-sm font-bold text-slate-900">Total</span>
                  <span className="text-base font-bold tracking-tight text-slate-900">{formatRupiah(total)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
