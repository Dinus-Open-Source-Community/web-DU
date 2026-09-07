import { ROUTES } from '@/lib/routes'

export const LANDING_COPY = {
  hero: {
    eyebrow: 'Komunitas Open Source Udinus',
    titleA: 'Ngoding sendirian',
    titleB: 'itu sepi.',
    sub: 'Belajar bareng komunitas, dibimbing mentor praktisi, pulang bawa portofolio open source.',
    primaryCta: { label: 'Gabung Komunitas', href: ROUTES.register },
    secondaryCta: { label: 'Jelajahi Kursus', href: ROUTES.courses },
    scrollTease: 'di bawah ada terminal, cerita, dan galeri — scroll pelan',
  },
  /** Frasa khas DOSCOM di pita berjalan — bukan kata kunci SEO, bukan duplikat copy section. */
  ticker: [
    'PR pertama di-merge',
    'sesi mentoring tiap pekan',
    'sprint dua minggu sekali',
    'dari nol sampai kontribusi',
    'kode di-review, bukan dinilai',
    'yang takut nanya justru rugi',
    'belajar sambil bikin proyek beneran',
  ],
  notes: [
    { title: 'Proyek OSS asli', copy: 'Kontribusi ke repo komunitas beneran.' },
    { title: 'Mentor praktisi', copy: 'Belajar dari yang tiap hari di lapangan.' },
    { title: 'Sprint & code review', copy: 'Kode kamu dibaca, bukan cuma dinilai.' },
    { title: 'Sertifikat capstone', copy: 'Bukti nyata di akhir program.' },
    { title: 'Komunitas Udinus', copy: 'Temukan kru ngodingmu.' },
  ],
  stack: {
    eyebrow: 'Tumpukan Kami',
    title: 'Senjata yang kami pakai.',
    copy: 'Teknologi nyata yang menjalankan platform ini — yang kamu pelajari, yang kami pakai.',
  },
  mentors: {
    eyebrow: 'Para Mentor',
    title: 'Dipegang langsung orang lapangan.',
    copy: 'Praktisi yang mengajar di kursus, bukan sekadar namanya di brosur.',
  },
  course: {
    eyebrow: 'Kursus Unggulan',
    title: 'Pulangnya bawa portofolio.',
    copy: 'Tiga jalur yang dikembangkan bareng komunitas — mulai dari yang paling dasar.',
    allHref: ROUTES.courses,
    allLabel: 'Lihat semua kursus',
  },
  terminal: {
    eyebrow: 'Terminal',
    title: 'Cobain ngetik dulu.',
    copy: 'Klik perintahnya atau ketik sendiri. Tidak ada yang bisa rusak di sini.',
  },
  story: {
    eyebrow: 'Cerita Interaktif',
    title: 'Hari pertamamu di DOSCOM.',
    copy: 'Pilih jalanmu. Tidak ada jawaban salah — semua berujung pada hal nyata.',
  },
  howItWorks: {
    eyebrow: 'Cara Kerja',
    title: 'Dari gabung sampai portofolio.',
    copy: 'Tiga langkah. Tanpa ribet.',
    steps: [
      { no: '01', title: 'Gabung & daftar', copy: 'Buat akun, pilih kursus atau langsung nimbrung ke komunitas.' },
      { no: '02', title: 'Sprint bareng mentor', copy: 'Belajar lewat sprint tim, code review, dan proyek nyata.' },
      { no: '03', title: 'Kontribusi & portofolio', copy: 'Kontribusimu ke repo open source jadi bukti skill.' },
    ],
  },
  gallery: {
    eyebrow: 'Galeri Kegiatan',
    title: 'Suasana belajar kami.',
    copy: 'Dokumentasi kegiatan, workshop, dan kumpul komunitas.',
  },
  testimonial: {
    eyebrow: 'Kata Mereka',
    title: 'Dulu peserta, sekarang ngajar.',
    copy: 'Tiga mentor ini dulu mulai dari titik yang sama dengan kamu.',
  },
  finalCta: {
    title: 'Siap berhenti ngoding sendirian?',
    copy: 'Gabung komunitas, ikuti sprint pertamamu, dan mulai bangun portofolio open source minggu ini juga.',
    primaryCta: { label: 'Gabung Sekarang', href: ROUTES.register },
    secondaryCta: { label: 'Lihat Kursus', href: ROUTES.courses },
  },
} as const
