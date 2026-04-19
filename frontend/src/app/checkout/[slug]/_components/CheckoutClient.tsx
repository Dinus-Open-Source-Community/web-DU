'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronLeft, Lock, Shield, Infinity as InfinityIcon, RotateCcw, Tag, Wallet, Landmark, CreditCard, QrCode } from 'lucide-react'
import GuestLayout from '@/components/layout/GuestLayout'
import { Button } from '@/components/ui/button'
import { LottieOverlay } from '@/components/ui/LottieOverlay'
import { formatRupiah } from '@/lib/func'
import { cn } from '@/lib/utils'

interface CheckoutCourse {
  uid: string
  title: string
  image: string
  price: number
  strikePrice?: number
  classType: 'Free' | 'Premium' | 'Event'
  instructorName: string
  instructorAvatar: string
}

interface PaymentOption {
  id: string
  label: string
  icon: React.ReactNode
}

interface PaymentGroup {
  id: string
  label: string
  icon: React.ReactNode
  options: PaymentOption[]
}

const PAYMENT_GROUPS: PaymentGroup[] = [
  {
    id: 'e-wallet',
    label: 'E-Wallet',
    icon: <Wallet className="size-4" />,
    options: [
      { id: 'gopay', label: 'GoPay', icon: <span className="text-[10px] font-bold text-emerald-600">GPay</span> },
      { id: 'ovo', label: 'OVO', icon: <span className="text-[10px] font-bold text-purple-600">OVO</span> },
      { id: 'dana', label: 'DANA', icon: <span className="text-[10px] font-bold text-sky-600">DANA</span> },
      { id: 'shopeepay', label: 'ShopeePay', icon: <span className="text-[10px] font-bold text-orange-600">SPay</span> },
      { id: 'linkaja', label: 'LinkAja', icon: <span className="text-[10px] font-bold text-rose-600">Link</span> },
    ],
  },
  {
    id: 'bank-transfer',
    label: 'Transfer Bank',
    icon: <Landmark className="size-4" />,
    options: [
      { id: 'bca', label: 'Bank BCA', icon: <span className="text-[10px] font-bold text-blue-700">BCA</span> },
      { id: 'bni', label: 'Bank BNI', icon: <span className="text-[10px] font-bold text-orange-700">BNI</span> },
      { id: 'mandiri', label: 'Bank Mandiri', icon: <span className="text-[10px] font-bold text-blue-900">MDR</span> },
      { id: 'bri', label: 'Bank BRI', icon: <span className="text-[10px] font-bold text-blue-600">BRI</span> },
    ],
  },
  {
    id: 'virtual-account',
    label: 'Virtual Account',
    icon: <CreditCard className="size-4" />,
    options: [
      { id: 'va-bca', label: 'BCA Virtual Account', icon: <span className="text-[10px] font-bold text-blue-700">BCA</span> },
      { id: 'va-bni', label: 'BNI Virtual Account', icon: <span className="text-[10px] font-bold text-orange-700">BNI</span> },
      { id: 'va-mandiri', label: 'Mandiri Virtual Account', icon: <span className="text-[10px] font-bold text-blue-900">MDR</span> },
      { id: 'va-permata', label: 'Permata Virtual Account', icon: <span className="text-[10px] font-bold text-teal-700">PMT</span> },
    ],
  },
  {
    id: 'qris',
    label: 'QRIS',
    icon: <QrCode className="size-4" />,
    options: [
      { id: 'qris', label: 'Scan QRIS', icon: <QrCode className="size-4 text-primary" /> },
    ],
  },
]

const TRUST_BADGES = [
  { icon: <Lock className="size-4" />, label: 'Pembayaran aman & terenkripsi' },
  { icon: <InfinityIcon className="size-4" />, label: 'Akses seumur hidup' },
  { icon: <RotateCcw className="size-4" />, label: 'Garansi 7 hari uang kembali' },
]

