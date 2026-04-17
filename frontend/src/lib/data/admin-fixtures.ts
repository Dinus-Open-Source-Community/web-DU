import type { AppBadgeVariant } from '@/components/ui/badge'
import type { ICardData, PaymentStatus, TransactionHistoryItem } from '@/lib/types'
import {
  listCourses,
  listMentors as repoListMentors,
  listCategories as repoListCategories,
  listAllReviews,
  listAllQaThreads,
  listPopularCourses,
} from './repository'

export type { CourseStatus } from '@/lib/types'

// ─── KPI Dashboard ─────────────────────────────────────────────────────────

export interface AdminKpi {
  id: string
  label: string
  value: string
  trendValue: number
  trendDirection: 'up' | 'down' | 'neutral'
  trendLabel: string
  iconName: 'revenue' | 'users' | 'transactions' | 'conversion' | 'ticket' | 'paid' | 'pending' | 'failed'
}

export const adminDashboardKpis: AdminKpi[] = [
  {
    id: 'gross-revenue',
    label: 'Gross Revenue',
    value: 'Rp1,28M',
    trendValue: 12.4,
    trendDirection: 'up',
    trendLabel: 'vs bulan lalu',
    iconName: 'revenue',
  },
  {
    id: 'active-students',
    label: 'Active Students',
    value: '8.432',
    trendValue: 5.8,
    trendDirection: 'up',
    trendLabel: 'vs bulan lalu',
    iconName: 'users',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    value: '1.254',
    trendValue: -2.1,
    trendDirection: 'down',
    trendLabel: 'vs bulan lalu',
    iconName: 'transactions',
  },
  {
    id: 'conversion-rate',
    label: 'Conversion Rate',
    value: '4,8%',
    trendValue: 0.6,
    trendDirection: 'up',
    trendLabel: 'vs bulan lalu',
    iconName: 'conversion',
  },
]

// ─── Charts ────────────────────────────────────────────────────────────────

export const revenueLine30d = Array.from({ length: 30 }).map((_, i) => ({
  label: `${i + 1}`,
  value: 35_000_000 + Math.round(Math.sin(i / 3.2) * 12_000_000 + Math.cos(i / 5.7) * 6_500_000 + i * 850_000),
}))

export const newUsersWeek = [
  { label: 'Sen', value: 84 },
  { label: 'Sel', value: 102 },
  { label: 'Rab', value: 91 },
  { label: 'Kam', value: 128 },
  { label: 'Jum', value: 156 },
  { label: 'Sab', value: 142 },
  { label: 'Min', value: 88 },
]

export const topCoursesByEnrolment = [
  { label: 'Advanced React Patterns', value: 1820 },
  { label: 'UI/UX Fundamentals', value: 1540 },
  { label: 'ML with Python', value: 1320 },
  { label: 'Tailwind CSS v4', value: 1180 },
  { label: 'Go Microservices', value: 920 },
]

export const transactionTimeline30d = Array.from({ length: 30 }).map((_, i) => ({
  label: `${i + 1}`,
  paid: 18 + Math.round(Math.sin(i / 3) * 6 + i * 0.2),
  pending: 6 + Math.round(Math.cos(i / 4) * 3),
  failed: 2 + Math.round(Math.sin(i / 6) * 2),
}))

export const transactionRatio = [
  { label: 'Paid', value: 842, color: 'var(--chart-1)' },
  { label: 'Pending', value: 268, color: 'var(--chart-3)' },
  { label: 'Failed', value: 144, color: 'var(--chart-2)' },
]

// ─── Tickets ───────────────────────────────────────────────────────────────

export interface AdminTicket {
  uid: string
  subject: string
  studentName: string
  studentAvatar: string
  createdAt: string
  severity: 'high' | 'medium' | 'low'
  category: 'Payment' | 'Course Content' | 'Account' | 'Certificate' | 'Other'
}

