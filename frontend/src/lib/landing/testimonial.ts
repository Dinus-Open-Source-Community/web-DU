export type Testimonial = {
  quote: string
  name: string
  role: string
  /** Foto orang yang bersangkutan — dipakai 1:1 di kartu kutipan. */
  photo: string
}

/**
 * Review siswa DOSCOM — bukan kutipan mentor. Bahasa wajar ala anak kelas:
 * nggak kaku, nggak teknis banget. Nama & foto: zapp, rico.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Awalnya takut banget ikut karena nol banget. Tapi mentornya sabar, dari install sampai bikin halaman pertama dibimbing pelan-pelan. Sekarang aku udah bisa bikin web sendiri buat tugas kuliah, rasanya kaya dapet skill rahasia.',
    name: 'zapp',
    role: 'Peserta Web (Next.js)',
    photo: '/images/zapp.webp',
  },
  {
    quote:
      'Yang paling berkesan bukan cuma belajarnya, tapi temen-temennya. Deadline bareng, error bareng, terus lega bareng kalau udah jalan. Belajar di sini tuh nggak kerasa kayak sekolah — lebih kayak ikut proyek beneran.',
    name: 'rico',
    role: 'Peserta Web (Laravel)',
    photo: '/images/rico.webp',
  },
]
