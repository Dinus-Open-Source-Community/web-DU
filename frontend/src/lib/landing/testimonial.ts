export type Testimonial = {
  quote: string
  name: string
  role: string
  /** Foto orang yang bersangkutan — dipakai 1:1 di kartu kutipan. */
  photo: string
}

/**
 * Testimoni mentor DOSCOM — nama sama dengan roster mentor supaya konsisten
 * (alfi/nafan/jariz). Kutipan ditulis wajar: pengalaman belajar, komunitas,
 * dan open source.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Aku mulai dari nol dan malu nanya. Yang bikin beda di DOSCOM: tiap PR di-review dengan sabar, jadi aku belajar dari kesalahan yang sama hanya sekali.',
    name: 'alfi',
    role: 'Next.js Developer',
    photo: '/images/alfi.webp',
  },
  {
    quote:
      'Sprint pertamaku berantakan — deadline molor, kode nggak jalan. Dari situ justru aku belajar: error itu bagian dari proses, bukan tanda buat berhenti.',
    name: 'nafan',
    role: 'Laravel Developer',
    photo: '/images/nafan.webp',
  },
  {
    quote:
      'Kontribusi pertamaku cuma benerin typo di dokumentasi. Kecil, tapi di-merge. Enam bulan kemudian aku maintainer. DOSCOM ngajarin: mulai aja, sisanya nyusul.',
    name: 'jariz',
    role: 'Next.js Developer',
    photo: '/images/jariz.webp',
  },
]