export const unresolvedTickets: AdminTicket[] = [
  {
    uid: 'tkt-001',
    subject: 'Pembayaran VA tidak ter-verifikasi selama 24 jam',
    studentName: 'Ayu Lestari',
    studentAvatar: 'https://i.pravatar.cc/150?u=ayu',
    createdAt: '2 jam lalu',
    severity: 'high',
    category: 'Payment',
  },
  {
    uid: 'tkt-002',
    subject: 'Video modul 4 tidak bisa diputar (React Advanced)',
    studentName: 'Rizal Pratama',
    studentAvatar: 'https://i.pravatar.cc/150?u=rizal',
    createdAt: '4 jam lalu',
    severity: 'medium',
    category: 'Course Content',
  },
  {
    uid: 'tkt-003',
    subject: 'Tidak bisa reset password (link expired berkali-kali)',
    studentName: 'Budi Santoso',
    studentAvatar: 'https://i.pravatar.cc/150?u=budi',
    createdAt: '6 jam lalu',
    severity: 'medium',
    category: 'Account',
  },
  {
    uid: 'tkt-004',
    subject: 'Sertifikat belum terbit meski kursus selesai',
    studentName: 'Melisa Wijaya',
    studentAvatar: 'https://i.pravatar.cc/150?u=melisa',
    createdAt: '1 hari lalu',
    severity: 'low',
    category: 'Certificate',
  },
  {
    uid: 'tkt-005',
    subject: 'Request refund: salah beli kursus (pembelian dobel)',
    studentName: 'Hendra Gunawan',
    studentAvatar: 'https://i.pravatar.cc/150?u=hendra',
    createdAt: '1 hari lalu',
    severity: 'high',
    category: 'Payment',
  },
]

// ─── Recent Transactions (reuse TransactionHistoryItem) ────────────────────

export const recentTransactions: TransactionHistoryItem[] = [
  {
    uid: 'txn-recent-1',
    transactionId: 'TRX-2026-1821',
    courseImage: 'https://picsum.photos/seed/rct-1/320/200',
    courseName: 'Advanced React Patterns & Next.js 15',
    classType: 'Premium',
    price: 499000,
    paymentStatus: 'PAID',
    purchasedAt: '2026-04-17T09:22:10',
    paymentMethod: 'Virtual Account',
  },
  {
    uid: 'txn-recent-2',
    transactionId: 'TRX-2026-1820',
    courseImage: 'https://picsum.photos/seed/rct-2/320/200',
    courseName: 'UI/UX Fundamentals',
    classType: 'Premium',
    price: 349000,
    paymentStatus: 'PENDING',
    purchasedAt: '2026-04-17T08:52:40',
    paymentMethod: 'QRIS',
  },
  {
    uid: 'txn-recent-3',
    transactionId: 'TRX-2026-1819',
    courseImage: 'https://picsum.photos/seed/rct-3/320/200',
    courseName: 'Machine Learning with Python',
    classType: 'Bootcamp',
    price: 899000,
    paymentStatus: 'PAID',
    purchasedAt: '2026-04-17T07:12:01',
    paymentMethod: 'Bank Transfer',
  },
  {
    uid: 'txn-recent-4',
    transactionId: 'TRX-2026-1818',
    courseImage: 'https://picsum.photos/seed/rct-4/320/200',
    courseName: 'Tailwind CSS v4 & Framer Motion',
    classType: 'Premium',
    price: 299000,
    paymentStatus: 'FAILED',
    purchasedAt: '2026-04-16T22:40:12',
    paymentMethod: 'E-Wallet',
  },
  {
    uid: 'txn-recent-5',
    transactionId: 'TRX-2026-1817',
    courseImage: 'https://picsum.photos/seed/rct-5/320/200',
    courseName: 'Cybersecurity Analyst Bootcamp',
    classType: 'Bootcamp',
    price: 1250000,
    paymentStatus: 'PAID',
    purchasedAt: '2026-04-16T18:15:30',
    paymentMethod: 'Bank Transfer',
  },
]

// ─── Students ──────────────────────────────────────────────────────────────

