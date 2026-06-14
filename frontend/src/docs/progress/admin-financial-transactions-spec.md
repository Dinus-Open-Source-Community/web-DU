# Spesifikasi Admin — Transaksi & Financial Reports

Dokumen requirement **halaman admin transaksi dan laporan keuangan** untuk PM, QA, Backend, dan Frontend.

| | |
|---|---|
| **Halaman FE** | `pages/admin/Transactions.tsx`, `pages/admin/Financial.tsx` |
| **Route** | `/admin/transactions`, `/admin/financial` |
| **Role** | Super Admin / Admin (`Bearer` token wajib) |
| **Status FE** | 🔴 Mock — data hardcode di page; belum panggil API |
| **Status BE** | ✅ Endpoint tersedia di `backend/internal/handler/routes/admin.go` |
| **Terakhir diperbarui** | 9 Juni 2026 |

**Referensi kode:**

- BE handler: `backend/internal/service/admin_transactions.go`, `admin_financial.go`, `admin_helpers.go`
- FE UI: `components/Admin/Transactions/TransDashboard.tsx`
- FE types: `lib/types/data/transaction.ts`, `lib/types/components/charts.ts`

---

## Cara Membaca Dokumen

| Bagian | Audiens |
|--------|---------|
| §1 Ringkasan UI | PM — apa yang user lihat |
| §2–§3 Kontrak API | Backend + FE — request/response lengkap |
| §4 Mapping FE ↔ BE | FE implementer |
| §5 Gap & keputusan produk | PM + Backend |
| §6 Kriteria QA | QA |
| §7 Rencana implementasi FE | FE engineer |

---

## 1. Ringkasan Halaman (PM)

### 1.1 `/admin/transactions` — Transaksi

**Tujuan bisnis:** Admin memantau semua pembayaran platform — pendapatan kotor, distribusi status, dan daftar transaksi dengan filter.

**Blok UI saat ini** (`TransactionsDashboard`):

| Blok | Komponen | Data yang ditampilkan |
|------|----------|----------------------|
| Header | `PageHeader` | Judul "Transaksi" |
| KPI (4 kartu) | `StatCard` | Gross Revenue, Paid, Pending, Failed |
| Chart timeline | `TimelineAreaChart` | Paid / Pending / Failed per hari (30 hari) |
| Chart rasio | `TransactionRatioChart` | Proporsi Paid vs Pending vs Failed |
| Tabel | `AdminDataTable` | Daftar transaksi dengan pagination |
| Filter toolbar | `SearchForm`, `FilterSelect` | Search, status, metode pembayaran |

**Kolom tabel:**

| Kolom | Field FE |
|-------|----------|
| Transaksi | `transactionId`, `purchasedAt` |
| Siswa | `studentName`, `studentAvatar` |
| Kursus | `courseName` |
| Metode | `paymentMethod` |
| Status | `paymentStatus` → `PaymentBadge` |
| Total | `price` (0 = "Gratis") |

**Filter client-side saat ini (mock):**

- Status: `all` \| `success` \| `pending` \| `failed`
- Metode: `all` \| `Bank Transfer` \| `Virtual Account` \| `E-Wallet` \| `QRIS`
- Search: `transactionId`, `courseName`, `studentName`

---

### 1.2 `/admin/financial` — Financial Reports

**Tujuan bisnis:** Admin melihat tren pendapatan, kontribusi kategori, dan ringkasan KPI keuangan.

**Blok UI saat ini** (`AdminFinancialAnalyticsPage`):

| Blok | Komponen | Data yang ditampilkan |
|------|----------|----------------------|
| Header | `PageHeader` | Judul "Financial Reports" |
| KPI (4 kartu) | `StatCard` | Revenue 12 bulan, Revenue bulan ini, Avg Order Value, Conversion Rate |
| Chart bulanan | `CategoryBarChart` (vertikal) | Monthly Revenue 12 bulan |
| Chart kategori | `CategoryBarChart` (horizontal) | Revenue by Category |
| Chart sumber | `TransactionRatioChart` | Revenue Source (Website, Mobile, dll.) |

