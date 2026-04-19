import type { PaymentStatus, PaymentMethodKey, PaymentInstructionSet, PaymentStepConfig } from '@/lib/types'

export const getPaymentStepsConfig = (status: PaymentStatus, formattedDate: string): PaymentStepConfig[] => {
  if (status === 'PAID') {
    return [
      { label: 'Invoice Dibuat', subtitle: formattedDate },
      { label: 'Pembayaran Diterima', subtitle: 'Terverifikasi' },
      { label: 'Akses Dibuka', subtitle: 'Kelas aktif' },
    ]
  }
  if (status === 'FAILED') {
    return [
      { label: 'Invoice Dibuat', subtitle: formattedDate },
      { label: 'Gagal', subtitle: 'Pembayaran ditolak' },
      { label: 'Akses Ditutup', subtitle: 'Hubungi support' },
    ]
  }
  return [
    { label: 'Invoice Dibuat', subtitle: formattedDate },
    { label: 'Pending', subtitle: 'Menunggu konfirmasi' },
    { label: 'Akses Dibuka', subtitle: 'Estimasi 5-10 menit' },
  ]
}

export const getPaymentActiveStep = (status: PaymentStatus): number => {
  if (status === 'PAID') return 3
  if (status === 'FAILED') return 3
  return 2
}

export const getPaymentInstructions = (method: PaymentMethodKey): PaymentInstructionSet => {
  switch (method) {
    case 'QRIS':
      return {
        iconKey: 'qr-code',
        title: 'Cara Pembayaran via QRIS',
        steps: [
          'Unduh atau screenshot kode QR yang tertera pada halaman invoice.',
          'Buka aplikasi E-Wallet atau Mobile Banking yang mendukung QRIS (GoPay, OVO, DANA, ShopeePay, dll).',
          'Pilih menu "Scan" atau "Bayar", lalu tap ikon galeri/upload gambar.',
          'Pilih gambar QR Code yang telah kamu simpan di galeri.',
          'Periksa kembali nominal pembayaran yang muncul, pastikan sesuai.',
          'Konfirmasi dan selesaikan pembayaran.',
        ],
      }
    case 'E-Wallet':
      return {
        iconKey: 'wallet',
        title: 'Cara Pembayaran via E-Wallet',
        steps: [
          'Buka aplikasi E-Wallet yang kamu gunakan (GoPay, OVO, DANA, ShopeePay, dll).',
          'Pilih menu "Bayar" atau "Transfer" pada halaman utama.',
          'Masukkan nomor virtual account atau kode pembayaran yang tertera pada invoice.',
          'Periksa kembali detail transaksi dan nominal yang muncul.',
          'Masukkan PIN keamanan untuk konfirmasi.',
          'Pembayaran berhasil, simpan bukti transaksi sebagai referensi.',
        ],
      }
    case 'Bank Transfer':
      return {
        iconKey: 'landmark',
        title: 'Cara Pembayaran via Bank Transfer',
        steps: [
          'Login ke aplikasi Mobile Banking atau Internet Banking bank kamu.',
          'Pilih menu "Transfer" lalu pilih "Transfer ke Bank Lain" jika berbeda bank.',
          'Masukkan nomor rekening tujuan yang tertera pada halaman invoice.',
          'Masukkan nominal pembayaran sesuai total tagihan (pastikan hingga digit terakhir).',
          'Periksa kembali semua detail, lalu konfirmasi transfer.',
          'Simpan bukti transfer sebagai referensi. Verifikasi otomatis membutuhkan waktu 1-5 menit.',
        ],
      }
    case 'Virtual Account':
      return {
        iconKey: 'credit-card',
        title: 'Cara Pembayaran via Virtual Account',
        steps: [
          'Login ke aplikasi Mobile Banking, Internet Banking, atau kunjungi ATM bank terkait.',
          'Pilih menu "Bayar" atau "Transfer ke Virtual Account".',
          'Masukkan nomor Virtual Account yang tertera pada halaman invoice.',
          'Nominal pembayaran akan muncul secara otomatis. Pastikan sudah sesuai.',
          'Konfirmasi pembayaran dan masukkan PIN atau password.',
          'Pembayaran berhasil diproses. Verifikasi biasanya instant atau membutuhkan waktu maksimal 5 menit.',
        ],
      }
  }
}