export type AdminStatus = 'active' | 'inactive' | 'pending'

export interface AdminStudent {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  enrolledCourses: number
  averageProgress: number
  status: AdminStatus
  totalSpent: number
  phone?: string
  lastActive: string
}

const firstNames = [
  'Ayu',
  'Budi',
  'Citra',
  'Dewi',
  'Eko',
  'Fajar',
  'Gita',
  'Hendra',
  'Indah',
  'Joko',
  'Kirana',
  'Lukman',
  'Melisa',
  'Novi',
  'Oka',
  'Putri',
  'Rizal',
  'Sinta',
  'Taufik',
  'Umar',
  'Vina',
  'Wahyu',
  'Xena',
  'Yoga',
  'Zahra',
]
const lastNames = [
  'Pratama',
  'Lestari',
  'Wijaya',
  'Santoso',
  'Gunawan',
  'Saputra',
  'Hidayat',
  'Ramadhani',
  'Kurniawan',
  'Mahendra',
  'Nugraha',
  'Parwati',
  'Saputri',
  'Wibowo',
  'Anggraeni',
  'Purnama',
  'Permatasari',
  'Hartono',
  'Lesmana',
  'Setiawan',
]

export const adminStudents: AdminStudent[] = Array.from({ length: 25 }).map((_, i) => {
  const first = firstNames[i % firstNames.length]
  const last = lastNames[(i * 3) % lastNames.length]
  const name = `${first} ${last}`
  const enrolled = 1 + ((i * 7) % 9)
  const avg = 10 + ((i * 13) % 90)
  const status: AdminStatus = i % 8 === 7 ? 'pending' : i % 5 === 4 ? 'inactive' : 'active'
  return {
    uid: `stu-${String(i + 1).padStart(3, '0')}`,
    name,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@mail.com`,
    avatar: `https://i.pravatar.cc/150?u=${first.toLowerCase()}${i}`,
    joinedAt: `${Math.max(1, (i % 28) + 1)} ${['Jan', 'Feb', 'Mar', 'Apr'][i % 4]} 2026`,
    enrolledCourses: enrolled,
    averageProgress: avg,
    status,
    totalSpent: (i + 1) * 350000,
    phone: `+62 81${(200_000_000 + i * 17_321).toString().slice(0, 8)}`,
    lastActive: `${1 + (i % 20)} hari lalu`,
  }
})

export interface StudentEnrolledCourse {
  uid: string
  title: string
  image: string
  module: string
  progress: number
}

export const studentEnrolledCourses: StudentEnrolledCourse[] = [
  {
    uid: 'enr-1',
    title: 'Advanced React Patterns & Next.js 15',
    image: 'https://picsum.photos/seed/enr1/400/240',
    module: 'Modul 6 dari 12',
    progress: 58,
  },
  {
    uid: 'enr-2',
    title: 'UI/UX Fundamentals',
    image: 'https://picsum.photos/seed/enr2/400/240',
    module: 'Modul 8 dari 8',
    progress: 100,
  },
  {
    uid: 'enr-3',
    title: 'Mastering Tailwind CSS v4',
    image: 'https://picsum.photos/seed/enr3/400/240',
    module: 'Modul 3 dari 10',
    progress: 32,
  },
  {
    uid: 'enr-4',
    title: 'Machine Learning with Python',
    image: 'https://picsum.photos/seed/enr4/400/240',
    module: 'Modul 2 dari 12',
    progress: 18,
  },
]

// ─── Mentors ───────────────────────────────────────────────────────────────

export type MentorSpecialization = keyof typeof mentorSpecColors

export const mentorSpecColors = {
  Development: 'categoryDev',
  Design: 'categoryDesign',
  'Data & AI': 'categoryData',
  Marketing: 'categoryMarketing',
  Business: 'categoryBusiness',
  Language: 'categoryLanguage',
} as const satisfies Record<string, AppBadgeVariant>

