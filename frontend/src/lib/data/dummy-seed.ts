/**
 * Data dummy Doscom University — bahasa Indonesia, koheren antar-fitur (kursus, mentor, siswa admin, grafik).
 * Tidak digunakan untuk backend nyata (lihat juga `repository.ts`).
 */

import type { IQuiz, ILesson, IModule, ICardData } from '@/lib/types/course'
import type {
  AdminAdministrator,
  AdminCategoryItem,
  AdminKpi,
  AdminMentor,
  AdminQaReply,
  AdminQaThread,
  AdminReview,
  AdminStudent,
  AdminTicket,
  AdminTransaction,
} from '@/lib/types/admin'
import type {
  ChartDataPoint,
  ChartRatioPoint,
  TransactionTimelinePoint,
} from '@/lib/types/analytics'
import type {
  ICertificate,
  IDashboardStat,
  IDeadlineItem,
  IFeedbackItem,
  IResumeCourse,
  IScheduleItem,
  IMentorStats,
  StudentEnrolledCourse,
  TransactionHistoryItem,
} from '@/lib/types'
import type { IMentorCourseAssignment, IMentorAssignmentSubmission, SubmissionContentBlock } from '@/lib/types'

/** Profil ringkas untuk seed dummy & `getUserById`. */
export type SeedUser = {
  id: string
  nama: string
  email: string
  avatar?: string
  role: 'student' | 'mentor' | 'admin'
}

/** Slug checkout — URL `/checkout/[slug]`. */
export const COURSE_UID_TO_SLUG: Record<string, string> = {
  'crs-001': 'pemrograman-web-modern',
  'crs-002': 'fundamental-linux-server',
  'crs-003': 'uiux-praktis-figma',
  'crs-004': 'python-analitik-data',
  'crs-005': 'cyber-security-dasar',
  'crs-006': 'bootcamp-fullstack-javascript',
}

