export type Testimonial = {
  quote: string
  name: string
  role: string
  /** Foto orang yang bersangkutan — dipakai 1:1 di kartu kutipan. */
  photo: string
}

/**
 * Testimoni mentor DOSCOM — nama sama dengan roster mentor supaya konsisten.
 * Kutipan ditulis wajar: pengalaman belajar, komunitas, dan open source.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Dulu saya juga mulai dari nol dan malu nanya. Yang bikin beda di DOSCOM: setiap PR di-review dengan sabar, jadi saya belajar dari kesalahan yang sama hanya sekali.',
    name: 'jar',
    role: 'Mentor Web Development',
    photo: '/images/_BW08644.JPG',
  },
  {
    quote:
      'Waktu masih peserta, sprint pertama saya berantakan — deadline molor, model nggak jalan. Dari situ justru saya belajar kalau error itu bagian dari proses, bukan tanda buat berhenti.',
    name: 'zapp',
    role: 'Mentor Machine Learning',
    photo: '/images/_BW08702.JPG',
  },
  {
    quote:
      'Kontribusi pertama saya cuma benerin typo di dokumentasi. Kecil, tapi di-merge. Enam bulan kemudian saya maintainer. DOSCOM mengajarkan: mulai saja, sisanya nyusul.',
    name: 'naf',
    role: 'Mentor Open Source',
    photo: '/images/_BW08640.JPG',
  },
]