export interface AdminMentor {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  totalCourses: number
  rating: number
  totalReviews: number
  status: AdminStatus
  specializations: MentorSpecialization[]
  bio?: string
  studentsCount: number
}

export const adminMentors: AdminMentor[] = repoListMentors() as AdminMentor[]

// ─── Administrators ────────────────────────────────────────────────────────

export interface AdminAdministrator {
  uid: string
  name: string
  email: string
  avatar: string
  role: 'Super Admin' | 'Admin' | 'Finance' | 'Content Moderator' | 'Support'
  lastActive: string
  status: AdminStatus
  createdAt: string
}

export const adminAdministrators: AdminAdministrator[] = [
  {
    uid: 'adm-001',
    name: 'Rizki Saputra',
    email: 'rizki.saputra@doscom.id',
    avatar: 'https://i.pravatar.cc/150?u=rizki',
    role: 'Super Admin',
    lastActive: '5 menit lalu',
    status: 'active',
    createdAt: '01 Jan 2024',
  },
  {
    uid: 'adm-002',
    name: 'Putri Ayuningtyas',
    email: 'putri.a@doscom.id',
    avatar: 'https://i.pravatar.cc/150?u=putri-admin',
    role: 'Admin',
    lastActive: '20 menit lalu',
    status: 'active',
    createdAt: '12 Feb 2024',
  },
  {
    uid: 'adm-003',
    name: 'Bagus Wirawan',
    email: 'bagus.w@doscom.id',
    avatar: 'https://i.pravatar.cc/150?u=bagus',
    role: 'Finance',
    lastActive: '1 jam lalu',
    status: 'active',
    createdAt: '05 Mar 2024',
  },
  {
    uid: 'adm-004',
    name: 'Siti Rahma',
    email: 'siti.r@doscom.id',
    avatar: 'https://i.pravatar.cc/150?u=sitirahma',
    role: 'Content Moderator',
    lastActive: '3 jam lalu',
    status: 'active',
    createdAt: '20 Mar 2024',
  },
  {
    uid: 'adm-005',
    name: 'Haris Prabowo',
    email: 'haris.p@doscom.id',
    avatar: 'https://i.pravatar.cc/150?u=haris',
    role: 'Support',
    lastActive: '2 hari lalu',
    status: 'inactive',
    createdAt: '14 Apr 2024',
  },
]

// ─── Courses (extended) ────────────────────────────────────────────────────

/**
 * Kategori admin (label Bahasa Indonesia) — selaras dengan `ICardData.category`
 * pada `DataCourse`. Digunakan oleh `adminCategoryList` dan komponen admin.
 */
export type CourseCategory = 'Pengembangan Web' | 'Desain UI/UX' | 'Data Science & AI' | 'Bisnis & Manajemen' | 'Cybersecurity'

/**
 * `AdminCourse` adalah alias `ICardData` — seluruh data kursus (baik untuk
 * katalog browse maupun halaman detail admin) berasal dari `DataCourse` di
 * `@/lib/dummyData`. Lihat `adminCourses` di bawah.
 */
export type AdminCourse = ICardData

export const adminCourses: AdminCourse[] = listCourses()

export const adminCategoryList: {
  uid: string
  name: CourseCategory
  coursesCount: number
  colorVariant: AppBadgeVariant
}[] = repoListCategories().map((c) => ({
  uid: c.uid,
  name: c.name as CourseCategory,
  coursesCount: c.coursesCount,
  colorVariant: c.colorVariant as AppBadgeVariant,
}))

export const adminCourseWhatYouLearn = [
  'Build scalable Next.js applications with App Router',
  'Master server components, streaming, and suspense',
  'Implement advanced state patterns with Zustand',
  'Optimize rendering with React Compiler & caching',
  'Deploy production-grade apps to Vercel & custom infra',
  'Apply accessibility and performance best practices',
]

export const adminCourseFeedbackBreakdown = [
  { stars: 5, percent: 75 },
  { stars: 4, percent: 16 },
  { stars: 3, percent: 5 },
  { stars: 2, percent: 3 },
  { stars: 1, percent: 1 },
]

