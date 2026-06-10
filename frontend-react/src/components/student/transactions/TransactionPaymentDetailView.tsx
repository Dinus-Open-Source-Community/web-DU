import { ArrowLeft, Copy, Check, ExternalLink, ChevronDown, QrCode, Download, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useCallback, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'
import { ReactIcon } from '@/components/shared/icon'
import { SafeLottie } from '@/components/ui/lottie'
import { PaymentBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormatRupiah } from '@/lib/func/func'
import { presentPaymentInvoiceView } from '@/lib/transactions/present-payment-invoice-view'
import type { PaymentInvoiceViewModel } from '@/lib/transactions/present-payment-invoice-view'
import type { PaymentInstruction, TransactionPaymentDetailViewModel } from '@/lib/transactions/payment-types'
import { ROUTES } from '@/lib/routes'
import { api } from '@/services/axios'
import { API_ROUTES } from '@/services/api-path'
import type { IResponse } from '@/lib/types/api'

type PaymentDetailViewProps = {
  detail: TransactionPaymentDetailViewModel
  backHref?: string
}

const LOTTIE_ASSETS = {
  success: '/Payment_Success.lottie',
  failed: '/Payment_Failed.lottie',
} as const

const OVERLAY_PLAY_MS = 2200
const OVERLAY_TRANSITION_MS = 800

function useCopyToClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = useCallback(async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 2000)
    } catch { /* clipboard unavailable */ }
  }, [])

  return { copiedKey, copy }
}

