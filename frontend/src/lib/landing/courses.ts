export type StaticCourseAccent = 'yellow' | 'mint' | 'peach' | 'pink' | 'sky' | 'lavender'

export type StaticCourseIconKey = 'fundamental' | 'practice' | 'advanced' | 'capstone'

export type StaticCourse = {
  title: string
  desc: string
  level: 'Pemula' | 'Menengah' | 'Lanjutan' | 'Semua Level'
  accent: StaticCourseAccent
  icon: StaticCourseIconKey
}

/**
 * Tahapan jenjang program pembelajaran DOSCOM University.
 * Didesain universal & fleksibel tanpa mengikat nama kursus tertentu.
 */
export const LANDING_COURSES: StaticCourse[] = [
  {
    title: 'Fondasi & Konsep Dasar',
    desc: 'Bangun pemahaman awal dari nol — pelajari alur kerja, metodologi inti, dan konsep esensial secara terarah.',
    level: 'Pemula',
    accent: 'mint',
    icon: 'fundamental',
  },
  {
    title: 'Praktik & Studi Kasus Terarah',
    desc: 'Latihan intensif berbasis pemecahan masalah nyata, tugas berkala, dan penerapan teori ke dalam karya aplikatif.',
    level: 'Menengah',
    accent: 'yellow',
    icon: 'practice',
  },
  {
    title: 'Pendalaman Mahir & Standar Industri',
    desc: 'Eksplorasi teknik lanjutan, pemahaman sistem menyeluruh, dan penyempurnaan karya agar siap masuk standar profesional.',
    level: 'Lanjutan',
    accent: 'peach',
    icon: 'advanced',
  },
  {
    title: 'Proyek Capstone & Portofolio Akhir',
    desc: 'Wujudkan karya mandiri yang utuh di bawah bimbingan berkala dari mentor praktisi hingga siap dipublikasikan.',
    level: 'Semua Level',
    accent: 'sky',
    icon: 'capstone',
  },
]