// ─── Reviews & Q&A ─────────────────────────────────────────────────────────

export interface AdminReview {
  uid: string
  courseUid: string
  courseTitle: string
  studentName: string
  studentAvatar: string
  rating: number
  comment: string
  createdAt: string
  reply?: { author: string; comment: string; createdAt: string }
}

export const adminReviews: AdminReview[] = listAllReviews() as AdminReview[]

export interface AdminQaThread {
  uid: string
  courseUid: string
  courseTitle: string
  title: string
  author: string
  authorAvatar: string
  body: string
  createdAt: string
  repliesCount: number
  status: 'answered' | 'unanswered'
  replies: AdminQaReply[]
}

export interface AdminQaReply {
  uid: string
  author: string
  authorAvatar: string
  role: 'student' | 'mentor' | 'admin'
  body: string
  createdAt: string
}

export const adminQaThreads: AdminQaThread[] = listAllQaThreads() as AdminQaThread[]

// ─── Transactions (extended; dipakai admin finance/transactions) ───────────

export interface AdminTransaction extends TransactionHistoryItem {
  studentName: string
  studentAvatar: string
}

const studentPool = adminStudents.slice(0, 14)

export const adminTransactions: AdminTransaction[] = Array.from({ length: 28 }).map((_, i) => {
  const base: TransactionHistoryItem = {
    uid: `atxn-${String(i + 1).padStart(3, '0')}`,
    transactionId: `TRX-2026-${String(3000 + i).padStart(4, '0')}`,
    courseImage: `https://picsum.photos/seed/atxn-${i}/320/200`,
    courseName: adminCourses[i % adminCourses.length].title,
    classType: ['Premium', 'Bootcamp', 'Free'][i % 3] as 'Premium' | 'Bootcamp' | 'Free',
    price: 199000 + ((i * 50000) % 1_100_000),
    paymentStatus: (['PAID', 'PENDING', 'FAILED', 'PAID', 'PAID'] as PaymentStatus[])[i % 5],
    purchasedAt: new Date(2026, 3, Math.max(1, (i % 28) + 1), (i * 3) % 24, (i * 7) % 60).toISOString(),
    paymentMethod: (['Bank Transfer', 'Virtual Account', 'E-Wallet', 'QRIS'] as const)[i % 4],
  }
  const student = studentPool[i % studentPool.length]
  return {
    ...base,
    studentName: student.name,
    studentAvatar: student.avatar,
  }
})

// ─── Payouts ───────────────────────────────────────────────────────────────

export type PayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected'

export interface AdminPayout {
  uid: string
  mentorUid: string
  mentorName: string
  mentorAvatar: string
  amount: number
  bankName: string
  accountNumber: string
  accountHolder: string
  requestedAt: string
  status: PayoutStatus
}