> **Catatan PM:** Label KPI di mock FE **belum sama** dengan label yang dikirim BE (lihat §5.1).

---

## 2. Kontrak API Umum

### 2.1 Autentikasi & otorisasi

```
Authorization: Bearer <access_token>
```

| Kondisi | HTTP | `message` |
|---------|------|-----------|
| Token tidak ada / invalid | `401` | Unauthorized |
| Bukan admin / super_admin | `403` | Access denied: Super Admin or Admin only |

### 2.2 Envelope respons standar

Semua endpoint admin memakai envelope yang sama:

```json
{
  "success": true,
  "message": "...",
  "data": { },
  "error": null
}
```

Error contoh:

```json
{
  "success": false,
  "message": "Failed to retrieve transactions",
  "data": null,
  "error": "detail error database"
}
```

### 2.3 UID di response

Middleware `ShortenUIDs` memotong UUID menjadi **8 karakter pertama** di response JSON. Path/query tetap bisa memakai prefix 8 char.

---

## 3. API — Halaman Transaksi

### 3.1 `GET /admin/transactions`

**Deskripsi:** Daftar transaksi terpaginasi + ringkasan agregat (summary) untuk KPI dan chart rasio.

**Handler BE:** `GetAdminTransactionsFunc`  
**File:** `backend/internal/service/admin_transactions.go`

#### Request

| Parameter | Tipe | Wajib | Default | Keterangan |
|-----------|------|-------|---------|------------|
| `page` | `int` | Tidak | `1` | Halaman (min 1) |
| `per_page` | `int` | Tidak | `10` | Item per halaman (max 100) |
| `status` | `string` | Tidak | — | Filter status pembayaran: `pending` \| `success` \| `failed` |
| `search` | `string` | Tidak | — | Cari di `reference`, nama kursus, nama siswa (case-insensitive, BE) |
| `date_from` | `string` | Tidak | — | `YYYY-MM-DD` atau RFC3339 |
| `date_to` | `string` | Tidak | — | `YYYY-MM-DD` (inklusif sampai akhir hari) atau RFC3339 |

**Contoh request:**

```http
GET /admin/transactions?page=1&per_page=10&status=success&search=alya&date_from=2024-05-01&date_to=2024-05-31
Authorization: Bearer eyJhbG...
```

**Tidak didukung BE (saat ini):**

- Query `payment_method` — filter metode di UI mock masih **client-side only**
- Query `sort` / `order`

#### Response `200` — struktur `data`

```ts
interface AdminTransactionsListData {
  transactions: AdminTransactionItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
  summary: AdminTransactionSummary
}
```

**Item transaksi** (`mapAdminTransactionRow`):

```ts
interface AdminTransactionItem {
  uid: string                    // payment UID (8 char di response)
  transactionId: string          // dari kolom payments.transaction_id / reference
  courseUid: string | null
  studentUid: string
  courseImage: string            // courses.cover_url
  courseName: string             // courses.title (decrypted)
  classType: 'Premium' | 'Bootcamp' | 'Free'
  price: number                  // payments.amount
  paymentStatus: 'pending' | 'success' | 'failed'
  purchasedAt: string              // ISO datetime — paid_at jika ada, else created_at
  paymentMethod: 'Bank Transfer' | 'Virtual Account' | 'E-Wallet' | 'QRIS'
  studentName: string            // decrypted
  studentAvatar: string          // users.avatar_url
}
```

**Summary agregat** (`computeTransactionSummary`):

```ts
interface AdminTransactionSummary {
  grossRevenue: number   // sum amount untuk status success
  paidCount: number
  pendingCount: number
  failedCount: number
}
```

