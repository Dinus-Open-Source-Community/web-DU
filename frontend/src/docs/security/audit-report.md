# Security Audit Report

Temuan audit keamanan frontend berdasarkan OWASP Top 10 dan checklist `security-review`.

**Scope:** `frontend/src/pages/`, providers auth/route-guard, services auth/payment/file-proxy, komponen render HTML  
**Branch:** `features/frontend-sapto` · **Tanggal:** 18 Juni 2026  
**Update:** Sprint 1 FE fixes ✅ · Sprint 2+ dokumentasi handoff BE → [be-coordination.md](./be-coordination.md)

---

## Temuan terbuka — delegasi BE

Item di bawah **tidak diimplementasikan di FE** sampai BE merge kontrak yang tercantum di [be-coordination.md](./be-coordination.md). Analisis as-is BE (read-only):

| ID | Gap BE terkonfirmasi |
|----|---------------------|
| SEC-06 | `CreatePayment` memakai `req.Amount` client; enrollment ownership tidak dicek vs JWT |
| SEC-07 | `GetPaymentTripayFunc` proxy Tripay tanpa ownership check JWT |
| SEC-03 | `CallbackHandler` return JSON — **tidak selaras** FE yang expect `?token=` redirect |
| SEC-01 | Login return token di JSON body, bukan httpOnly cookie |
| SEC-08 | `/invoices/url` masih wajib `user_id` query (authorization sudah cek JWT vs enrollment) |
| SEC-13 | Tidak ada endpoint forgot/reset password |
| SEC-05 | BE `canReadCourseByRole` sudah ada — perlu regression test saja |

---

## Pre-Conclusion Audit

### File yang direview (lengkap)

| Kategori | File |
|----------|------|
| Routing | `App.tsx`, `lib/routes.ts`, `providers/route-guard.tsx` |
| Auth | `providers/auth-provider.tsx`, `services/auth.ts`, `services/axios.ts` |
| Auth pages | `pages/auth/Login.tsx`, `Register.tsx`, `Oauth.tsx`, `ForgotPass.tsx`, `ResetPass.tsx` |
| Payment | `pages/checkout/Checkout.tsx`, `pages/student/TransactionPayment.tsx`, `hooks/use-checkout.ts`, `services/payment.ts`, `use-invoice-download.ts`, `PaymentInstructions.tsx` |
| Content | `pages/courses/view.tsx`, `LessonContent.tsx`, `lib/rich-text.ts`, `SubmissionContent.tsx` |
| File proxy | `services/file-proxy.ts`, `lib/files/parse-protected-file-reference.ts`, `lib/files/download-protected-file.ts` |
| Admin | `pages/admin/ReviewsQA.tsx`, `services/admin-moderation.ts` |
| Profile | `pages/profile/Profile.tsx`, `lib/validator/profile.schema.ts` |
| Matriks | Semua 43 file di `pages/` (via `page-coverage.md` + spot-check) |

### Checklist OWASP per file

| Checklist | Hasil |
|-----------|-------|
| Injection | ✅ Bersih — tidak ada concatenation query/SQL di FE |
| XSS | 🔴 **Temuan** — SEC-02, SEC-04 |
| Authentication | 🔴 **Temuan** — SEC-01, SEC-03 |
| Authorization / IDOR | 🟡 **Temuan** — SEC-05, SEC-07, SEC-08, SEC-09 (BE-dependent) |
| CSRF | 🟡 Partial — Bearer + SameSite=Lax; SEC-11 |
| Race conditions | ✅ Tidak ada TOCTOU kritis di FE |
| Session | 🔴 **Temuan** — SEC-01, SEC-10 |
| Cryptography | ✅ N/A |
| Information disclosure | 🟡 SEC-12, SEC-13 |
| DoS | 🟡 Batch limit 50 files OK |
| Business logic | 🔴 **Temuan** — SEC-06 |

### Area yang tidak bisa diverifikasi penuh

| Area | Alasan |
|------|--------|
| Enforcement enrollment di module viewer | Perlu test API `GET /lessons` tanpa token |
| IDOR payment / invoice | Perlu 2 akun student + curl ke BE |
| CSP / security headers production | Tidak ada di `vite.config.ts`; cek nginx/CDN deploy |
| Rate limiting login/register | Hanya di BE |
| TipTap editor allowed tags saat save | Perlu review BE `rich_text.go` |

