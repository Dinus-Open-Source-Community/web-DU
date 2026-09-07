export type StaticCourseAccent = 'yellow' | 'mint' | 'peach' | 'pink' | 'sky' | 'lavender'

export type StaticCourse = {
  title: string
  desc: string
  level: 'Pemula' | 'Menengah' | 'Semua level'
  accent: StaticCourseAccent
}

/** LAUNCH GATE: ganti 3 sampel dengan kursus unggulan asli (judul + deskripsi + level). */
export const LANDING_COURSES: StaticCourse[] = [
  {
    title: 'Web Development Fundamental',
    desc: 'HTML, CSS, JavaScript sampai React — sambil bangun proyek repo komunitas.',
    level: 'Pemula',
    accent: 'yellow',
  },
  {
    title: 'Machine Learning Dasar',
    desc: 'Python, data, dan model pertama yang benar-benar jalan.',
    level: 'Pemula',
    accent: 'mint',
  },
  {
    title: 'Kontribusi Open Source Pertama',
    desc: 'Git, pull request, dan code review sampai PR-nya di-merge.',
    level: 'Semua level',
    accent: 'sky',
  },
]