export const adminPayouts: AdminPayout[] = [
  {
    uid: 'pay-001',
    mentorUid: 'men-001',
    mentorName: 'Sarah Drasner',
    mentorAvatar: 'https://i.pravatar.cc/150?u=sarah_d',
    amount: 18_420_000,
    bankName: 'BCA',
    accountNumber: '0123456789',
    accountHolder: 'Sarah Drasner',
    requestedAt: '16 Apr 2026',
    status: 'requested',
  },
  {
    uid: 'pay-002',
    mentorUid: 'men-002',
    mentorName: 'Jessica Wong',
    mentorAvatar: 'https://i.pravatar.cc/150?u=jess_w',
    amount: 12_800_000,
    bankName: 'Mandiri',
    accountNumber: '1440023456',
    accountHolder: 'Jessica Wong',
    requestedAt: '15 Apr 2026',
    status: 'approved',
  },
  {
    uid: 'pay-003',
    mentorUid: 'men-003',
    mentorName: 'Dr. Alex Chen',
    mentorAvatar: 'https://i.pravatar.cc/150?u=alex_c',
    amount: 8_960_000,
    bankName: 'BNI',
    accountNumber: '3322019871',
    accountHolder: 'Alex Chen',
    requestedAt: '14 Apr 2026',
    status: 'paid',
  },
  {
    uid: 'pay-004',
    mentorUid: 'men-004',
    mentorName: 'Marcus Levin',
    mentorAvatar: 'https://i.pravatar.cc/150?u=marcus_l',
    amount: 5_420_000,
    bankName: 'BRI',
    accountNumber: '554201982233',
    accountHolder: 'Marcus Levin',
    requestedAt: '13 Apr 2026',
    status: 'rejected',
  },
  {
    uid: 'pay-005',
    mentorUid: 'men-005',
    mentorName: 'Kevin Mitnick',
    mentorAvatar: 'https://i.pravatar.cc/150?u=kevin_m',
    amount: 21_900_000,
    bankName: 'CIMB',
    accountNumber: '778120394455',
    accountHolder: 'Kevin Mitnick',
    requestedAt: '12 Apr 2026',
    status: 'paid',
  },
  {
    uid: 'pay-006',
    mentorUid: 'men-008',
    mentorName: 'Gary Vaynerchuk',
    mentorAvatar: 'https://i.pravatar.cc/150?u=gary_v',
    amount: 14_600_000,
    bankName: 'BCA',
    accountNumber: '9920194778',
    accountHolder: 'Gary Vaynerchuk',
    requestedAt: '11 Apr 2026',
    status: 'requested',
  },
]

// ─── Coupons ───────────────────────────────────────────────────────────────

export type CouponType = 'percent' | 'flat'
export type CouponStatus = 'active' | 'expired' | 'scheduled'

export interface AdminCoupon {
  uid: string
  code: string
  type: CouponType
  value: number
  minPurchase: number
  usageLimit: number
  used: number
  startsAt: string
  endsAt: string
  status: CouponStatus
}

export const adminCoupons: AdminCoupon[] = [
  {
    uid: 'cpn-001',
    code: 'BELAJAR25',
    type: 'percent',
    value: 25,
    minPurchase: 200000,
    usageLimit: 1000,
    used: 842,
    startsAt: '01 Apr 2026',
    endsAt: '30 Apr 2026',
    status: 'active',
  },
  {
    uid: 'cpn-002',
    code: 'MERDEKA50',
    type: 'percent',
    value: 50,
    minPurchase: 500000,
    usageLimit: 500,
    used: 321,
    startsAt: '10 Apr 2026',
    endsAt: '20 Apr 2026',
    status: 'active',
  },
  {
    uid: 'cpn-003',
    code: 'WELCOME100',
    type: 'flat',
    value: 100000,
    minPurchase: 300000,
    usageLimit: 2000,
    used: 1750,
    startsAt: '01 Mar 2026',
    endsAt: '31 Mar 2026',
    status: 'expired',
  },
  {
    uid: 'cpn-004',
    code: 'MAY20',
    type: 'percent',
    value: 20,
    minPurchase: 150000,
    usageLimit: 800,
    used: 0,
    startsAt: '01 May 2026',
    endsAt: '15 May 2026',
    status: 'scheduled',
  },
  {
    uid: 'cpn-005',
    code: 'BOOTCAMP150',
    type: 'flat',
    value: 150000,
    minPurchase: 899000,
    usageLimit: 300,
    used: 120,
    startsAt: '01 Apr 2026',
    endsAt: '14 May 2026',
    status: 'active',
  },
]

// ─── Audit Logs ────────────────────────────────────────────────────────────

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW'

export interface AdminAuditLog {
  uid: string
  timestamp: string
  actorName: string
  actorAvatar: string
  actorRole: string
  action: AuditAction
  resource: string
  resourceId: string
  ip: string
  detail: string
}