**Contoh response sukses:**

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "uid": "a1b2c3d4",
        "transactionId": "TRX-20240508-001",
        "courseUid": "e5f6g7h8",
        "studentUid": "i9j0k1l2",
        "courseImage": "https://cdn.example/cover.jpg",
        "courseName": "UI/UX Design Fundamentals",
        "classType": "Premium",
        "price": 350000,
        "paymentStatus": "success",
        "purchasedAt": "2024-05-08T10:30:00Z",
        "paymentMethod": "Bank Transfer",
        "studentName": "Alya Putri",
        "studentAvatar": "https://cdn.example/avatar.jpg"
      }
    ],
    "meta": {
      "current_page": 1,
      "per_page": 10,
      "total": 42,
      "total_pages": 5
    },
    "summary": {
      "grossRevenue": 15750000,
      "paidCount": 35,
      "pendingCount": 5,
      "failedCount": 2
    }
  },
  "error": null
}
```

#### Mapping metode pembayaran (BE → label UI)

| Kode DB / Tripay | Label UI |
|------------------|----------|
| `QRIS`, `QRIS2` | `QRIS` |
| `OVO`, `DANA`, `SHOPEEPAY`, `LINKAJA` | `E-Wallet` |
| Kode berakhiran `VA` | `Virtual Account` |
| `BANK_TRANSFER`, `CREDIT_CARD`, default | `Bank Transfer` |

#### Mapping `classType`

| Kondisi | Label |
|---------|-------|
| Nama class type mengandung "bootcamp" | `Bootcamp` |
| `is_premium = true` | `Premium` |
| Lainnya | `Free` |

---

### 3.2 `GET /admin/transactions/summary`

**Deskripsi:** Hanya agregat summary — tanpa list transaksi. Berguna jika FE ingin refresh KPI tanpa reload tabel.

**Handler BE:** `GetAdminTransactionsSummaryFunc`

#### Request

Query parameter **sama** dengan `GET /admin/transactions` (kecuali `page` / `per_page` diabaikan untuk pagination list — filter `status`, `search`, `date_from`, `date_to` tetap berlaku).

```http
GET /admin/transactions/summary?status=success&date_from=2024-05-01
Authorization: Bearer eyJhbG...
```

#### Response `200`

```json
{
  "success": true,
  "message": "Transaction summary retrieved successfully",
  "data": {
    "grossRevenue": 15750000,
    "paidCount": 35,
    "pendingCount": 5,
    "failedCount": 2
  },
  "error": null
}
```

---

### 3.3 Kebutuhan chart yang **belum** ada di BE

UI `TransactionsDashboard` juga butuh:

```ts
interface TransactionTimelinePoint {
  label: string    // tanggal, mis. "2024-05-08"
  paid: number
  pending: number
  failed: number
}

interface ChartRatioPoint {
  label: string
  value: number    // FE mock: persen absolut (75, 20, 5)
  color: string
}
```

| Data | Status BE | Rekomendasi |
|------|-----------|-------------|
| `summary` (KPI) | ✅ Ada di list + `/summary` | Wire langsung |
| Chart rasio status | 🟡 Tidak ada field terpisah | **Hitung di FE** dari `summary.paidCount` dll. |
| Timeline 30 hari | 🔴 Tidak ada endpoint | Perlu **perluasan BE** atau turunkan prioritas chart |

**Usulan perluasan BE (opsional P2):**

```ts
// Tambahan di GET /admin/transactions/summary
interface AdminTransactionSummaryExtended {
  grossRevenue: number
  paidCount: number
  pendingCount: number
  failedCount: number
  timeline: TransactionTimelinePoint[]  // GROUP BY date, 30 hari terakhir
  ratio: { label: string; value: number; color?: string }[]
}
```

---

## 4. API — Halaman Financial

### 4.1 `GET /admin/financial/summary`

**Deskripsi:** KPI keuangan, tren pendapatan bulanan 12 bulan, breakdown per kategori kursus.

**Handler BE:** `GetAdminFinancialSummaryFunc`  
**File:** `backend/internal/service/admin_financial.go`

#### Request

Tidak ada query parameter.

```http
GET /admin/financial/summary
Authorization: Bearer eyJhbG...
```

#### Response `200` — struktur `data`

```ts
interface AdminFinancialSummaryData {
  kpis: AdminFinancialKpi[]
  monthlyRevenue: ChartDataPoint[]
  revenueByCategory: ChartDataPoint[]
  revenueSource: ChartRatioPoint[]
}