const AV = (seed: string) => `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`
const COVER = (seed: string) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/500`

export const SEED_USERS: SeedUser[] = [
  { id: 'stu-001', nama: 'Dewi Lestari', email: 'dewi@student.dummy', role: 'student', avatar: AV('stu-001') },
  { id: 'stu-002', nama: 'Raka Nugraha', email: 'raka@student.dummy', role: 'student', avatar: AV('stu-002') },
  { id: 'mnt-arya', nama: 'Arya Wijaya', email: 'arya@mentor.dummy', role: 'mentor', avatar: AV('mnt-arya') },
  { id: 'mnt-budi', nama: 'Budi Hartono', email: 'budi@mentor.dummy', role: 'mentor', avatar: AV('mnt-budi') },
  { id: 'mnt-citra', nama: 'Citra Anggraini', email: 'citra@mentor.dummy', role: 'mentor', avatar: AV('mnt-citra') },
  { id: 'adm-wulan', nama: 'Wulan Safitri', email: 'wulan@admin.dummy', role: 'admin', avatar: AV('adm-wulan') },
]

const sampleQuizIntro: IQuiz = {
  passingScore: 70,
  questions: [
    {
      id: 'q1',
      prompt: 'Protokol standar untuk request halaman web adalah?',
      options: [
        { id: 'o1', label: 'HTTP / HTTPS' },
        { id: 'o2', label: 'FTP' },
        { id: 'o3', label: 'SMTP' },
      ],
      correctOptionId: 'o1',
    },
    {
      id: 'q2',
      prompt: 'Port default HTTPS adalah?',
      options: [
        { id: 'p1', label: '80' },
        { id: 'p2', label: '443' },
      ],
      correctOptionId: 'p2',
    },
  ],
}

function lesTiptap(id: string, title: string, order: number, minutes: number, html: string): ILesson {
  return {
    id,
    title,
    order,
    durationMinutes: minutes,
    hasHomework: false,
    contentType: 'tiptap',
    contentHtml: html,
  }
}

function lesVideo(id: string, title: string, order: number, minutes: number, url: string): ILesson {
  return {
    id,
    title,
    order,
    durationMinutes: minutes,
    contentType: 'video',
    videoUrl: url,
    contentHtml: '<p>Ikuti video kemudian kerjakan refleksi singkat.</p>',
  }
}

function lesQuiz(id: string, title: string, order: number, minutes: number, quiz: IQuiz): ILesson {
  return {
    id,
    title,
    order,
    durationMinutes: minutes,
    contentType: 'quiz',
    quiz,
  }
}

function mod(id: string, title: string, order: number, lessons: ILesson[]): IModule {
  return { id, title, order, lessons }
}

const CREATED_AT = '2025-06-01T08:00:00.000Z'
const UPDATED_AT = '2025-09-01T09:30:00.000Z'

const MOD_WEB: IModule[] = [
  mod('m-web-1', 'Perkenalan stack modern', 1, [
    lesTiptap(
      'l-w1',
      'Arsitektur web & HTTP',
      1,
      22,
      '<h2>Dasar request–response</h2><p>Browser sebagai <em>client</em> mengirim permintaan; server menjawab dengan HTML, JSON, atau aset lain. Memahami URL, method, dan status code membantu debug sehari-hari.</p><ul><li>DNS &amp; hosting ringkas</li><li>HTTPS vs HTTP</li></ul>',
    ),
    lesVideo(
      'l-w2',
      'DevTools & inspecting network',
      2,
      18,
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    ),
    lesTiptap(
      'l-w2b',
      'HTML semantik & aksesibilitas singkat',
      3,
      20,
      '<p>Struktur dokumen dengan <code>&lt;main&gt;</code>, <code>&lt;nav&gt;</code>, landmarks, dan teks alternatif untuk gambar agar aplikasi lebih ramah pembaca layar.</p>',
    ),
  ]),
  mod('m-web-2', 'React fundamentals', 2, [
    lesTiptap(
      'l-w3',
      'Komponen & JSX',
      1,
      35,
      '<h2>Komposisi UI</h2><p>Tulis komponen kecil yang menerima <strong>props</strong>; naikkan state ke parent bila beberapa anak harus sinkron.</p><pre><code>function Halo(props: Props) {\n return &lt;p&gt;Halo {props.nama}&lt;/p&gt;\n}</code></pre>',
    ),
    lesQuiz('l-w4', 'Quiz React mini', 2, 20, sampleQuizIntro),
    lesTiptap(
      'l-w4b',
      'Lists, keys & conditional render',
      3,
      24,
      '<p>Gunakan <code>key</code> stabil pada list; hindari indeks sebagai key untuk data yang bisa diurutkan ulang.</p>',
    ),
  ]),
  mod('m-web-3', 'State & data fetching', 3, [
    lesTiptap(
      'l-w5',
      'useState & useEffect',
      1,
      28,
      '<p>Efek samping seperti fetch data simpan dalam <code>useEffect</code>; bersihkan subscription saat unmount.</p>',
    ),
    lesTiptap(
      'l-w6',
      'Fetch REST & penanganan error',
      2,
      30,
      '<p>Pola async/await, status non-2xx, dan pesan kesalahan yang ramah pengguna.</p>',
    ),
    lesVideo('l-w7', 'Demo integrasi endpoint publik', 3, 22, 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'),
  ]),
]

const MOD_LINUX: IModule[] = [
  mod('m-lx-1', 'Dasar sistem operasi Linux', 1, [
    lesTiptap(
      'l-l1',
      'Shell & hak akses',
      1,
      28,
      '<h2>Terminal</h2><p>Bash, cwd, serta <code>chmod</code> / <code>chown</code> untuk pola permission <code>rwx</code>.</p>',
    ),
    lesTiptap('l-l2', 'Package manager', 2, 25, '<p>APT: update, upgrade, instal paket; beda antara dependensi sistem dan user-space.</p>'),
    lesQuiz('l-l3', 'Quiz shell & permission', 3, 16, sampleQuizIntro),
  ]),
  mod('m-lx-2', 'Process & systemd ringan', 2, [
    lesTiptap('l-l4', 'Process, signal, exit code', 1, 26, '<p><code>ps</code>, <code>kill</code>, nohup, dan pentingnya exit code di skrip CI.</p>'),
    lesTiptap('l-l5', 'Service unit sederhana', 2, 32, '<p>Kenalan systemd: enable, start, journalctl untuk membaca log.</p>'),
  ]),
]

const MOD_UI: IModule[] = [
  mod('m-ui-1', 'Proses desain UX', 1, [
    lesTiptap('l-u1', 'User flow & wireframe', 1, 30, '<p>Empathize → define → ideate → prototype; validasi cepat dengan 3–5 pengguna sasaran.</p>'),
    lesTiptap('l-u2', 'Auto layout di Figma', 2, 24, '<p>Constraints, spacer, variant komponen, dan dokumentasi spacing untuk engineer.</p>'),
    lesVideo(
      'l-u3',
      'Walkthrough prototyping',
      3,
      20,
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    ),
  ]),
  mod('m-ui-2', 'Design system & hand-off', 2, [
    lesTiptap(
      'l-u4',
      'Warna & tipeografi',
      1,
      28,
      '<p>Skala rasio modular, hierarki judul dan isi body, serta kontras aksesibilitas WCAG tingkat AA.</p>',
    ),
    lesQuiz('l-u5', 'Quiz komponen & token', 2, 18, sampleQuizIntro),
  ]),
]

const MOD_PY: IModule[] = [
  mod('m-py-1', 'Python & data', 1, [
    lesTiptap(
      'l-p1',
      'NumPy & struktur array',
      1,
      32,
      '<p>Array Nd, broadcasting, slice; hindari loop Python untuk operasi besar — gunakan vektorisasi.</p>',
    ),
    lesQuiz('l-p2', 'Quiz statistik dasar', 2, 15, sampleQuizIntro),
    lesTiptap('l-p3', 'Pandas: Series & DataFrame', 3, 28, '<p>Import CSV, seleksi kolom, filter, serta group-by sederhana.</p>'),
  ]),
  mod('m-py-2', 'Visualisasi', 2, [
    lesTiptap('l-p4', 'Plot trend dengan matplotlib', 1, 26, '<p>Line chart, labeling sumbu, anotasi outlier pada data retail dummy.</p>'),
    lesVideo(
      'l-p5',
      'Studi kasus dashboard mini',
      2,
      24,
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    ),
  ]),
]

const MOD_SEC: IModule[] = [
  mod('m-sec-1', 'Kerangka defensive', 1, [
    lesTiptap(
      'l-s1',
      'CIA triad & threat model',
      1,
      26,
      '<p>STRIDE ringkas untuk fitur pembayaran/profile; aset, ancaman, mitigasi pertama.</p>',
    ),
    lesTiptap('l-s2', 'XSS & sanitasi konten', 2, 30, '<p>Escape output, CSP dasar, beda antara HTML dibolehkan vs plaintext.</p>'),
    lesQuiz('l-s3', 'Quiz XSS/CSRF', 3, 20, sampleQuizIntro),
  ]),
  mod('m-sec-2', 'Praktik untuk developer', 2, [
    lesTiptap('l-s4', 'Secrets & dependency', 1, 34, '<p>Jangan commit .env; rotasi token; CVE dan patch cadence.</p>'),
    lesVideo('l-s5', 'Review kerentaan contoh', 2, 22, 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'),
  ]),
]

const MOD_BOOTCAMP: IModule[] = [
  mod('m-bc-1', 'Roadmap intensif', 1, [
    lesTiptap('l-b1', 'Git workflow tim', 1, 35, '<p>Trunk-based vs GitFlow ringan; konvensi pesan commit; proteksi branch utama.</p>'),
    lesTiptap('l-b2', 'Deploy pertama', 2, 40, '<p>Build, env staging/production, rollback, health check.</p>'),
    lesQuiz('l-b3', 'Quiz DevOps mini', 3, 18, sampleQuizIntro),
  ]),
  mod('m-bc-2', 'Node & API', 2, [
    lesTiptap('l-b4', 'REST handler & validasi skema', 1, 38, '<p>Request schema, error shape konsisten, rate limit konsep.</p>'),
    lesTiptap('l-b5', 'Auth session vs JWT', 2, 32, '<p>Trade-off cookie httpOnly, refresh, dan penyimpanan token di klien.</p>'),
  ]),
  mod('m-bc-3', 'Capstone plan', 3, [
    lesTiptap('l-b6', 'Spesifikasi fitur & rubrik', 1, 25, '<p>User story, definisi siap-rilis, serta kriteria penilaian capstone bootcamp.</p>'),
  ]),
]

/** Katalog kursus (ICardData lengkap untuk detail & kartu). */
export const SEED_ICARD_COURSES: ICardData[] = [
  {
    uid: 'crs-001',
    variantBadge: 'premium',
    title: 'Pemrograman Web Modern dengan React',
    subtitle: 'Dari JSX hingga pola fetch API — bangun SPA yang mudah dipelihara.',
    description: 'Kuasai React, pola komponen, dan integrasi REST — siap bersaing sebagai web developer dengan portofolio proyek.',
    whatYouLearn: [
      'Membuat antarmuka dengan komponen React dan JSX',
      'Mengatur state serta efek samping dengan hooks',
      'Mengintegrasikan API REST dengan penanganan error yang jelas',
      'Menyusun struktur modul materi seperti di lingkungan produksi',
    ],
    categoryId: 'cat-web',
    category: 'Pengembangan Web',
    author: { name: 'Arya Wijaya', avatar: AV('mnt-arya') },
    rating: 4.9,
    totalReviews: 128,
    image: COVER('du-web'),
    price: 499_000,
    strikePrice: 799_000,
    status: 'published',
    mentorUid: 'mnt-arya',
    enrolled: 142,
    modules: MOD_WEB,
    duration: '6 minggu',
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  },
  {
    uid: 'crs-002',
    variantBadge: 'free',
    title: 'Fundamental Linux & Server Pemula',
    subtitle: 'Nyaman di CLI, systemd, dan manajemen paket VPS.',
    description: 'Perintah penting Bash, hak akses, dan administrasi VPS ringan untuk kebutuhan devops tingkat pemula.',
    whatYouLearn: [
      'Navigasi sistem file dan permission Linux',
      'Menggunakan package manager APT',
      'Mengelola proses layanan dengan systemd tingkat pemula',
    ],
    categoryId: 'cat-web',
    category: 'Pengembangan Web',
    author: { name: 'Arya Wijaya', avatar: AV('mnt-arya') },
    rating: 4.7,
    totalReviews: 86,
    image: COVER('du-linux'),
    price: 0,
    status: 'published',
    mentorUid: 'mnt-arya',
    enrolled: 310,
    modules: MOD_LINUX,
    duration: '4 minggu',
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  },
  {
    uid: 'crs-003',
    variantBadge: 'premium',
    title: 'UI/UX Praktis dengan Figma',
    subtitle: 'User flow sampai sistem desain untuk hand-off ke developer.',
    description: 'Sistem warna, tipografi komponen, dan hand-off ke pengembangan.',
    whatYouLearn: [
      'Memetakan user flow dan wireframe cepat',
      'Membangun komponen Figma dengan auto layout',
      'Menyusun token warna dan tipografi skala konsisten',
    ],
    categoryId: 'cat-design',
    category: 'Desain UI/UX',
    author: { name: 'Budi Hartono', avatar: AV('mnt-budi') },
    rating: 4.8,
    totalReviews: 94,
    image: COVER('du-figma'),
    price: 349_000,
    status: 'published',
    mentorUid: 'mnt-budi',
    enrolled: 88,
    modules: MOD_UI,
    duration: '5 minggu',
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  },
  {
    uid: 'crs-004',
    variantBadge: 'event',
    title: 'Python untuk Analitik Data — Batch Khusus',
    subtitle: 'NumPy/Pandas hingga insight visual untuk studi kasus.',
    description: 'Workshop terbatas dengan studi kasus retail & visualisasi sederhana.',
    whatYouLearn: [
      'Manipulasi array dan DataFrame secara efisien',
      'Ringkasan statistik untuk dataset sampel',
      'Membuat visualisasi untuk narasi stakeholder',
    ],
    categoryId: 'cat-ai',
    category: 'Data Science & AI',
    author: { name: 'Citra Anggraini', avatar: AV('mnt-citra') },
    rating: 4.85,
    totalReviews: 56,
    image: COVER('du-python'),
    price: 199_000,
    status: 'published',
    mentorUid: 'mnt-citra',
    enrolled: 64,
    modules: MOD_PY,
    duration: '2 minggu',
    submittedAt: '2025-08-10T11:00:00.000Z',
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  },
  {
    uid: 'crs-005',
    variantBadge: 'premium',
    title: 'Cybersecurity untuk Developer',
    subtitle: 'Threat model pragmatis untuk kode layanan web.',
    description: 'Konsep CIA, sanitasi input, XSS/CSRF, dan kebiasaan coding aman.',
    whatYouLearn: [
      'Membuat threat model sederhana per fitur',
      'Mengenali XSS dan pola mitigasinya di UI',
      'Memahami CSRF serta praktik token/cookie yang aman',
    ],
    categoryId: 'cat-cyber',
    category: 'Cybersecurity',
    author: { name: 'Arya Wijaya', avatar: AV('mnt-arya') },
    rating: 4.75,
    totalReviews: 41,
    image: COVER('du-sec'),
    price: 429_000,
    status: 'published',
    mentorUid: 'mnt-arya',
    enrolled: 72,
    modules: MOD_SEC,
    duration: '3 minggu',
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  },
  {
    uid: 'crs-006',
    variantBadge: 'draft',
    title: 'Bootcamp Full-Stack JavaScript (Coming soon)',
    subtitle: 'Lintasan intensif dari Node hingga pola deploy modern.',
    description: 'Kurikulum menyeluruh dari Node hingga SSR — akan dibuka Oktober.',
    whatYouLearn: [
      'Alur kolaborasi Git dan review kode kelompok',
      'Membangun API Node dengan validasi konsisten',
      'Merencanakan capstone lintas frontend & backend',
    ],
    categoryId: 'cat-web',
    category: 'Pengembangan Web',
    author: { name: 'Arya Wijaya', avatar: AV('mnt-arya') },
    rating: 0,
    totalReviews: 0,
    image: COVER('du-boot'),
    price: 1_799_000,
    status: 'draft',
    mentorUid: 'mnt-arya',
    enrolled: 0,
    modules: MOD_BOOTCAMP,
    duration: '12 minggu',
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  },
]

export function slugToCourseUid(slug: string): string | null {
  const found = Object.entries(COURSE_UID_TO_SLUG).find(([, s]) => s === slug)
  return found ? found[0] : null
}

export function listCategoriesDummy(): AdminCategoryItem[] {
  return [
    { uid: 'cat-web', name: 'Pengembangan Web', coursesCount: 3, colorVariant: 'primary' },
    { uid: 'cat-design', name: 'Desain UI/UX', coursesCount: 1, colorVariant: 'violet' },
    { uid: 'cat-ai', name: 'Data Science & AI', coursesCount: 1, colorVariant: 'emerald' },
    { uid: 'cat-bus', name: 'Bisnis & Manajemen', coursesCount: 0, colorVariant: 'amber' },
    { uid: 'cat-cyber', name: 'Cybersecurity', coursesCount: 1, colorVariant: 'rose' },
  ]
}

export const SEED_ADMIN_MENTORS: AdminMentor[] = [
  {
    uid: 'mnt-arya',
    name: 'Arya Wijaya',
    email: 'arya@mentor.dummy',
    avatar: AV('mnt-arya'),
    joinedAt: '2023-03-01T00:00:00Z',
    totalCourses: 4,
    rating: 4.9,
    totalReviews: 255,
    status: 'active',
    specializations: ['Development', 'Data & AI'],
    bio: 'Mantan lead engineer OSS sekitar Doscom.',
    studentsCount: 486,
  },
  {
    uid: 'mnt-budi',
    name: 'Budi Hartono',
    email: 'budi@mentor.dummy',
    avatar: AV('mnt-budi'),
    joinedAt: '2024-01-15T00:00:00Z',
    totalCourses: 2,
    rating: 4.8,
    totalReviews: 94,
    status: 'active',
    specializations: ['Design', 'Marketing'],
    studentsCount: 120,
  },
  {
    uid: 'mnt-citra',
    name: 'Citra Anggraini',
    email: 'citra@mentor.dummy',
    avatar: AV('mnt-citra'),
    joinedAt: '2023-11-20T00:00:00Z',
    totalCourses: 1,
    rating: 4.85,
    totalReviews: 56,
    status: 'active',
    specializations: ['Data & AI', 'Development'],
    studentsCount: 64,
  },
]

export const SEED_ADMIN_STUDENTS: AdminStudent[] = [
  {
    uid: 'stu-001',
    name: 'Dewi Lestari',
    email: 'dewi@student.dummy',
    avatar: AV('stu-001'),
    joinedAt: '2024-06-05T08:12:00Z',
    enrolledCourses: 4,
    averageProgress: 72,
    status: 'active',
    totalSpent: 848_000,
    phone: '+62 813-XXXX-4421',
    lastActive: '30 menit lalu',
  },
  {
    uid: 'stu-002',
    name: 'Raka Nugraha',
    email: 'raka@student.dummy',
    avatar: AV('stu-002'),
    joinedAt: '2024-08-19T03:41:00Z',
    enrolledCourses: 3,
    averageProgress: 58,
    status: 'active',
    totalSpent: 299_000,
    lastActive: 'Kemarin',
  },
  {
    uid: 'stu-015',
    name: 'Milenia Putri',
    email: 'milen@student.dummy',
    avatar: AV('stu015'),
    joinedAt: '2025-01-02T10:05:00Z',
    enrolledCourses: 6,
    averageProgress: 91,
    status: 'active',
    totalSpent: 1_420_000,
    lastActive: 'Baru saja',
  },
  {
    uid: 'stu-016',
    name: 'Fajar Hidayat',
    email: 'fajar@student.dummy',
    avatar: AV('stu016'),
    joinedAt: '2024-09-01T12:55:00Z',
    enrolledCourses: 2,
    averageProgress: 34,
    status: 'pending',
    totalSpent: 0,
    lastActive: '2 minggu lalu',
  },
  {
    uid: 'stu-017',
    name: 'Gita Saputra',
    email: 'gita@student.dummy',
    avatar: AV('stu017'),
    joinedAt: '2025-03-03T06:09:00Z',
    enrolledCourses: 7,
    averageProgress: 65,
    status: 'inactive',
    totalSpent: 512_000,
    lastActive: '9 hari lalu',
  },
]

export const SEED_ADMINISTRATORS: AdminAdministrator[] = [
  {
    uid: 'adm-wulan',
    name: 'Wulan Safitri',
    email: 'wulan@admin.dummy',
    avatar: AV('adm-wulan'),
    role: 'Super Admin',
    lastActive: 'Online',
    status: 'active',
    createdAt: '2022-01-10T07:50:00Z',
  },
  {
    uid: 'adm-bayu',
    name: 'Bayu Prakoso',
    email: 'bayu@admin.dummy',
    avatar: AV('adm-bayu'),
    role: 'Finance',
    lastActive: '1 jam lalu',
    status: 'active',
    createdAt: '2023-05-08T07:55:00Z',
  },
  {
    uid: 'adm-retno',
    name: 'Retno Anggraini',
    email: 'retno@admin.dummy',
    avatar: AV('adm-retno'),
    role: 'Content Moderator',
    lastActive: 'Kemarin',
    status: 'active',
    createdAt: '2024-02-02T06:41:00Z',
  },
  {
    uid: 'adm-tomi',
    name: 'Tommy Lesmana',
    email: 'tommy@admin.dummy',
    avatar: AV('adm-tomi'),
    role: 'Support',
    lastActive: 'Offline',
    status: 'inactive',
    createdAt: '2024-06-06T06:51:00Z',
  },
]

/** Transaksi utama (sharing courseName/uids dengan seed kursus). */
export function buildTransactionHistory(): TransactionHistoryItem[] {
  return [
    {
      uid: 'trx-901',
      transactionId: 'INV-2025-01901',
      courseUid: 'crs-001',
      studentUid: 'stu-001',
      courseImage: SEED_ICARD_COURSES[0].image,
      courseName: SEED_ICARD_COURSES[0].title,
      classType: 'Premium',
      price: SEED_ICARD_COURSES[0].price,
      paymentStatus: 'PAID',
      purchasedAt: '2025-08-08T07:41:33Z',
      paymentMethod: 'Virtual Account',
    },
    {
      uid: 'trx-902',
      transactionId: 'INV-2025-01902',
      courseUid: 'crs-004',
      studentUid: 'stu-015',
      courseImage: SEED_ICARD_COURSES[3].image,
      courseName: SEED_ICARD_COURSES[3].title,
      classType: 'Bootcamp',
      price: 199_000,
      paymentStatus: 'PENDING',
      purchasedAt: '2025-08-09T03:03:51Z',
      paymentMethod: 'QRIS',
    },
    {
      uid: 'trx-903',
      transactionId: 'INV-2025-01903',
      courseUid: 'crs-005',
      studentUid: 'stu-017',
      courseImage: SEED_ICARD_COURSES[4].image,
      courseName: SEED_ICARD_COURSES[4].title,
      classType: 'Premium',
      price: 429_000,
      paymentStatus: 'FAILED',
      purchasedAt: '2025-08-09T12:51:41Z',
      paymentMethod: 'Bank Transfer',
    },
    {
      uid: 'trx-904',
      transactionId: 'INV-2025-01904',
      courseUid: 'crs-003',
      studentUid: 'stu-002',
      courseImage: SEED_ICARD_COURSES[2].image,
      courseName: SEED_ICARD_COURSES[2].title,
      classType: 'Premium',
      price: 349_000,
      paymentStatus: 'PAID',
      purchasedAt: '2025-08-10T06:51:51Z',
      paymentMethod: 'E-Wallet',
    },
    {
      uid: 'trx-905',
      transactionId: 'INV-2025-01905',
      courseUid: 'crs-002',
      studentUid: 'stu-001',
      courseImage: SEED_ICARD_COURSES[1].image,
      courseName: SEED_ICARD_COURSES[1].title,
      classType: 'Free',
      price: 0,
      paymentStatus: 'PAID',
      purchasedAt: '2025-06-03T06:53:53Z',
      paymentMethod: 'QRIS',
    },
    {
      uid: 'trx-906',
      transactionId: 'INV-2025-01906',
      courseUid: 'crs-005',
      studentUid: 'stu-001',
      courseImage: SEED_ICARD_COURSES[4].image,
      courseName: SEED_ICARD_COURSES[4].title,
      classType: 'Premium',
      price: 429_000,
      paymentStatus: 'PAID',
      purchasedAt: '2025-08-06T06:53:53Z',
      paymentMethod: 'Bank Transfer',
    },
  ]
}

export function buildAdminTransactions(): AdminTransaction[] {
  const lookup = Object.fromEntries(SEED_ADMIN_STUDENTS.map((s) => [s.uid, { name: s.name, avatar: s.avatar }] as const))
  return buildTransactionHistory().map((row) => {
    const sid = row.studentUid ?? ''
    const st = lookup[sid]
    return {
      ...row,
      studentName: st?.name ?? 'Tamu Pembelian',
      studentAvatar: st?.avatar ?? AV('guest'),
    }
  })
}

export const SEED_STUDENT_ENROLLED: StudentEnrolledCourse[] = [
  {
    uid: 'enc-101',
    courseUid: 'crs-001',
    studentUid: 'stu-001',
    title: SEED_ICARD_COURSES[0].title,
    image: SEED_ICARD_COURSES[0].image,
    module: 'Komponen & JSX',
    progress: 78,
  },
  {
    uid: 'enc-102',
    courseUid: 'crs-002',
    studentUid: 'stu-001',
    title: SEED_ICARD_COURSES[1].title,
    image: SEED_ICARD_COURSES[1].image,
    module: 'Package manager',
    progress: 45,
  },
  {
    uid: 'enc-103',
    courseUid: 'crs-004',
    studentUid: 'stu-001',
    title: SEED_ICARD_COURSES[3].title,
    image: SEED_ICARD_COURSES[3].image,
    module: 'Quiz statistik dasar',
    progress: 20,
  },
  {
    uid: 'enc-104',
    courseUid: 'crs-005',
    studentUid: 'stu-001',
    title: SEED_ICARD_COURSES[4].title,
    image: SEED_ICARD_COURSES[4].image,
    module: 'CIA triad & threat model',
    progress: 12,
  },
]

export function buildCertificates(): ICertificate[] {
  return [
    {
      uid: 'cert-a1',
      courseUid: 'crs-002',
      studentUid: 'stu-001',
      title: 'Kelulusan Kursus',
      courseName: SEED_ICARD_COURSES[1].title,
      issuedDate: '2025-07-02T06:53:53Z',
      category: 'Pengembangan Web',
      credentialId: 'DU-LNX-9281',
      imageUrl: COVER('du-linux'),
    },
    {
      uid: 'cert-a2',
      courseUid: 'crs-001',
      studentUid: 'stu-001',
      title: 'Sertifikat Penyelesaian',
      courseName: SEED_ICARD_COURSES[0].title,
      issuedDate: '2025-10-05T06:53:53Z',
      category: 'Pengembangan Web',
      credentialId: 'DU-WEB-1204',
      imageUrl: COVER('du-web'),
    },
    {
      uid: 'cert-b1',
      courseUid: 'crs-004',
      studentUid: 'stu-015',
      title: 'Sertifikat Workshop Data',
      courseName: SEED_ICARD_COURSES[3].title,
      issuedDate: '2025-06-03T06:53:53Z',
      category: 'Data Science & AI',
      credentialId: 'DU-PY-4482',
    },
  ]
}

export function buildDashboardStats(): IDashboardStat[] {
  return [
    { label: 'Kelas aktif', value: 3, iconName: 'Book' },
    { label: 'Deadline minggu ini', value: 2, iconName: 'ClipboardCheck' },
    { label: 'Sertifikat', value: 2, iconName: 'Award' },
    { label: 'Tugas selesai review', value: 6, iconName: 'CheckCircle' },
  ]
}

export function buildResumeCourses(): IResumeCourse[] {
  const c = SEED_ICARD_COURSES
  return [
    {
      title: c[0].title,
      module: 'Komponen & JSX',
      progress: 78,
      image: c[0].image,
      description: 'Lanjutkan modul kedua minggu ini.',
      variantBadge: 'premium',
      courseUid: c[0].uid,
      author: c[0].author,
      rating: c[0].rating,
      totalReviews: c[0].totalReviews,
    },
    {
      title: c[1].title,
      module: 'Package manager',
      progress: 45,
      image: c[1].image,
      description: 'Ikuti panduan APT praktik server.',
      variantBadge: 'free',
      courseUid: c[1].uid,
      author: c[1].author,
      rating: c[1].rating,
      totalReviews: c[1].totalReviews,
    },
    {
      title: c[2].title,
      module: 'Auto layout',
      progress: 0,
      image: c[2].image,
      description: 'Baru bergabung — mulai dari modul pertama.',
      variantBadge: 'premium',
      courseUid: c[2].uid,
      author: c[2].author,
      rating: c[2].rating,
      totalReviews: c[2].totalReviews,
    },
  ]
}

export function buildDeadlines(): IDeadlineItem[] {
  return [
    { month: 'SEP', day: '12', title: 'PR — komponen form', course: SEED_ICARD_COURSES[0].title, isPast: false },
    { month: 'SEP', day: '18', title: 'Quiz cepat akses VPS', course: SEED_ICARD_COURSES[1].title, isPast: false },
    { month: 'AGU', day: '30', title: 'Refleksi mini UI kit', course: SEED_ICARD_COURSES[2].title, isPast: true },
  ]
}

export function buildFeedbacks(): IFeedbackItem[] {
  return [
    {
      status: 'Lulus',
      time: '2 jam yang lalu',
      title: 'Tugas 2 — Pemrograman Web Modern',
      comment: 'Struktur folder rapi dan penamaan konsisten.',
      instructor: { name: 'Arya Wijaya', avatar: AV('mnt-arya') },
    },
    {
      status: 'Perlu Revisi',
      time: 'Kemarin',
      title: 'Tugas 1 — Linux server',
      comment: 'Lampirkan screenshot permission error yang kamu dapat.',
      instructor: { name: 'Arya Wijaya', avatar: AV('mnt-arya') },
    },
    {
      status: 'Lulus',
      time: '3 hari lalu',
      title: 'Studi kasus aksesibilitas tombol',
      comment: 'Bagus konsistensi state focus ring.',
      instructor: { name: 'Budi Hartono', avatar: AV('mnt-budi') },
    },
  ]
}

export function getMentorDashboardStatsDummy(): IMentorStats {
  return {
    pendingGrading: 5,
    unansweredQA: 2,
    activeStudents: 214,
    totalCourses: 4,
  }
}

export function buildSchedules(): IScheduleItem[] {
  const c = SEED_ICARD_COURSES
  return [
    {
      uid: 'sch-1',
      courseId: 'crs-001',
      courseName: c[0].title,
      scheduleDate: '2025-09-09',
      scheduleTime: '09:00',
      endTime: '11:00',
      location: 'Lab OSS Doscom Gedung E',
      classType: 'offline',
      studentCount: 32,
    },
    {
      uid: 'sch-2',
      courseId: 'crs-002',
      courseName: c[1].title,
      scheduleDate: '2025-09-10',
      scheduleTime: '13:00',
      endTime: '15:30',
      location: 'meet.doscom.org/linux-002',
      classType: 'online',
      studentCount: 140,
    },
    {
      uid: 'sch-3',
      courseId: 'crs-004',
      courseName: c[3].title,
      scheduleDate: '2025-09-12',
      scheduleTime: '08:30',
      endTime: '12:00',
      location: 'Zoom — link di LMS',
      classType: 'online',
      studentCount: 54,
    },
    {
      uid: 'sch-4',
      courseId: 'crs-003',
      courseName: c[2].title,
      scheduleDate: '2025-09-15',
      scheduleTime: '16:00',
      endTime: '18:00',
      location: 'Studio Doscom Lt. 2',
      classType: 'offline',
      studentCount: 22,
    },
    {
      uid: 'sch-5',
      courseId: 'crs-005',
      courseName: c[4].title,
      scheduleDate: '2025-09-18',
      scheduleTime: '19:30',
      endTime: '21:00',
      location: 'Google Meet secure link',
      classType: 'online',
      studentCount: 71,
    },
  ]
}

const reply = (partial: Omit<AdminQaReply, 'uid'> & { uid?: string }): AdminQaReply => ({
  uid: partial.uid ?? `rep-${Math.random().toString(36).slice(2, 8)}`,
  ...partial,
})

export function buildReviews(): AdminReview[] {
  const courses = SEED_ICARD_COURSES
  return [
    {
      uid: 'rev-01',
      courseUid: courses[0].uid,
      studentUid: 'stu-001',
      courseTitle: courses[0].title,
      studentName: 'Dewi Lestari',
      studentAvatar: AV('stu-001'),
      rating: 5,
      comment: 'Materi scaffold project sangat membantu onboarding.',
      createdAt: '2025-07-03T06:53:53Z',
      reply: { author: courses[0].author.name, comment: 'Terima kasih, semangat terus!', createdAt: '2025-07-03T06:53:53Z' },
    },
    {
      uid: 'rev-02',
      courseUid: courses[1].uid,
      studentUid: 'stu-002',
      courseTitle: courses[1].title,
      studentName: 'Raka Nugraha',
      studentAvatar: AV('stu-002'),
      rating: 4,
      comment: 'Perlu lebih banyak troubleshooting umum APT.',
      createdAt: '2025-06-06T06:53:53Z',
    },
    {
      uid: 'rev-03',
      courseUid: courses[2].uid,
      studentUid: 'stu-017',
      courseTitle: courses[2].title,
      studentName: 'Gita Saputra',
      studentAvatar: AV('stu017'),
      rating: 5,
      comment: 'Auto-layout section terbaik yang pernah kutonton!',
      createdAt: '2025-08-12T06:53:53Z',
    },
  ]
}

export function buildQaThreads(): AdminQaThread[] {
  const courses = SEED_ICARD_COURSES
  return [
    {
      uid: 'qa-001',
      courseUid: courses[0].uid,
      authorUid: 'stu-001',
      courseTitle: courses[0].title,
      title: 'Bingung hydrate client component',
      author: 'Dewi Lestari',
      authorAvatar: AV('stu-001'),
      body: 'Apakah hydrate hanya sekali atau boleh partial?',
      createdAt: '2025-08-06T06:53:53Z',
      repliesCount: 2,
      status: 'answered',
      replies: [
        reply({
          uid: 'qa-r1',
          author: 'Arya Wijaya',
          authorAvatar: AV('mnt-arya'),
          role: 'mentor',
          body: 'Biasanya satu kali untuk root SSR; subtree bisa lazy.',
          createdAt: '2025-08-06T06:53:53Z',
        }),
        reply({
          uid: 'qa-r2',
          author: 'Raka Nugraha',
          authorAvatar: AV('stu-002'),
          role: 'student',
          body: 'Thanks Kak, paham!',
          createdAt: '2025-08-07T06:53:53Z',
        }),
      ],
    },
    {
      uid: 'qa-002',
      courseUid: courses[4].uid,
      authorUid: 'stu-017',
      courseTitle: courses[4].title,
      title: 'Validasi input JSON — best practice apa?',
      author: 'Gita Saputra',
      authorAvatar: AV('stu017'),
      body: 'Apakah cukup Zod atau perlu sanitasi tambahan?',
      createdAt: '2025-08-04T06:53:53Z',
      repliesCount: 1,
      status: 'answered',
      replies: [
        reply({
          uid: 'qa-r4',
          author: 'Wulan Safitri',
          authorAvatar: AV('adm-wulan'),
          role: 'admin',
          body: 'Zod membantu struktur schema; sanitasi contextual tetap dibutuhkan.',
          createdAt: '2025-08-04T06:53:53Z',
        }),
      ],
    },
    {
      uid: 'qa-003',
      courseUid: courses[2].uid,
      authorUid: 'stu-015',
      courseTitle: courses[2].title,
      title: 'Komponen typography scale',
      author: 'Milenia Putri',
      authorAvatar: AV('stu015'),
      body: 'Butuh contoh sistem type scale 14–32.',
      createdAt: '2025-08-04T06:53:53Z',
      repliesCount: 0,
      status: 'unanswered',
      replies: [],
    },
  ]
}

export const SEED_TICKETS: AdminTicket[] = [
  {
    uid: 'tkt-1',
    studentUid: 'stu-017',
    subject: 'Pembayaran VA tidak diverifikasi 24 jam',
    studentName: 'Gita Saputra',
    studentAvatar: AV('stu017'),
    createdAt: '2025-07-06T06:53:53Z',
    severity: 'high',
    category: 'Payment',
  },
  {
    uid: 'tkt-2',
    studentUid: 'stu-001',
    subject: 'Sertifikat tidak muncul setelah kelulusan',
    studentName: 'Dewi Lestari',
    studentAvatar: AV('stu-001'),
    createdAt: '2025-07-06T06:53:53Z',
    severity: 'medium',
    category: 'Certificate',
  },
  {
    uid: 'tkt-3',
    studentUid: 'stu-016',
    subject: 'Minta akses ulang tugas kedaluwarsa',
    studentName: 'Fajar Hidayat',
    studentAvatar: AV('stu016'),
    createdAt: '2025-07-06T06:53:53Z',
    severity: 'low',
    category: 'Course Content',
  },
]

/** KPI dashboard admin. */
export function buildDashboardKpis(): AdminKpi[] {
  return [
    {
      id: 'k1',
      label: 'Gross Revenue (MTD)',
      value: 'Rp 892 jt',
      trendValue: 12.8,
      trendDirection: 'up',
      trendLabel: 'vs bulan lalu',
      iconName: 'revenue',
    },
    {
      id: 'k2',
      label: 'Total siswa aktif',
      value: '3.742',
      trendValue: 4.6,
      trendDirection: 'up',
      trendLabel: 'bulan ini',
      iconName: 'users',
    },
    {
      id: 'k3',
      label: 'Transaksi Paid',
      value: '582',
      trendValue: 2.5,
      trendDirection: 'up',
      trendLabel: 'hari ini',
      iconName: 'paid',
    },
    {
      id: 'k4',
      label: 'Pending pembayaran',
      value: '37',
      trendValue: 5.8,
      trendDirection: 'down',
      trendLabel: 'Target < 25',
      iconName: 'pending',
    },
  ]
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export function buildMonthlyRevenue12m(): ChartDataPoint[] {
  return MONTHS_SHORT.map((label, i) => ({ label, value: 42_500_000 + i * 2_850_000 + (i % 3) * 1_400_000 }))
}

export function buildRevenueLine30d(): ChartDataPoint[] {
  return Array.from({ length: 30 }, (_, i) => ({
    label: `D-${i + 1}`,
    value: 950_000 + (i % 7) * 120_000,
  }))
}

export function buildChartRatio(): ChartRatioPoint[] {
  return [
    { label: 'Paid', value: 58, color: '#10b981' },
    { label: 'Pending', value: 28, color: '#f59e0b' },
    { label: 'Failed', value: 14, color: '#ef4444' },
  ]
}

export function buildTransactionTimeline30d(): TransactionTimelinePoint[] {
  return Array.from({ length: 12 }, (_, i) => ({
    label: `M${i + 1}`,
    paid: 10 + i * 2,
    pending: Math.max(0, 8 - i),
    failed: i % 4,
  }))
}

export function buildRevenueByCategory(): ChartDataPoint[] {
  return [
    { label: 'Web', value: 38 },
    { label: 'Design', value: 22 },
    { label: 'Data AI', value: 19 },
    { label: 'Cyber', value: 12 },
    { label: 'Bisnis', value: 9 },
  ]
}

export function buildRevenueSourceRatio(): ChartRatioPoint[] {
  return [
    { label: 'Katalog', value: 44, color: '#6366f1' },
    { label: 'Event', value: 21, color: '#8b5cf6' },
    { label: 'Partner', value: 18, color: '#0ea5e9' },
    { label: 'Referral', value: 17, color: '#14b8a6' },
  ]
}

export function buildNewUsersWeek(): ChartDataPoint[] {
  return ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((label, i) => ({ label, value: 32 + i * 6 }))
}

export function buildTopCoursesEnrollment(): ChartDataPoint[] {
  return SEED_ICARD_COURSES.filter((c) => c.enrolled > 0)
    .sort((a, b) => b.enrolled - a.enrolled)
    .slice(0, 5)
    .map((c) => ({ label: c.title.slice(0, 22), value: c.enrolled }))
}

export function getMentorSpecColorsDummy(): Record<string, string> {
  return {
    Development: '#0a84dc',
    Design: '#8b5cf6',
    'Data & AI': '#10b981',
    Marketing: '#f97316',
    Business: '#eab308',
    Language: '#ec4899',
  }
}

/** Tugas seed — konsisten dengan `crs-001`/`crs-002`. */
export const SEED_ASSIGNMENTS: IMentorCourseAssignment[] = [
  {
    uid: 'asn-crs001-a',
    courseId: 'crs-001',
    meetingNumber: 1,
    title: 'PR #1 — komponen form terkontrol',
    taskType: 'text',
    description: '<p>Buat form login terkontrol dengan validasi minimal 2 field.</p>',
    deadlineAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    status: 'published',
    autoCloseAfterDeadline: false,
    allowResubmit: true,
    maxAttempts: 3,
  },
  {
    uid: 'asn-crs001-b',
    courseId: 'crs-001',
    meetingNumber: 2,
    title: 'PR #2 — mini quiz JSX',
    taskType: 'quiz',
    description: '',
    quiz: sampleQuizIntro,
    deadlineAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: 'published',
    autoCloseAfterDeadline: false,
    allowResubmit: false,
  },
  {
    uid: 'asn-crs002-a',
    courseId: 'crs-002',
    meetingNumber: 1,
    title: 'Laporan log apt update',
    taskType: 'text',
    description: '<p>Ringkas output <code>apt update</code> dan jelaskan 3 baris penting.</p>',
    deadlineAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    status: 'published',
    autoCloseAfterDeadline: true,
    allowResubmit: true,
  },
  {
    uid: 'asn-crs003-a',
    courseId: 'crs-003',
    meetingNumber: 1,
    title: 'UI kit warna sekunder',
    taskType: 'text',
    description: '<p>Definisikan semantic warna aksen + contoh kombinasi teks kontras WCAG AA.</p>',
    deadlineAt: new Date(Date.now() + 4 * 86400000).toISOString(),
    status: 'draft',
    autoCloseAfterDeadline: false,
    allowResubmit: false,
  },
]

const BLOCK_TEXT = (html: string): SubmissionContentBlock => ({ type: 'html', html })

export const SEED_SUBMISSIONS: IMentorAssignmentSubmission[] = [
  {
    uid: 'sub-001',
    assignmentUid: 'asn-crs001-a',
    courseId: 'crs-001',
    studentUid: 'stu-001',
    studentName: 'Dewi Lestari',
    studentAvatar: AV('stu-001'),
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    attemptNumber: 1,
    contentBlocks: [BLOCK_TEXT('<p>Form login dengan state terpisah + debounce tombol Kirim.</p>')],
    reviewStatus: 'graded',
    rating: 4,
    mentorComment: 'Bagus struktur pemisahan handlers.',
    reviewedAt: new Date(Date.now() - 82800000).toISOString(),
  },
  {
    uid: 'sub-002',
    assignmentUid: 'asn-crs001-a',
    courseId: 'crs-001',
    studentUid: 'stu-002',
    studentName: 'Raka Nugraha',
    studentAvatar: AV('stu-002'),
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    attemptNumber: 1,
    contentBlocks: [BLOCK_TEXT('<p>Masih error validasi kosong untuk email kosong.</p>')],
    reviewStatus: 'pending_review',
    rating: null,
    mentorComment: null,
    reviewedAt: null,
  },
  {
    uid: 'sub-003',
    assignmentUid: 'asn-crs002-a',
    courseId: 'crs-002',
    studentUid: 'stu-001',
    studentName: 'Dewi Lestari',
    studentAvatar: AV('stu-001'),
    submittedAt: new Date(Date.now() - 432000000).toISOString(),
    attemptNumber: 1,
    contentBlocks: [BLOCK_TEXT('<p>APT update lengkap untuk Ubuntu 22.04.</p>')],
    reviewStatus: 'returned',
    rating: null,
    mentorComment: 'Tambahkan screenshot baris SECURITY.',
    reviewedAt: new Date(Date.now() - 418000000).toISOString(),
  },
]
