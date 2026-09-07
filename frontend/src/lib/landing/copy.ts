import { ROUTES } from '@/lib/routes'

export const LANDING_COPY = {
  hero: {
    eyebrow: 'Komunitas Open Source Udinus',
    titleA: 'Ngoding sendirian',
    titleB: 'itu sepi.',
    sub: 'Belajar bareng komunitas, dibimbing mentor praktisi, pulang bawa portofolio open source.',
    primaryCta: { label: 'Gabung Komunitas', href: ROUTES.register },
    secondaryCta: { label: 'Jelajahi Kursus', href: ROUTES.courses },
  },
  ticker: [
    'open source',
    'sprint',
    'code review',
    'mentoring',
    'portofolio',
    'komunitas udinus',
    'ngoding bareng',
  ],
  notes: [
    { title: 'Real OSS Projects', copy: 'Contribute to community repos' },
    { title: 'Industry Mentors', copy: 'Learn from practitioners' },
    { title: 'Sprints & Code Review', copy: 'Team-based building' },
    { title: 'Certificates', copy: 'Proof of your capstone' },
    { title: 'Udinus Community', copy: 'Find your crew' },
  ],
  stack: {
    eyebrow: 'Our Stack',
    title: 'Senjata yang kami pakai.',
    copy: 'Teknologi nyata yang menjalankan platform ini — yang kamu pelajari, yang kami pakai.',
  },
  mentors: {
    eyebrow: 'Our Mentors',
    title: 'Dibimbing yang sudah di lapangan.',
    copy: 'Mentor adalah praktisi dan kontributor open source yang aktif mengajar di kursus kami.',
  },
  course: {
    eyebrow: 'Course',
    title: 'Kursus yang pulangnya bawa portofolio.',
    copy: 'Materi inti yang dikembangkan bersama komunitas open source.',
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
    eyebrow: 'Gallery',
    title: 'Suasana belajar kami.',
    copy: 'Dokumentasi kegiatan, workshop, dan kumpul komunitas.',
    emptyTitle: 'Dokumentasi segera hadir.',
    emptyCopy: 'Foto kegiatan terbaru sedang dikurasi. Sementara itu, gabung dan rasakan langsung.',
  },
  testimonial: {
    eyebrow: 'Kata Mereka',
    title: 'Cerita dari komunitas.',
  },
  finalCta: {
    title: 'Siap berhenti ngoding sendirian?',
    copy: 'Gabung komunitas, ikuti sprint pertamamu, dan mulai bangun portofolio open source minggu ini juga.',
    primaryCta: { label: 'Gabung Sekarang', href: ROUTES.register },
    secondaryCta: { label: 'Lihat Kursus', href: ROUTES.courses },
  },
} as const