function useInvoiceDownload() {
  const [loading, setLoading] = useState(false)

  const download = useCallback(async (enrollmentUid: string, userUid: string, courseUid: string) => {
    setLoading(true)
    try {
      const response = await api.get<IResponse<{ invoice_url: string }>>(
        API_ROUTES.invoices.getInvoiceUrl({
          enrollment_id: enrollmentUid,
          user_id: userUid,
          course_id: courseUid,
        }),
      )
      const url = response.data.data?.invoice_url
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      /* silently fail */
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, download }
}

// ---------------------------------------------------------------------------
// Lottie Loading (replaces skeleton)
// ---------------------------------------------------------------------------

export function TransactionPaymentLoading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="size-40">
        <SafeLottie src="/loading-payment.lottie" loop autoplay />
      </div>
      <p className="mt-2 text-sm font-medium text-slate-500">Memuat detail pembayaran...</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Lottie Overlay with shrink-to-inline transition
// ---------------------------------------------------------------------------

function LottieStatusOverlay({
  status,
  targetRef,
  onComplete,
}: {
  status: 'success' | 'failed'
  targetRef: React.RefObject<HTMLDivElement | null>
  onComplete: () => void
}) {
  const sourceRef = useRef<HTMLDivElement>(null)
  const [transitioning, setTransitioning] = useState(false)

  const startTransition = useCallback(() => setTransitioning(true), [])

  useEffect(() => {
    const timer = setTimeout(startTransition, OVERLAY_PLAY_MS)
    return () => clearTimeout(timer)
  }, [startTransition])

  useEffect(() => {
    if (!transitioning) return

    const source = sourceRef.current
    const target = targetRef.current

    if (source && target) {
      const s = source.getBoundingClientRect()
      const t = target.getBoundingClientRect()
      const dx = t.left + t.width / 2 - (s.left + s.width / 2)
      const dy = t.top + t.height / 2 - (s.top + s.height / 2)
      const scale = t.width / s.width

      requestAnimationFrame(() => {
        source.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`
        source.style.opacity = '0'
      })
    }

    const timer = setTimeout(onComplete, OVERLAY_TRANSITION_MS + 50)
    return () => clearTimeout(timer)
  }, [transitioning, onComplete, targetRef])

  const overlayBg = status === 'success' ? 'bg-emerald-900/20' : 'bg-rose-900/20'
  const textColor = status === 'success' ? 'text-emerald-900' : 'text-rose-900'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={startTransition}
      role="dialog"
      aria-label={status === 'success' ? 'Pembayaran berhasil' : 'Pembayaran gagal'}
    >
      <div
        className={cn('absolute inset-0 backdrop-blur-md', overlayBg)}
        style={{
          transition: `opacity ${OVERLAY_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          opacity: transitioning ? 0 : 1,
        }}
      />

      <div className="relative flex flex-col items-center gap-3">
        <div
          ref={sourceRef}
          className="size-52 sm:size-60"
          style={{
            transition: [
              `transform ${OVERLAY_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              `opacity ${OVERLAY_TRANSITION_MS * 0.6}ms ${OVERLAY_TRANSITION_MS * 0.3}ms ease-in`,
            ].join(', '),
          }}
        >
          <SafeLottie src={LOTTIE_ASSETS[status]} loop={false} autoplay />
        </div>
        <p
          className={cn('text-center text-lg font-bold drop-shadow-sm', textColor)}
          style={{
            transition: `opacity ${OVERLAY_TRANSITION_MS * 0.3}ms ease-out`,
            opacity: transitioning ? 0 : 1,
          }}
        >
          {status === 'success' ? 'Pembayaran Berhasil!' : 'Pembayaran Gagal'}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared Primitives
// ---------------------------------------------------------------------------

function CopyInlineButton({
  label,
  value,
  copiedKey,
  onCopy,
}: {
  label: string
  value: string
  copiedKey: string | null
  onCopy: (key: string, value: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(label, value)}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 active:scale-95"
      aria-label={`Salin ${label}`}
    >
      {copiedKey === label
        ? <Check className="size-3.5 text-emerald-600" aria-hidden />
        : <Copy className="size-3.5" aria-hidden />}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Stepper / Progress Tracker
// ---------------------------------------------------------------------------

function PaymentStepper({ status }: { status: 'pending' | 'success' | 'failed' }) {
  const steps = [
    { label: 'Detail Pesanan', done: true },
    { label: 'Pembayaran', done: status === 'success' || status === 'pending', active: status === 'pending' },
    { label: 'Konfirmasi', done: status === 'success', failed: status === 'failed' },
  ]

  return (
    <nav className="flex items-center justify-center gap-0" aria-label="Progress pembayaran">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const iconColor = step.failed
          ? 'bg-rose-600 text-white shadow-sm shadow-rose-200'
          : step.done
            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
            : step.active
              ? 'bg-primary text-white shadow-sm shadow-primary/30'
              : 'bg-slate-200 text-slate-400'

        const lineColor = steps[i + 1]?.done ? 'bg-emerald-500' : 'bg-slate-200'

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn('flex size-9 items-center justify-center rounded-full transition-colors', iconColor)}>
                {step.failed
                  ? <XCircle className="size-4.5" aria-hidden />
                  : step.done
                    ? <CheckCircle2 className="size-4.5" aria-hidden />
                    : step.active
                      ? <Clock className="size-4.5" aria-hidden />
                      : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <span className={cn(
                'text-[11px] font-semibold',
                step.failed ? 'text-rose-700' : step.done || step.active ? 'text-slate-800' : 'text-slate-400',
              )}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={cn('mb-5 h-0.5 w-14 sm:w-24 md:w-32', lineColor)} />
            )}
          </div>
        )
      })}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Status Banner (inline Lottie target)
// ---------------------------------------------------------------------------

function StatusBanner({
  invoice,
  lottieTargetRef,
}: {
  invoice: PaymentInvoiceViewModel
  lottieTargetRef: React.RefObject<HTMLDivElement | null>
}) {
  const isTerminal = invoice.paymentStatus === 'success' || invoice.paymentStatus === 'failed'
  if (!isTerminal) return null

  const isSuccess = invoice.paymentStatus === 'success'

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border px-5 py-5',
        isSuccess
          ? 'border-emerald-300 bg-emerald-50'
          : 'border-rose-300 bg-rose-50',
      )}
    >
      <div ref={lottieTargetRef} className="size-14 shrink-0">
        <SafeLottie
          src={LOTTIE_ASSETS[invoice.paymentStatus as 'success' | 'failed']}
          loop={false}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className={cn(
          'text-base font-bold',
          isSuccess ? 'text-emerald-900' : 'text-rose-900',
        )}>
          {isSuccess ? 'Pembayaran Berhasil' : 'Pembayaran Gagal'}
        </h2>
        <p className={cn(
          'mt-0.5 text-sm leading-relaxed',
          isSuccess ? 'text-emerald-700' : 'text-rose-700',
        )}>
          {invoice.statusMessage}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Left Column: Booking Details
// ---------------------------------------------------------------------------

function BookingDetailsSection({
  invoice,
  copiedKey,
  onCopy,
}: {
  invoice: PaymentInvoiceViewModel
  copiedKey: string | null
  onCopy: (key: string, value: string) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold tracking-tight text-slate-900">Detail Pembayaran</h2>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {invoice.customerName && (
          <DetailField label="Pelanggan" value={invoice.customerName} />
        )}
        <DetailField label="Metode Pembayaran" value={invoice.paymentMethodLabel} />
        <DetailField label="Status">
          <PaymentBadge status={invoice.paymentStatus} />
        </DetailField>
        {invoice.createdDateLabel && (
          <DetailField label="Tanggal Dibuat" value={invoice.createdDateLabel} />
        )}
        {invoice.paidDateLabel && (
          <DetailField label="Tanggal Dibayar" value={invoice.paidDateLabel} />
        )}
        {invoice.expiredDateLabel && (
          <DetailField label="Batas Waktu" value={invoice.expiredDateLabel} />
        )}
      </div>

      <div className="border-t border-slate-200 pt-5">
        <DetailField label="Nomor Referensi">
          <div className="flex items-center gap-1">
            <span className="font-mono text-sm font-bold tracking-tight text-slate-900">
              {invoice.reference}
            </span>
            <CopyInlineButton label="reference" value={invoice.reference} copiedKey={copiedKey} onCopy={onCopy} />
          </div>
        </DetailField>
      </div>
    </div>
  )
}

function DetailField({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {children ?? <p className="text-sm font-semibold text-slate-900">{value}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// QRIS Section
// ---------------------------------------------------------------------------

function QrisSection({
  qrUrl,
  payCode,
  copiedKey,
  onCopy,
}: {
  qrUrl: string
  payCode: string
  copiedKey: string | null
  onCopy: (key: string, value: string) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex flex-col items-center gap-4">
        {qrUrl ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <img src={qrUrl} alt="QRIS" className="size-44 object-contain sm:size-48" />
          </div>
        ) : (
          <div className="flex size-44 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white sm:size-48">
            <QrCode className="size-10 text-slate-400" aria-hidden />
          </div>
        )}

        {payCode && (
          <div className="flex w-full max-w-xs items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="min-w-0 flex-1 truncate text-center font-mono text-sm font-bold tracking-wider text-slate-900">
              {payCode}
            </p>
            <CopyInlineButton label="qris" value={payCode} copiedKey={copiedKey} onCopy={onCopy} />
          </div>
        )}

        <p className="max-w-xs text-center text-xs leading-relaxed text-slate-600">
          Scan kode QR menggunakan aplikasi e-wallet atau mobile banking untuk menyelesaikan pembayaran.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pay Code Section (VA / Retail)
// ---------------------------------------------------------------------------

function PayCodeSection({
  payCode,
  copiedKey,
  onCopy,
}: {
  payCode: string
  copiedKey: string | null
  onCopy: (key: string, value: string) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Nomor Virtual Account / Kode Bayar</p>
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xl font-bold tracking-wider text-slate-950 sm:text-2xl">
          {payCode}
        </p>
        <CopyInlineButton label="payCode" value={payCode} copiedKey={copiedKey} onCopy={onCopy} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Instructions Accordion
// ---------------------------------------------------------------------------

function InstructionsSection({ instructions }: { instructions: PaymentInstruction[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (instructions.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900">Cara Pembayaran</h3>
      <div className="space-y-2">
        {instructions.map((instruction, idx) => {
          const isOpen = openIndex === idx

          return (
            <div key={instruction.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                aria-expanded={isOpen}
              >
                {instruction.title}
                <ChevronDown
                  className={cn('size-4 shrink-0 text-slate-500 transition-transform duration-200', isOpen && 'rotate-180')}
                  aria-hidden
                />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                  <ol className="space-y-2.5">
                    {instruction.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                          {stepIdx + 1}
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: step }} />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Right Column: Price Summary
// ---------------------------------------------------------------------------

type InvoiceDownloadParams = {
  enrollmentUid: string | null
  userUid: string | null
  courseUid: string | null
}

function PriceSummaryCard({
  invoice,
  copiedKey,
  onCopy,
  downloadParams,
}: {
  invoice: PaymentInvoiceViewModel
  copiedKey: string | null
  onCopy: (key: string, value: string) => void
  downloadParams: InvoiceDownloadParams
}) {
  const lineItemsTotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const fee = invoice.totalAmount - lineItemsTotal

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-bold tracking-tight text-slate-900">Ringkasan Pembayaran</h3>
      </div>

      {/* Course preview */}
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex gap-3">
          <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {invoice.courseImageUrl ? (
              <img
                src={invoice.courseImageUrl}
                alt={invoice.courseTitle}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <ReactIcon className="size-7 text-slate-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-snug text-slate-900">{invoice.courseTitle}</p>
            {invoice.customerName && (
              <p className="mt-0.5 text-xs font-medium text-slate-500">{invoice.customerName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="px-5 py-3">
        {invoice.lineItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="font-medium text-slate-700">
              {item.label}
              {item.description && <span className="ml-1.5 text-slate-400">{item.description}</span>}
            </span>
            <span className="font-semibold tabular-nums text-slate-800">{FormatRupiah(item.amount)}</span>
          </div>
        ))}
        {fee > 0 && (
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="font-medium text-slate-700">Biaya layanan</span>
            <span className="font-semibold tabular-nums text-slate-800">{FormatRupiah(fee)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t-2 border-slate-200 bg-primary/5 px-5 py-4">
        <span className="text-sm font-bold text-slate-900">Total Pembayaran</span>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-extrabold tabular-nums tracking-tight text-primary">
            {FormatRupiah(invoice.totalAmount)}
          </span>
          <CopyInlineButton label="total" value={String(invoice.totalAmount)} copiedKey={copiedKey} onCopy={onCopy} />
        </div>
      </div>

      {/* Actions */}
      <ActionButtons invoice={invoice} downloadParams={downloadParams} />
    </div>
  )
}

function ActionButtons({
  invoice,
  downloadParams,
}: {
  invoice: PaymentInvoiceViewModel
  downloadParams: InvoiceDownloadParams
}) {
  const { loading, download } = useInvoiceDownload()

  const canDownloadInvoice = invoice.paymentStatus === 'success'
    && downloadParams.enrollmentUid
    && downloadParams.userUid
    && downloadParams.courseUid

  return (
    <div className="flex flex-col gap-2.5 px-5 pb-5 pt-1">
      {invoice.canContinuePayment && (
        <Button asChild className="w-full" size="lg">
          <a href={invoice.checkoutUrl} target="_blank" rel="noopener noreferrer">
            Lanjutkan Pembayaran
            <ExternalLink className="size-3.5" aria-hidden data-icon="inline-end" />
          </a>
        </Button>
      )}

      {canDownloadInvoice && (
        <Button
          className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
          size="lg"
          disabled={loading}
          onClick={() => download(downloadParams.enrollmentUid!, downloadParams.userUid!, downloadParams.courseUid!)}
        >
          {loading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
          ) : (
            <Download className="size-4" aria-hidden data-icon="inline-start" />
          )}
          Download Invoice
        </Button>
      )}

      {invoice.paymentStatus === 'failed' && (
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link to={ROUTES.student.transactions}>Kembali ke Riwayat</Link>
        </Button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main View
// ---------------------------------------------------------------------------

export function TransactionPaymentDetailView({ detail, backHref }: PaymentDetailViewProps) {
  const invoice = presentPaymentInvoiceView(detail)
  const { copiedKey, copy } = useCopyToClipboard()
  const handleCopy = useCallback((k: string, v: string) => void copy(k, v), [copy])

  const inlineLottieRef = useRef<HTMLDivElement>(null)
  const isTerminal = invoice.paymentStatus === 'success' || invoice.paymentStatus === 'failed'
  const isPending = invoice.paymentStatus === 'pending'

  const [overlayVisible, setOverlayVisible] = useState(isTerminal)
  const dismissOverlay = useCallback(() => setOverlayVisible(false), [])

  const showQris = invoice.isQris && isPending && (invoice.qrUrl || invoice.payCode)
  const showPayCode = !invoice.isQris && invoice.payCode && isPending

  const downloadParams: InvoiceDownloadParams = {
    enrollmentUid: detail.payment.enrollmentUid,
    userUid: detail.userUid,
    courseUid: detail.courseUid,
  }

  return (
    <>
      {overlayVisible && (
        <LottieStatusOverlay
          status={invoice.paymentStatus as 'success' | 'failed'}
          targetRef={inlineLottieRef}
          onComplete={dismissOverlay}
        />
      )}

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
          <Link to={backHref ?? ROUTES.student.transactions}>
            <ArrowLeft className="size-4" aria-hidden data-icon="inline-start" />
            Kembali
          </Link>
        </Button>

        {/* Progress stepper */}
        <div className="mb-8">
          <PaymentStepper status={invoice.paymentStatus} />
        </div>

        {/* Status banner */}
        <StatusBanner invoice={invoice} lottieTargetRef={inlineLottieRef} />

        {/* Two-column layout: left = details, right = summary */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <BookingDetailsSection invoice={invoice} copiedKey={copiedKey} onCopy={handleCopy} />
            </div>

            {showQris && (
              <QrisSection qrUrl={invoice.qrUrl} payCode={invoice.payCode} copiedKey={copiedKey} onCopy={handleCopy} />
            )}

            {showPayCode && (
              <PayCodeSection payCode={invoice.payCode} copiedKey={copiedKey} onCopy={handleCopy} />
            )}

            {invoice.instructions.length > 0 && (
              <InstructionsSection instructions={invoice.instructions} />
            )}
          </div>

          {/* Right column - Price summary */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <PriceSummaryCard invoice={invoice} copiedKey={copiedKey} onCopy={handleCopy} downloadParams={downloadParams} />
          </div>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Not Found
// ---------------------------------------------------------------------------

export function TransactionPaymentNotFound({ backHref }: { backHref?: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="size-48">
        <SafeLottie src="/transaction-not-found.lottie" loop={false} />
      </div>
      <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900">
        Pembayaran tidak ditemukan
      </h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-600">
        Data pembayaran untuk referensi ini tidak tersedia. Kembali dan pilih transaksi lain.
      </p>
      <Button asChild size="sm" className="mt-6">
        <Link to={backHref ?? ROUTES.student.transactions}>
          <ArrowLeft className="size-4" aria-hidden data-icon="inline-start" />
          Kembali
        </Link>
      </Button>
    </div>
  )
}