export const adminAuditLogs: AdminAuditLog[] = [
  {
    uid: 'aud-001',
    timestamp: '2026-04-17 09:22:10',
    actorName: 'Rizki Saputra',
    actorAvatar: 'https://i.pravatar.cc/150?u=rizki',
    actorRole: 'Super Admin',
    action: 'UPDATE',
    resource: 'Course',
    resourceId: 'crs-001',
    ip: '203.142.88.210',
    detail: 'Mengubah harga dari Rp599.000 menjadi Rp499.000.',
  },
  {
    uid: 'aud-002',
    timestamp: '2026-04-17 08:41:22',
    actorName: 'Putri Ayuningtyas',
    actorAvatar: 'https://i.pravatar.cc/150?u=putri-admin',
    actorRole: 'Admin',
    action: 'CREATE',
    resource: 'Coupon',
    resourceId: 'cpn-004',
    ip: '114.10.22.114',
    detail: 'Menambahkan coupon MAY20 (scheduled).',
  },
  {
    uid: 'aud-003',
    timestamp: '2026-04-17 07:15:58',
    actorName: 'Bagus Wirawan',
    actorAvatar: 'https://i.pravatar.cc/150?u=bagus',
    actorRole: 'Finance',
    action: 'UPDATE',
    resource: 'Payout',
    resourceId: 'pay-002',
    ip: '202.51.110.9',
    detail: 'Mengubah status payout menjadi APPROVED.',
  },
  {
    uid: 'aud-004',
    timestamp: '2026-04-16 22:04:12',
    actorName: 'Siti Rahma',
    actorAvatar: 'https://i.pravatar.cc/150?u=sitirahma',
    actorRole: 'Content Moderator',
    action: 'DELETE',
    resource: 'Review',
    resourceId: 'rev-099',
    ip: '125.164.23.88',
    detail: 'Menghapus review yang melanggar pedoman komunitas.',
  },
  {
    uid: 'aud-005',
    timestamp: '2026-04-16 19:28:44',
    actorName: 'Rizki Saputra',
    actorAvatar: 'https://i.pravatar.cc/150?u=rizki',
    actorRole: 'Super Admin',
    action: 'VIEW',
    resource: 'Audit Log',
    resourceId: 'aud-004',
    ip: '203.142.88.210',
    detail: 'Membuka detail log aktivitas moderator.',
  },
  {
    uid: 'aud-006',
    timestamp: '2026-04-16 17:00:21',
    actorName: 'Putri Ayuningtyas',
    actorAvatar: 'https://i.pravatar.cc/150?u=putri-admin',
    actorRole: 'Admin',
    action: 'CREATE',
    resource: 'Mentor',
    resourceId: 'men-015',
    ip: '114.10.22.114',
    detail: 'Mengundang mentor baru untuk bergabung.',
  },
  {
    uid: 'aud-007',
    timestamp: '2026-04-16 15:12:34',
    actorName: 'Bagus Wirawan',
    actorAvatar: 'https://i.pravatar.cc/150?u=bagus',
    actorRole: 'Finance',
    action: 'UPDATE',
    resource: 'Transaction',
    resourceId: 'atxn-013',
    ip: '202.51.110.9',
    detail: 'Menandai transaksi refund selesai diproses.',
  },
  {
    uid: 'aud-008',
    timestamp: '2026-04-16 11:02:41',
    actorName: 'Rizki Saputra',
    actorAvatar: 'https://i.pravatar.cc/150?u=rizki',
    actorRole: 'Super Admin',
    action: 'UPDATE',
    resource: 'Settings',
    resourceId: 'integrations',
    ip: '203.142.88.210',
    detail: 'Memperbarui API key Midtrans (disembunyikan).',
  },
]

// ─── RBAC ──────────────────────────────────────────────────────────────────

export interface AdminRole {
  uid: string
  name: string
  description: string
  membersCount: number
  permissions: string[]
}