---

## Temuan (prioritas: Critical → Low)

---

### SEC-01 · JWT di cookie JavaScript-readable

- **File:** `providers/auth-provider.tsx:94-108`, `services/axios.ts:12-14`
- **Severity:** **High**
- **Problem:** Token disimpan via `js-cookie` (`du_access_token`) tanpa flag `httpOnly`. Script XSS dapat membaca cookie dan mengeksfiltrasi Bearer token.
- **Evidence:** Tidak ada `httpOnly` option; interceptor axios membaca cookie setiap request. Skill security-review explicitly FAIL untuk localStorage — pola cookie JS-readable setara rentan.
- **Fix:** Pindah session ke cookie `httpOnly; Secure; SameSite=Strict` di-set oleh backend pada login/OAuth. FE tidak menyimpan token di `js-cookie`; gunakan `withCredentials` saja.
- **References:** [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

---

### SEC-02 · Stored XSS — rich HTML tanpa sanitasi

- **File:** `components/courses/module-viewer/LessonContent.tsx:69-76`, `SubmissionContent.tsx:18`, `PaymentInstructions.tsx:56`, dan 4 komponen assignment lainnya
- **Severity:** **High**
- **Problem:** Konten HTML dari API (lesson, submission, instruksi Tripay) dirender dengan `dangerouslySetInnerHTML` tanpa `DOMPurify` atau whitelist tag.
- **Evidence:** `grep DOMPurify` → tidak ada di `src/`. Mentor/admin dapat inject `<script>` atau event handler jika BE tidak sanitize saat save.
- **Fix:**
  ```typescript
  import DOMPurify from 'isomorphic-dompurify'
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [...], ALLOWED_ATTR: [...] })
  ```
  Terapkan di satu helper `sanitizeRichHtml()` dipakai semua renderer.
- **References:** [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

### SEC-03 · OAuth token di URL query string

- **File:** `pages/auth/Oauth.tsx:15-31`
- **Severity:** **High**
- **Problem:** JWT diterima via `?token=` dan langsung disimpan. Token muncul di browser history, server access logs, dan header `Referer` saat navigasi keluar.
- **Evidence:** `searchParams.get('token')` → `signInWithToken(token)`.
- **Fix:** Backend redirect dengan one-time authorization code; FE tukar code via POST. Atau fragment `#token=` (tidak dikirim ke server) + immediate `history.replaceState`.
- **References:** [RFC 6750 — Bearer Token in URI](https://datatracker.ietf.org/doc/html/rfc6750#section-2.3) (discouraged)

---

### SEC-04 · DOM XSS — instruksi pembayaran Tripay

- **File:** `components/student/transactions/payment-detail/PaymentInstructions.tsx:56`
- **Severity:** **Medium**
- **Problem:** Step instruksi dari gateway payment dirender sebagai HTML mentah. Jika response Tripay atau proxy BE compromised, XSS dieksekusi di konteks student.
- **Evidence:** `dangerouslySetInnerHTML={{ __html: step }}` — `step` string dari API.
- **Fix:** Sanitize dengan DOMPurify; prefer render plain text jika HTML tidak diperlukan.
- **References:** OWASP XSS

---

### SEC-05 · Module viewer route publik

- **File:** `App.tsx:130-135`, `pages/courses/view.tsx`
- **Severity:** **Medium**
- **Problem:** `/course/:courseUid/view` marked `public: true` — tidak ada `RouteGuard`. Guest dapat memuat viewer jika API mengembalikan data lesson.
- **Evidence:** `routeConfig` entry `public: true`; page tidak cek enrollment.
- **Fix:** FE — jadikan protected atau redirect ke login; **wajib** BE return 401/403 untuk lesson non-preview. Verifikasi dengan request tanpa token.
- **References:** OWASP Broken Access Control

---

### SEC-06 · Payment amount dikontrol client

- **File:** `hooks/use-checkout.ts:68-80`
- **Severity:** **High** (business logic — severity bergantung BE)
- **Problem:** `createPayment` mengirim `amount: price` dari state client (`course?.price ?? 0`). Attacker dapat intercept/modify request ke amount lebih rendah.
- **Evidence:**
  ```typescript
  amount: price,
  order_items: [{ price, ... }]
  ```
- **Fix:** BE **wajib** hitung amount dari `enrollment_uid` + course price di database; abaikan amount client atau validasi exact match. FE boleh kirim hanya `enrollment_uid` + `method`.
- **References:** OWASP Business Logic

---

### SEC-07 · Payment detail — potensi IDOR via query param

- **File:** `pages/student/TransactionPayment.tsx:24-27`, `lib/transactions/build-payment-detail-query.ts`
- **Severity:** **Medium** (BE-dependent)
- **Problem:** Halaman menerima `?reference=` / `?merchant_ref=` arbitrer. Jika BE tidak filter ownership, student A melihat payment student B.
- **Evidence:** Query langsung ke `GET /payment/tripay` tanpa validasi FE selain auth role student.
- **Fix:** BE enforce `payment.user_id === auth.uid`; FE handle 403 gracefully.
- **References:** OWASP IDOR

---

### SEC-08 · Invoice download — user_id di query

- **File:** `components/student/transactions/payment-detail/use-invoice-download.ts:17-21`
- **Severity:** **Medium** (BE-dependent)
- **Problem:** Request invoice menyertakan `user_id: userUid` dari parameter fungsi. Jika BE mempercayai query param, IDOR download invoice user lain.
- **Evidence:** `API_ROUTES.invoices.getInvoiceUrl({ enrollment_id, user_id, course_id })`.
- **Fix:** BE derive `user_id` dari JWT; hapus param dari FE atau ignore di BE.
- **References:** OWASP IDOR

---

### SEC-09 · Token exfiltration — download fallback URL

- **File:** `lib/files/download-protected-file.ts:16-19`
- **Severity:** **High**
- **Problem:** Jika `parseProtectedFileReference()` return `null`, kode fallback ke `fileReference` mentah. Axios `get(absoluteUrl)` mengirim **Authorization Bearer** ke host arbitrary.
- **Evidence:**
  ```typescript
  const requestPath = parsed?.requestPath ?? fileReference
  const blob = await fetchProtectedFileBlob(requestPath)
  ```
  Jika `invoice_url` dari API = `https://attacker.com/log`, token bocor.
- **Fix:** Throw error jika `parsed === null`; jangan fetch URL non-backend. Whitelist sama seperti `parseProtectedFileReference`.
- **References:** OWASP SSRF / Sensitive Data Exposure

---

### SEC-10 · Open redirect setelah login

- **File:** `pages/auth/Login.tsx:29-36`
- **Severity:** **Medium**
- **Problem:** Post-login redirect ke `location.state.from` tanpa validasi internal path. Phishing: link login dengan state `{ from: "//evil.com" }` atau path eksternal.
- **Evidence:** `navigate(typeof requestedPath === 'string' ? requestedPath : ...)`.
- **Fix:** Helper `isSafeInternalPath(path)` — harus mulai `/`, bukan `//`, bukan `http:`. Gunakan `new URL(path, origin).origin === window.location.origin`.
- **References:** [OWASP Unvalidated Redirects](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)

---

### SEC-11 · Role cookie terpisah + sync tanpa revalidasi API

- **File:** `providers/auth-provider.tsx:114-124`, `233-238`
- **Severity:** **Medium**
- **Problem:** Role disimpan di cookie `du_auth_role` terpisah. Handler `syncAuthState` membaca cookie user tanpa hit API — race dengan tab lain atau manipulasi cookie sebelum event selesai.
- **Evidence:** `setUser(getAuthUser())` on `AUTH_CHANGE_EVENT` without API call.
- **Fix:** Derive role hanya dari JWT claims atau response `GET /user/data`; jangan persist role di cookie terpisah.
- **References:** OWASP Session Management

---

### SEC-12 · super_admin dinormalisasi ke student

- **File:** `providers/auth-provider.tsx:53-56`
- **Severity:** **Medium**
- **Problem:** `normalizeRole('super_admin')` → `'student'`. Super admin kehilangan akses route admin di FE meskipun BE mengizinkan.
- **Evidence:** Whitelist hanya `admin | mentor | student`.
- **Fix:** Map `super_admin` → `admin` (atau role enum lengkap selaras BE).
- **References:** OWASP Broken Access Control (denial of legitimate access)

---

### SEC-13 · Forgot / reset password tidak fungsional

- **File:** `pages/auth/ForgotPass.tsx:13-16`, `pages/auth/ResetPass.tsx:24-28`
- **Severity:** **Medium**
- **Problem:** Halaman menampilkan success UI tanpa API call. User percaya password direset; token reset tidak pernah divalidasi ke BE.
- **Evidence:** `setSubmitted(true)` only; no fetch.
- **Fix:** Wire ke endpoint BE saat tersedia; sampai itu disable route atau tampilkan "Coming soon".
- **References:** OWASP Authentication

---

### SEC-14 · OAuth error message reflected

- **File:** `pages/auth/Oauth.tsx:19-20`
- **Severity:** **Low**
- **Problem:** `toast.error(decodeURIComponent(error))` — jika attacker kontrol query `?error=`, pesan arbitrary ditampilkan (phishing UX).
- **Fix:** Map error codes ke pesan statis; jangan render raw error string.
- **References:** OWASP XSS (DOM-based, limited)

---

### SEC-15 · createPayment tanpa schema validation

- **File:** `services/payment.ts:69-71`
- **Severity:** **Low**
- **Problem:** Parameter typed `unknown` — tidak ada Zod di client sebelum POST.
- **Fix:** `createPaymentSchema.parse(paymentData)` selaras kontrak BE.
- **References:** security-review Input Validation

---

### SEC-16 · SameSite=Lax (bukan Strict)

- **File:** `providers/auth-provider.tsx:96-104`
- **Severity:** **Low**
- **Problem:** Cookie auth `sameSite: 'lax'` — CSRF via top-level POST dari site lain masih mungkin dalam edge cases.
- **Fix:** `SameSite=Strict` jika flow OAuth cross-site masih compatible.
- **References:** OWASP CSRF

---

### SEC-17 · Tidak ada Content-Security-Policy

- **File:** `vite.config.ts`, `index.html`
- **Severity:** **Low** (defense in depth)
- **Problem:** Tidak ada CSP header di build FE. XSS impact maximized tanpa CSP backup.
- **Fix:** Tambah CSP via nginx/CDN; start strict, loosen hanya jika perlu.
- **References:** OWASP CSP Cheat Sheet

---

### SEC-18 · Admin dapat akses semua route mentor

- **File:** `App.tsx:304-355`
- **Severity:** **Low** (by design?)
- **Problem:** Mentor routes allow `roles: ["mentor", "admin"]`. Admin melihat/edit submission mentor tanpa audit trail khusus.
- **Fix:** Konfirmasi product intent; jika tidak, batasi admin ke route admin saja.
- **References:** OWASP Authorization

---

## Positif (sudah benar)

| Area | Implementasi |
|------|--------------|
| Protected file parse | `parse-protected-file-reference.ts` whitelist origin backend |
| Batch file limit | Max 50 objects per request |
| Avatar upload | Zod: type whitelist + 5MB max |
| Auth forms | `loginSchema`, `registerSchema` via Zod |
| Query state enum | `useQueryStateEnum` whitelist values |
| Video embed | `getEmbedUrl()` whitelist YouTube/Vimeo only |
| Object URL cleanup | `revokeObjectURL` di download + display-url |
| Route lazy + guard | Protected routes wrapped `RouteGuard` |

---

## Test Plan Manual (Security)

```markdown
### SEC-05 Module viewer
1. Logout → buka /course/{uid}/view?lesson={lessonUid}
2. Expected: 401/403 dari API atau redirect login

### SEC-06 Payment tampering
1. Intercept POST /payment di DevTools
2. Ubah amount ke 1000
3. Expected: BE reject atau charge harga asli

### SEC-07 Payment IDOR
1. Login student A → copy ?reference= dari payment
2. Login student B → buka URL yang sama
3. Expected: 403 / not found

### SEC-09 Invoice URL
1. Mock invoice_url = https://webhook.site/xxx di response API
2. Klik download
3. Expected: FE reject; Bearer TIDAK terkirim ke host luar

### SEC-02 XSS
1. Simpan lesson content `<img src=x onerror=alert(1)>` sebagai mentor
2. Buka sebagai student
3. Expected: script tidak dieksekusi (setelah fix DOMPurify)
```

---

*Lihat [action-backlog.md](./action-backlog.md) untuk tracking perbaikan.*