interface AdminFinancialKpi {
  id: string
  label: string
  value: string              // sudah diformat BE (IDR / count / persen)
  trendValue: number         // persen perubahan vs periode pembanding
  trendDirection: 'up' | 'down' | 'neutral'
  trendLabel: string
  iconName: 'revenue' | 'transactions' | 'paid' | 'conversion' | string
}

interface ChartDataPoint {
  label: string
  value: number              // nominal Rupiah (belum diformat)
}

interface ChartRatioPoint {
  label: string
  value: number
  color: string
}
```

#### KPI yang dikirim BE (aktual)

| `id` | `label` BE | Sumber perhitungan |
|------|------------|-------------------|
| `gross-revenue-12m` | Gross Revenue (12m) | SUM payments success 12 bulan terakhir |
| `avg-order-value` | Avg Order Value | gross 30 hari / jumlah transaksi success 30 hari |
| `paid-transactions` | Paid Transactions | COUNT success 30 hari |
| `conversion-rate` | Conversion Rate | paid enrollments / total users × 100 (1 desimal) |

**Trend:**

- `gross-revenue-12m` → trend 30 hari vs 30 hari sebelumnya
- KPI lain → `trendValue: 0`, `trendDirection: neutral` (belum dihitung BE)

#### Contoh response sukses

```json
{
  "success": true,
  "message": "Financial summary retrieved successfully",
  "data": {
    "kpis": [
      {
        "id": "gross-revenue-12m",
        "label": "Gross Revenue (12m)",
        "value": "Rp 75.000.000",
        "trendValue": 14.6,
        "trendDirection": "up",
        "trendLabel": "30 hari terakhir",
        "iconName": "revenue"
      },
      {
        "id": "avg-order-value",
        "label": "Avg Order Value",
        "value": "Rp 486.000",
        "trendValue": 0,
        "trendDirection": "neutral",
        "trendLabel": "30 hari terakhir",
        "iconName": "transactions"
      },
      {
        "id": "paid-transactions",
        "label": "Paid Transactions",
        "value": "128",
        "trendValue": 0,
        "trendDirection": "neutral",
        "trendLabel": "30 hari terakhir",
        "iconName": "paid"
      },
      {
        "id": "conversion-rate",
        "label": "Conversion Rate",
        "value": "4.8%",
        "trendValue": 0,
        "trendDirection": "neutral",
        "trendLabel": "all time",
        "iconName": "conversion"
      }
    ],
    "monthlyRevenue": [
      { "label": "Jul 2023", "value": 4500000 },
      { "label": "Aug 2023", "value": 5200000 }
    ],
    "revenueByCategory": [
      { "label": "Programming", "value": 15000000 },
      { "label": "Design", "value": 10000000 }
    ],
    "revenueSource": [
      { "label": "Website", "value": 100, "color": "#4F46E5" }
    ]
  },
  "error": null
}
```

#### Catatan data

| Field | Keterangan |
|-------|------------|
| `monthlyRevenue` | Hanya bulan yang punya transaksi success — **bukan** 12 titik kosong otomatis |
| `revenueByCategory` | JOIN payments → enrollments → courses → course_categories |
| `revenueSource` | **Placeholder** — selalu 100% Website; belum ada kolom sumber di DB |

---

## 5. Mapping FE ↔ BE & Gap

### 5.1 Perbedaan label KPI Financial (FE mock vs BE)

| Mock FE (`Financial.tsx`) | BE (`/admin/financial/summary`) | Keputusan disarankan |
|---------------------------|----------------------------------|----------------------|
| Revenue (12 bulan) | Gross Revenue (12m) | Pakai label BE atau sesuaikan copy PM |
| Revenue Bulan Ini | *(tidak ada KPI terpisah)* | Turunkan dari `monthlyRevenue.at(-1)` di FE **atau** tambah KPI di BE |
| Avg Order Value | Avg Order Value | ✅ Selaras |
| Conversion Rate | Conversion Rate | ✅ Selaras |
| — | Paid Transactions | Tampilkan KPI ke-4 dari BE (ganti "Revenue Bulan Ini") |

Trend di mock FE (YoY, MoM, 30 hari) **hardcode** — setelah wire API, gunakan `trendValue` / `trendDirection` dari BE.

### 5.2 Matriks gap

| # | Kebutuhan UI | BE | FE | Prioritas |
|---|--------------|----|----|-----------|
| G1 | Tabel transaksi + pagination server | ✅ | 🔴 Mock | P1 |
| G2 | KPI transaksi (gross, paid, pending, failed) | ✅ `summary` | 🔴 Hardcode | P1 |
| G3 | Filter status + search + tanggal | ✅ Query param | 🔴 Client-side mock | P1 |
| G4 | Filter metode pembayaran | 🔴 Tidak ada query | UI ada | P2 — client filter atau tambah `method` di BE |
| G5 | Chart rasio status | 🟡 Dari summary | 🔴 Mock | P1 — hitung FE |
| G6 | Timeline 30 hari | 🔴 Tidak ada | 🔴 Mock | P2 — perluasan BE |
| G7 | KPI + chart financial | ✅ (partial) | 🔴 Mock | P1 |
| G8 | Revenue Source chart | 🟡 Placeholder 100% | 🔴 Mock multi-slice | P3 — tunggu data BE |
| G9 | Trend KPI financial (semua kartu) | 🟡 Hanya gross-revenue | 🔴 Hardcode | P2 |
| G10 | Service + hook FE | — | 🔴 Belum ada | P1 |

### 5.3 Endpoint yang **bukan** untuk halaman ini

| Endpoint | Kenapa tidak dipakai |
|----------|---------------------|
| `GET /payment?reference=` | Kontrak per-reference, bukan list admin |
| `GET /user/data` → `transaction_history` | Profil siswa, bukan semua transaksi platform |

---

## 6. Kriteria Penerimaan (PM)

### Transaksi

- [ ] Admin login melihat daftar transaksi real dari database payments
- [ ] Pagination server-side (`page`, `per_page`) — default 10 per halaman
- [ ] Search menemukan transaksi by ID, nama siswa, atau nama kursus
- [ ] Filter status `success` / `pending` / `failed` mengubah hasil tabel + summary
- [ ] KPI Gross Revenue = sum amount transaksi **success** dalam scope filter
- [ ] Badge status konsisten: `success` = Paid, `pending`, `failed`
- [ ] Harga 0 ditampilkan "Gratis"
- [ ] Non-admin mendapat 403

### Financial

- [ ] Admin melihat KPI dari `GET /admin/financial/summary`
- [ ] Chart monthly revenue menampilkan data 12 bulan terakhir (bulan tanpa transaksi boleh kosong)
- [ ] Chart revenue by category menampilkan kategori dari data real
- [ ] Revenue Source menampilkan placeholder / label jelas "belum tersedia" jika masih 100% Website
- [ ] Loading & error state (toast atau empty state) jika API gagal

---

## 7. Skenario QA

### T1 — List transaksi default

| | |
|---|---|
| **Route** | `/admin/transactions` |
| **Precondition** | Login admin; seed punya payments |
| **Langkah** | Buka halaman |
| **Expected** | `GET /admin/transactions?page=1&per_page=10`; tabel terisi; meta.total ≥ 1 |

### T2 — Filter status success

| | |
|---|---|
| **Langkah** | Pilih filter Status = Paid |
| **Expected** | Request `?status=success`; semua baris `paymentStatus: success` |

### T3 — Search siswa

| | |
|---|---|
| **Langkah** | Search nama siswa → submit |
| **Expected** | Request `?search=<nama>`; hasil mengandung siswa tersebut |

### T4 — Pagination

| | |
|---|---|
| **Precondition** | total > per_page |
| **Langkah** | Klik halaman 2 |
| **Expected** | `?page=2`; data berbeda dari halaman 1 |

### T5 — KPI summary konsisten

| | |
|---|---|
| **Langkah** | Bandingkan kartu Gross Revenue dengan `data.summary.grossRevenue` di Network tab |
| **Expected** | Nilai sama (format Rupiah di UI) |

### T6 — Chart rasio dari summary

| | |
|---|---|
| **Langkah** | Hitung manual: paid / (paid+pending+failed) |
| **Expected** | Chart Rasio Status proporsional dengan summary |

### T7 — Financial summary

| | |
|---|---|
| **Route** | `/admin/financial` |
| **Expected** | `GET /admin/financial/summary`; 4 KPI + 2 chart bar terisi |

### T8 — Akses ditolak

| | |
|---|---|
| **Precondition** | Login sebagai student / mentor |
| **Langkah** | Akses `/admin/transactions` |
| **Expected** | Redirect atau 403 dari API |

### T9 — Filter tanggal (setelah wire FE)

| | |
|---|---|
| **Langkah** | Set rentang tanggal (jika UI date picker ditambahkan) |
| **Expected** | `date_from` & `date_to` terkirim; hasil dalam rentang |

---

## 8. Rencana Implementasi FE

### 8.1 File yang perlu dibuat

| Layer | Path disarankan |
|-------|-----------------|
| API path | `services/api-path.ts` → `admin.transactions`, `admin.transactionsSummary`, `admin.financialSummary` |
| Service | `services/admin-transactions.ts`, `services/admin-financial.ts` |
| Types | `lib/types/features/admin-transactions.ts`, `admin-financial.ts` |
| Mapper | `lib/admin-transactions/map-admin-transactions.ts` |
| Validator | `lib/validator/admin-transactions.schema.ts` (query params) |
| Hooks | `hooks/admin/use-admin-transactions.ts`, `use-admin-financial-summary.ts` |
| Presenter | `lib/admin-transactions/build-transaction-ratio.ts`, `build-transaction-timeline.ts` (jika timeline dari BE) |

### 8.2 Perubahan halaman

| File | Perubahan |
|------|-----------|
| `pages/admin/Transactions.tsx` | Hapus mock; pakai hook; pass data ke `TransactionsDashboard` |
| `pages/admin/Financial.tsx` | Hapus mock; map `kpis` BE ke `StatCard` |
| `components/Admin/Transactions/TransDashboard.tsx` | Terima `meta` + callback filter server-side; opsional hapus filter metode atau filter client dari page data |

### 8.3 Query keys (React Query)

```ts
adminKeys.transactions(params)
adminKeys.transactionsSummary(params)
adminKeys.financialSummary()
```

### 8.4 Urutan kerja disarankan

1. Tambah route di `api-path.ts` + service + unwrap envelope
2. Wire `Transactions.tsx` — tabel + KPI dari `summary`
3. Pindahkan filter status/search ke query param (server-side)
4. Hitung chart rasio dari `summary` di mapper/presenter
5. Wire `Financial.tsx` — KPI + charts dari `/admin/financial/summary`
6. Selaraskan label KPI dengan PM (§5.1)
7. (Opsional) Koordinasi BE untuk timeline + revenue source + filter `method`

---

## 9. Sinkronisasi Dokumen Terkait

Saat halaman di-wire, update juga:

| Dokumen | Path |
|---------|------|
| Integration status | [integration-status.md](./integration-status.md) |
| TODO backlog | [todo-backlog.md](./todo-backlog.md) — D5, D6, E17 |
| Backend changes | [backend-changes-j-yriz-merge.md](../backend-changes-j-yriz-merge.md) §5.2–5.3 |
| QA checklist | [qa-checklist.md](./qa-checklist.md) |
| Page coverage | [page-coverage.md](../page-coverage.md) |

---

*Dokumen ini diverifikasi terhadap kode BE `features/frontend-sapto` dan halaman FE mock per 9 Juni 2026. Jalankan BE dengan `SEED=true` untuk QA.*