function PaymentMethodGroup({
  group,
  selectedMethod,
  onSelect,
}: {
  group: PaymentGroup
  selectedMethod: string | null
  onSelect: (id: string) => void
}) {
  const hasSelection = group.options.some((o) => o.id === selectedMethod)
  const [expanded, setExpanded] = useState(hasSelection)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-slate-50/60"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {group.icon}
          </span>
          <span className="text-sm font-semibold text-slate-800">{group.label}</span>
          {hasSelection && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Dipilih</span>
          )}
        </span>
        <ChevronDown className={cn('size-4 text-slate-400 transition-transform duration-200', expanded && 'rotate-180')} />
      </button>

      <div className={cn('grid transition-[grid-template-rows] duration-200 ease-out', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2 border-t border-slate-100 px-4 pb-4 pt-3">
            {group.options.map((option) => {
              const isActive = selectedMethod === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelect(option.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150',
                    isActive
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  )}
                >
                  <span className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg border',
                    isActive ? 'border-primary/20 bg-primary/10' : 'border-slate-200 bg-slate-50'
                  )}>
                    {option.icon}
                  </span>
                  <span className={cn('text-sm font-medium', isActive ? 'text-primary' : 'text-slate-700')}>
                    {option.label}
                  </span>
                  <span className="ml-auto">
                    <span className={cn(
                      'flex size-5 items-center justify-center rounded-full border-2 transition-colors',
                      isActive ? 'border-primary bg-primary' : 'border-slate-300'
                    )}>
                      {isActive && <span className="size-2 rounded-full bg-white" />}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CheckoutClient({ course }: { course: CheckoutCourse }) {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const discount = couponApplied ? Math.round(course.price * 0.1) : 0
  const total = course.price - discount

  const handleApplyCoupon = () => {
    if (couponCode.trim()) setCouponApplied(true)
  }

  const handlePay = () => {
    if (!selectedMethod) return
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      router.push(`/checkout/invoice/txn-hist-001`)
    }, 2500)
  }

  return (
    <GuestLayout>
      <LottieOverlay visible={isProcessing} message="Memproses pembayaran..." />
      <main className="min-h-screen bg-[#f5f5f5]">
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0a84dc_0%,#075e9c_100%)] text-white">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-5 py-5 md:px-8">
            <Link href={`/course`} className="flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white">
              <ChevronLeft className="size-4" />
              Kembali
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-sm font-semibold text-white">Checkout</span>
          </div>
        </section>

        <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="mb-1 text-lg font-bold tracking-tight text-slate-900">Metode Pembayaran</h2>
                <p className="text-sm text-slate-500">Pilih metode pembayaran yang Anda inginkan.</p>
              </div>

              <div className="flex flex-col gap-3">
                {PAYMENT_GROUPS.map((group) => (
                  <PaymentMethodGroup
                    key={group.id}
                    group={group}
                    selectedMethod={selectedMethod}
                    onSelect={setSelectedMethod}
                  />
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Tag className="size-4 text-primary" />
                  Kode Promo
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value)
                      if (couponApplied) setCouponApplied(false)
                    }}
                    placeholder="Masukkan kode promo"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    variant="outline"
                    className="h-auto rounded-xl border-slate-200 px-5 text-sm font-semibold"
                    disabled={!couponCode.trim()}
                  >
                    Terapkan
                  </Button>
                </div>
                {couponApplied && (
                  <p className="mt-2 text-xs font-medium text-emerald-600">Kupon berhasil diterapkan! Diskon 10%.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="relative h-40 w-full">
                  <Image src={course.image} alt={course.title} fill className="object-cover" sizes="380px" />
                  <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 backdrop-blur-sm">
                    {course.classType}
                  </span>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <h3 className="text-sm font-bold leading-snug text-slate-900">{course.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative size-6 overflow-hidden rounded-full bg-slate-100">
                      {course.instructorAvatar && (
                        <Image src={course.instructorAvatar} alt="" fill className="object-cover" sizes="24px" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-500">{course.instructorName}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold text-slate-900">Ringkasan Pesanan</h3>
                <div className="text-[13px]">
                  <div className="flex items-center justify-between border-b border-slate-100 py-2.5">
                    <span className="font-medium text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(course.price)}</span>
                  </div>
                  {course.strikePrice && (
                    <div className="flex items-center justify-between border-b border-slate-100 py-2.5">
                      <span className="font-medium text-slate-500">Harga Awal</span>
                      <span className="font-medium text-slate-400 line-through">{formatRupiah(course.strikePrice)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-b border-slate-100 py-2.5">
                    <span className="font-medium text-slate-500">Diskon Kupon</span>
                    <span className={cn('font-semibold', discount > 0 ? 'text-emerald-600' : 'text-slate-400')}>
                      {discount > 0 ? `- ${formatRupiah(discount)}` : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3.5">
                    <span className="text-sm font-bold text-slate-900">Total</span>
                    <span className="text-lg font-bold tracking-tight text-primary">{formatRupiah(total)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePay}
                disabled={!selectedMethod}
                className="h-12 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
              >
                {selectedMethod ? 'Bayar Sekarang' : 'Pilih Metode Pembayaran'}
              </Button>

              <div className="flex flex-col gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3.5">
                {TRUST_BADGES.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
                    <span className="text-primary/60">{badge.icon}</span>
                    {badge.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </GuestLayout>
  )
}