export const adminPermissionGroups = [
  {
    group: 'Users',
    items: ['users.view', 'users.create', 'users.update', 'users.delete', 'users.reset_credentials'],
  },
  {
    group: 'Courses',
    items: ['courses.view', 'courses.create', 'courses.update', 'courses.approve', 'courses.delete'],
  },
  {
    group: 'Finance',
    items: ['finance.view', 'finance.refund', 'finance.payout_approve', 'finance.export'],
  },
  {
    group: 'Reports',
    items: ['reports.view', 'reports.export', 'reports.share'],
  },
  {
    group: 'System',
    items: ['system.settings', 'system.integrations', 'system.audit_logs'],
  },
]

export const adminRoles: AdminRole[] = [
  {
    uid: 'role-super',
    name: 'Super Admin',
    description: 'Akses penuh ke seluruh modul dan konfigurasi platform.',
    membersCount: 2,
    permissions: adminPermissionGroups.flatMap((g) => g.items),
  },
  {
    uid: 'role-admin',
    name: 'Admin',
    description: 'Mengelola pengguna, kursus, dan transaksi tanpa akses settings sistem.',
    membersCount: 5,
    permissions: ['users.view', 'users.create', 'users.update', 'users.reset_credentials', 'courses.view', 'courses.create', 'courses.update', 'courses.approve', 'finance.view', 'reports.view'],
  },
  {
    uid: 'role-finance',
    name: 'Finance',
    description: 'Fokus pada transaksi, refund, dan payout mentor.',
    membersCount: 3,
    permissions: ['finance.view', 'finance.refund', 'finance.payout_approve', 'finance.export', 'reports.view'],
  },
  {
    uid: 'role-mentor',
    name: 'Mentor',
    description: 'Mengelola kursus yang dimiliki dan menjawab Q&A.',
    membersCount: 24,
    permissions: ['courses.view', 'courses.update', 'users.view'],
  },
  {
    uid: 'role-student',
    name: 'Student',
    description: 'Akses kursus yang dibeli dan fitur pembelajaran.',
    membersCount: 8_432,
    permissions: [],
  },
]

// ─── Analytics ─────────────────────────────────────────────────────────────

export const learningEngagementTrend = Array.from({ length: 12 }).map((_, i) => ({
  label: `W${i + 1}`,
  active: 1200 + Math.round(Math.sin(i / 2) * 180 + i * 22),
  completed: 540 + Math.round(Math.cos(i / 2.3) * 100 + i * 18),
}))

export const completionRateByCategory = [
  { label: 'Development', value: 78 },
  { label: 'Design', value: 82 },
  { label: 'Data & AI', value: 69 },
  { label: 'Business', value: 74 },
  { label: 'Marketing', value: 86 },
  { label: 'Cybersecurity', value: 61 },
]

export const dropOffFunnel = [
  { label: 'Kunjungi Kursus', value: 10000 },
  { label: 'Mulai Pendaftaran', value: 6400 },
  { label: 'Bayar', value: 4200 },
  { label: 'Mulai Belajar', value: 3800 },
  { label: 'Selesai', value: 2600 },
]

export const monthlyRevenue12m = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr'].map((m, i) => ({
  label: m,
  value: 720_000_000 + i * 65_000_000 + ((i * 13) % 100_000_000),
}))

export const revenueByCategory = [
  { label: 'Development', value: 4_230_000_000 },
  { label: 'Design', value: 2_110_000_000 },
  { label: 'Data & AI', value: 1_860_000_000 },
  { label: 'Business', value: 1_140_000_000 },
  { label: 'Marketing', value: 720_000_000 },
  { label: 'Cybersecurity', value: 610_000_000 },
]

export const revenueSourceRatio = [
  { label: 'Course Premium', value: 62, color: 'var(--chart-1)' },
  { label: 'Bootcamp', value: 28, color: 'var(--chart-5)' },
  { label: 'Subscriptions', value: 10, color: 'var(--chart-3)' },
]

// ─── Popular Courses (for detail page bottom strip) ────────────────────────

export const popularCoursesStrip = listPopularCourses(4).map((c) => ({
  uid: c.uid,
  title: c.title,
  image: c.image,
  rating: c.rating,
  price: `Rp${(c.price / 1000).toFixed(0)}k`,
  mentor: c.author.name,
}))
