# Admin Request & Response Expectations

Dokumen ini mendefinisikan ekspektasi request/response backend yang dibutuhkan oleh halaman admin saat ini.

Format envelope mengikuti tipe `IResponse<T>`:

```ts
interface IResponse<T> {
  success?: boolean
  message?: string
  data?: T | null
  error?: string | null
}
```

## Dashboard

### `GET /admin/dashboard/kpis`

Dipakai oleh `pages/admin/Dashboard.tsx` untuk mengganti mock `AdminKpi[]`.

Request query opsional:

```ts
{
  period?: '7d' | '30d' | '90d' | '12m'
}
```

Response:

```ts
interface AdminKpi {
  id: string
  label: string
  value: string
  trendValue: number
  trendDirection: 'up' | 'down' | 'neutral'
  trendLabel: string
  iconName: 'revenue' | 'users' | 'transactions' | 'conversion' | 'ticket' | 'paid' | 'pending' | 'failed'
}

type Response = IResponse<AdminKpi[]>
```

Example:

```json
{
  "success": true,
  "message": "Dashboard KPI fetched",
  "data": [
    {
      "id": "gross-revenue",
      "label": "Gross Revenue",
      "value": "Rp128.750.000",
      "trendValue": 12.4,
      "trendDirection": "up",
      "trendLabel": "30 hari terakhir",
      "iconName": "revenue"
    }
  ],
  "error": null
}
```

### `GET /admin/dashboard/recent-transactions`

Request query:

```ts
{
  limit?: number // default 5
}
```

Response item mengikuti `TransactionHistoryItem`:

```ts
interface TransactionHistoryItem {
  uid: string
  transactionId: string
  courseUid?: string
  studentUid?: string
  courseImage: string
  courseName: string
  classType: 'Premium' | 'Bootcamp' | 'Free'
  price: number
  paymentStatus: 'pending' | 'success' | 'failed'
  purchasedAt: string
  paymentMethod: 'Bank Transfer' | 'Virtual Account' | 'E-Wallet' | 'QRIS'
  qrImage?: string
}
```

### `GET /admin/dashboard/support-tickets`

Request query:

```ts
{
  status?: 'open' | 'in_progress' | 'resolved'
  limit?: number
}
```

Response item mengikuti `AdminTicket` dari `components/Admin/Dashboard/Ticket.tsx`:

```ts
interface AdminTicket {
  uid: string
  studentUid?: string
  subject: string
  studentName: string
  studentAvatar: string
  createdAt: string
  severity: 'high' | 'medium' | 'low'
  category: 'Payment' | 'Course Content' | 'Account' | 'Certificate' | 'Other'
}
```

## Users Management

### `GET /user/manage/all`

Sudah tersedia di `API_ROUTES.user.getAllManagedUsers(params)`.

Request query yang dibutuhkan FE:

```ts
{
  role?: 'student' | 'mentor' | 'admin'
  status?: 'active' | 'inactive' | 'pending'
  search?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
```

Response ideal:

```ts
interface AdminUsersResponse<T> {
  users: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}
```

Student item:

```ts
interface AdminStudent {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  enrolledCourses: number
  averageProgress: number
  status: 'active' | 'inactive' | 'pending'
  totalSpent: number
  phone?: string
  lastActive: string
}
```

Mentor item:

```ts
interface AdminMentor {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  totalCourses: number
  rating: number
  totalReviews: number
  status: 'active' | 'inactive' | 'pending'
  bio?: string
  studentsCount: number
}
```

Administrator item:

```ts
interface AdminAdministrator {
  uid: string
  name: string
  email: string
  avatar: string
  role: 'Super Admin' | 'Admin' | 'Finance' | 'Content Moderator' | 'Support'
  lastActive: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
}
```

## Courses

### `GET /courses`

Sudah tersedia di `API_ROUTES.courses.getAll(params)`.

Request query:

```ts
{
  page?: number
  per_page?: number
  mentor_id?: string
  title?: string
  price?: string | number
  is_premium?: boolean
  course_category_id?: string
  course_type_id?: string
  class_type_id?: string
  status?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
```

Response:

```ts
interface ICourseListResponse {
  courses: ICourseItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}
```

### `GET /courses/:uid`

Response:

```ts
type IDetailCourseResponse = ICourseDetailItem
```

Admin detail page juga butuh data siswa course:

### `GET /courses/:uid/students`

Response expected:

```ts
interface IMentorCourseStudent {
  uid: string
  name: string
  email?: string
  avatar?: string
  progressPercent: number
  attendancePresent: number
  attendanceTotal: number
  status: 'Aktif' | 'Selesai' | 'Terlambat' | 'Belum mulai'
  lastActiveLabel: string
}
```

## Transactions & Financial

### `GET /payment`

Sudah tersedia di `API_ROUTES.payment.getAll(params)`, tetapi FE admin butuh response yang lebih kaya untuk dashboard transaksi.

Request query:

```ts
{
  page?: number
  per_page?: number
  status?: 'pending' | 'success' | 'failed'
  search?: string
  date_from?: string
  date_to?: string
}
```

Response expected:

```ts
interface AdminTransaction extends TransactionHistoryItem {
  studentName: string
  studentAvatar: string
}

interface AdminTransactionsResponse {
  transactions: AdminTransaction[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
  summary: {
    grossRevenue: number
    paidCount: number
    pendingCount: number
    failedCount: number
  }
}
```

### `GET /admin/financial/summary`

Dibutuhkan oleh `pages/admin/Financial.tsx`.

Response expected:

```ts
interface AdminFinancialSummary {
  kpis: AdminKpi[]
  monthlyRevenue: { label: string; value: number }[]
  revenueByCategory: { label: string; value: number }[]
  revenueSource: { label: string; value: number; color?: string }[]
}
```

## Reviews & Q&A

### `GET /admin/reviews`

Request query:

```ts
{
  courseUid?: string
  page?: number
  per_page?: number
  rating?: number
  has_reply?: boolean
}
```

Response item:

```ts
interface AdminReview {
  uid: string
  courseUid: string
  studentUid?: string
  courseTitle: string
  studentName: string
  studentAvatar: string
  rating: number
  comment: string
  createdAt: string
  reply?: { author: string; comment: string; createdAt: string }
}
```

### `POST /admin/reviews/:reviewUid/reply`

Request:

```ts
{
  comment: string
}
```

Response:

```ts
type Response = IResponse<AdminReview>
```

### `GET /admin/qna`

Request query:

```ts
{
  courseUid?: string
  status?: 'answered' | 'unanswered'
  page?: number
  per_page?: number
}
```

Response item:

```ts
interface AdminQaThread {
  uid: string
  courseUid: string
  authorUid?: string
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
```

### `POST /admin/qna/:threadUid/replies`

Request:

```ts
{
  body: string
}
```

Response:

```ts
type Response = IResponse<AdminQaThread>
```
