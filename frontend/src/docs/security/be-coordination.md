# Koordinasi Keamanan FE ↔ BE

Dokumen handoff untuk tim **Backend**. Frontend **tidak akan mengubah kode backend** — spesifikasi di bawah ini menjadi kontrak implementasi BE. Setelah BE merge, FE akan follow-up di PR terpisah (lihat [fe-readiness.md](./fe-readiness.md)).

**Branch FE:** `features/frontend-sapto` · **Tanggal:** 18 Juni 2026  
**Referensi audit:** [audit-report.md](./audit-report.md) · [action-backlog.md](./action-backlog.md)

---

## Ringkasan status

| ID | Severity | Owner sekarang | Status FE | Butuh BE |
|----|----------|----------------|-----------|----------|
| SEC-01 | High | BE + FE | Menunggu BE | ✅ httpOnly session cookie |
| SEC-03 | High | BE + FE | Partial (strip query) | ✅ OAuth redirect + JWT issuance |
| SEC-06 | High | BE + FE | Menunggu BE | ✅ Validasi amount server-side |
| SEC-07 | Medium | BE (+ FE UX) | Menunggu BE | ✅ Ownership check payment tripay |
| SEC-05 | Medium | BE verify | RouteGuard ✅ | ⚠️ Verifikasi enrollment (BE sudah ada sebagian) |
| SEC-08 | Medium | BE | Menunggu BE | ✅ Derive `user_id` dari JWT |
| SEC-11 | Medium | FE (+ BE ideal) | Menunggu BE | ⚠️ Role dari JWT / session response |
| SEC-13 | Medium | BE + FE | Menunggu BE | ✅ Endpoint forgot/reset password |
| SEC-16 | Low | BE + FE | Menunggu BE | SameSite=Strict pada session cookie |
| SEC-17 | Low | DevOps | N/A | CSP di nginx/CDN |

**Sudah selesai di FE (Sprint 1):** SEC-02, SEC-04, SEC-09, SEC-10, SEC-12, SEC-14, SEC-05 (RouteGuard)

---

## Urutan implementasi BE yang disarankan

1. **SEC-06 + SEC-07** — payment integrity & IDOR (impact finansial)
2. **SEC-01 + SEC-16** — session cookie hardening
3. **SEC-03** — OAuth flow selaras FE
4. **SEC-08** — invoice query simplification
5. **SEC-13** — auth recovery endpoints
6. **SEC-05** — regression test enrollment (BE likely sudah OK)

---

## SEC-06 · Payment amount harus dihitung server-side

### Perilaku saat ini (BE)

File: `backend/internal/service/payment.go` — `CreatePayment`

- `req.Amount` dari client **langsung** dipakai untuk signature Tripay dan penyimpanan DB.
- Enrollment dicek status (active/pending) tapi **tidak** dicek kepemilikan enrollment vs JWT user.
- Harga course **tidak** di-resolve ulang dari database.

### Perilaku saat ini (FE)

File: `frontend/src/hooks/use-checkout.ts`

```typescript
amount: paymentAmount, // dari course?.price di client
order_items: [{ price: paymentAmount, ... }]
```

### Kontrak BE yang diminta

**POST `/payment/create`**

1. Resolve `enrollment_uid` → pastikan `enrollment.user_uid == auth.uid` dari JWT.
2. Load course price dari relasi enrollment → course (gunakan `price` / `price_strike` sesuai aturan bisnis).
3. **Abaikan** `amount` client **atau** validasi exact match dengan harga DB; jika mismatch → `400`:

```json
{
  "success": false,
  "message": "Payment amount does not match course price",
  "error": "amount_mismatch"
}
```

4. `order_items[].price` di-generate server-side (FE boleh kirim kosong/minimal nanti).

### Acceptance test

```bash
# Student A — enrollment valid, amount ditamper
curl -X POST "$BASE/payment/create" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"enrollment_uid":"<uid>","method":"QRIS","amount":1000,"order_items":[...],"return_url":"..."}'
# Expected: 400 amount_mismatch (jika course price > 1000)

# Student B — enrollment milik A
curl -X POST "$BASE/payment/create" \
  -H "Authorization: Bearer $TOKEN_B" \
  -d '{"enrollment_uid":"<enrollment_A>",...}'
# Expected: 403 forbidden
```

### FE follow-up (setelah BE)

- Hapus `amount` / `order_items[].price` dari payload (opsional) di `use-checkout.ts`.
- Update `createPaymentRequestSchema` — `amount` jadi optional jika BE tidak lagi menerima field tersebut.

---

## SEC-07 · Payment detail IDOR (`GET /payment/tripay`)

### Perilaku saat ini (BE)

File: `backend/internal/service/payment.go` — `GetPaymentTripayFunc`

- Menerima `?reference=` / `?merchant_ref=` lalu **proxy langsung ke Tripay API**.
- **Tidak** memverifikasi bahwa payment tersebut milik user dari JWT.
- Student B dapat melihat detail payment Student A jika tahu reference.

### Kontrak BE yang diminta

**GET `/payment/tripay`**

1. Wajib auth JWT (middleware sudah ada — pastikan route protected).
2. Lookup payment di DB by `reference` atau `merchant_ref`.
3. Verifikasi ownership:
   - Payment → enrollment → `enrollment.user_uid == auth.uid`, **atau**
   - Role admin/mentor dengan akses course yang sesuai.
4. Jika tidak authorized → `403`:

```json
{
  "success": false,
  "message": "Access denied",
  "error": "payment_forbidden"
}
```

5. Response ke FE tetap format Tripay envelope yang ada (jangan break `mapTripayPaymentDetail`).

### Acceptance test

```bash
# Student A buat payment → dapat reference R_A
# Student B:
curl "$BASE/payment/tripay?reference=$R_A" -H "Authorization: Bearer $TOKEN_B"
# Expected: 403
```

### FE follow-up (setelah BE)

- Handle `403` di `TransactionPayment.tsx` / `usePaymentDetail` → tampilkan "Akses ditolak" + link ke `/student/transactions`.
- File: `frontend/src/services/payment.ts`, `pages/student/TransactionPayment.tsx`.

---

## SEC-01 · Session httpOnly cookie

### Perilaku saat ini

| Layer | Implementasi |
|-------|--------------|
| BE | `POST /login` → JWT di **JSON body** (`data.token`) |
| FE | `js-cookie` → `du_access_token` (JS-readable) + `Authorization: Bearer` header |

### Kontrak BE yang diminta

**POST `/login`**, **POST `/register`**, **OAuth callback** (setelah SEC-03):

Response header:

```http
Set-Cookie: du_access_token=<jwt>; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

Opsi A (disarankan): Body **tidak** lagi mengembalikan `token` (hanya `expires_at`, user meta).  
Opsi B (transisi): Body masih kirim token + cookie httpOnly (FE deprecate js-cookie bertahap).

**Semua endpoint auth** harus menerima cookie **atau** `Authorization: Bearer` (backward compatible selama transisi).

CORS: pastikan `Access-Control-Allow-Credentials: true` + `Allow-Origin` explicit (bukan `*`).

### Acceptance test

```bash
curl -i -X POST "$BASE/login" -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}'
# Expected: Set-Cookie dengan HttpOnly; Secure (prod)

# Request berikutnya tanpa Authorization header, dengan cookie:
curl "$BASE/user/data" -b "du_access_token=..."
# Expected: 200
```

### FE follow-up (setelah BE)

- Hapus `Cookies.set(AUTH_COOKIE_TOKEN)` di `auth-provider.tsx`.
- `getApiAuthToken()` → return `null`; andalkan `withCredentials: true` di axios (sudah ada).
- Hapus `du_auth_role` cookie terpisah (SEC-11) — role dari `GET /user/data`.

---

## SEC-03 · OAuth — hapus token dari URL

### Gap FE ↔ BE saat ini

| Komponen | Perilaku |
|----------|----------|
| FE `Oauth.tsx` | Expect `?token=` & `?expires_at=` di `/auth/oauth/callback` |
| BE `CallbackHandler` | Return **JSON** user profile — **tanpa JWT**, **tanpa redirect** ke FE |

OAuth Google saat ini **tidak selaras** dengan FE callback page.

### Kontrak BE yang diminta (disarankan)

**Flow authorization code (server-side):**

1. `GET /oauth/google` → redirect Google (sudah ada).
2. `GET /oauth/google/callback` (BE):
   - Validasi state (sudah ada).
   - Create/update user (sudah ada).
   - Generate JWT.
   - **Redirect 302** ke FE:

```
{FRONTEND_BASE_URL}/auth/oauth/callback?code={one_time_code}
```

   **Jangan** kirim JWT di query string.

3. **POST `/auth/oauth/exchange`** (endpoint baru, public):

```json
// Request
{ "code": "one-time-code-from-redirect" }

// Response 200
{
  "success": true,
  "data": {
    "expires_at": "2026-06-19T12:00:00Z"
  }
}
// + Set-Cookie httpOnly (SEC-01)
```

One-time code: TTL ≤ 60s, single use, stored server-side.

**Alternatif minimal:** Redirect dengan `#token=` (fragment — tidak terkirim ke server logs) + FE baca hash. Kurang ideal vs code exchange.

### Acceptance test

- Network tab: callback URL **tidak** mengandung JWT di query string.
- `document.cookie` di browser **tidak** expose token setelah login OAuth.

### FE follow-up (setelah BE)

- Rewrite `Oauth.tsx`: baca `?code=` → `POST /auth/oauth/exchange` → redirect dashboard.
- Hapus `signInWithToken` dari query param flow.

---

## SEC-05 · Module viewer — verifikasi enrollment (BE)

### FE (sudah)

- Route `/course/:uid/view` → `RouteGuard` roles `student | mentor | admin`.

### BE (perlu verifikasi)

File: `backend/internal/service/lessons.go`, `lesson_access.go`

- `canReadCourseByRole` sudah cek enrollment untuk student.
- Mentor/admin bypass enrollment check (by design).

### Yang diminta BE

1. **Regression test:** Student **tanpa** enrollment → `GET /lessons?module_id=` → `403`.
2. Guest **tanpa** JWT → `401`.
3. Konfirmasi dokumentasi Swagger selaras.

Tidak perlu perubahan kode jika test di atas sudah pass.

---

## SEC-08 · Invoice — derive `user_id` dari JWT

### Perilaku saat ini (BE)

File: `backend/internal/service/course.go` — `GetInvoiceURLFunc`

- Query wajib: `enrollment_id`, `user_id`, `course_id`.
- Authorization: JWT user harus match `enrollment.user_uid` (untuk self) — **relatif aman**.
- `user_id` query **redundant** dan menambah superficie IDOR jika logic berubah.

### Kontrak BE yang diminta

**GET `/invoices/url`**

- Parameter wajib: `enrollment_id`, `course_id` (atau cukup `enrollment_id` saja).
- `user_id` **diabaikan** jika dikirim; derive ownership dari JWT + enrollment record.
- Response tetap `{ "invoice_url": "..." }`.

Backward compatible: terima `user_id` lama tapi ignore.

### FE follow-up (setelah BE)

- Hapus `user_id` dari `use-invoice-download.ts` dan `getInvoiceUrlQuerySchema`.

---

## SEC-11 · Role cookie terpisah

### Perilaku saat ini (FE)

- Cookie `du_auth_role` disimpan terpisah dari token.
- `syncAuthState` baca cookie tanpa revalidasi API.

### Kontrak BE

- Tidak wajib endpoint baru jika SEC-01 + `GET /user/data` selalu return role terbaru.
- JWT claims boleh include `role` (optional) untuk FE bootstrap cepat.

### FE follow-up (setelah SEC-01)

- Hapus `AUTH_COOKIE_ROLE`, `AUTH_COOKIE_USER` dari js-cookie.
- Role **hanya** dari `GET /user/data` response atau JWT decode (read-only, bukan source of truth).

---

## SEC-13 · Forgot / reset password

### Perilaku saat ini

| Route | FE | BE |
|-------|----|----|
| `/auth/forgot-password` | Success UI palsu | **Tidak ada endpoint** |
| `/auth/reset-password` | Success UI palsu | **Tidak ada endpoint** |

### Kontrak BE yang diminta

**POST `/auth/forgot-password`**

```json
// Request
{ "email": "user@example.com" }

// Response 200 (selalu generic — anti user enumeration)
{ "success": true, "message": "If the email exists, a reset link has been sent." }
```

**POST `/auth/reset-password`**

```json
// Request
{ "token": "<from-email-link>", "password": "...", "confirm_password": "..." }

// Response 200
{ "success": true, "message": "Password reset successful" }

// Response 400 — token invalid/expired
{ "success": false, "message": "Invalid or expired reset token" }
```

Rate limit: max 5 req/email/jam untuk forgot-password.

### FE follow-up (setelah BE)

- Wire `ForgotPass.tsx` → `POST /auth/forgot-password`.
- Wire `ResetPass.tsx` → baca `?token=` → `POST /auth/reset-password`.
- Hapus mock `setSubmitted(true)` tanpa API.

---

## SEC-16 · SameSite=Strict

Terintegrasi dengan SEC-01. Cookie session:

```
SameSite=Strict; Secure; HttpOnly
```

**Catatan OAuth:** Jika Google redirect cross-site ke BE callback lalu BE redirect ke FE same-site, Strict aman. Verifikasi flow end-to-end sebelum deploy.

---

## SEC-17 · CSP (DevOps)

Bukan scope FE repo. Rekomendasi header di nginx/CDN:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.<domain>; frame-src https://www.youtube.com https://player.vimeo.com;
```

Koordinasikan dengan FE setelah DOMPurify deployed (SEC-02 ✅).

---

## Checklist koordinasi tim

### Backend

- [ ] SEC-06: amount + enrollment ownership di `CreatePayment`
- [ ] SEC-07: ownership check di `GetPaymentTripayFunc`
- [ ] SEC-01: httpOnly session cookie on login/register/OAuth
- [ ] SEC-03: OAuth redirect + code exchange (selaras FE callback)
- [ ] SEC-08: simplify `/invoices/url` params
- [ ] SEC-13: forgot/reset password endpoints
- [ ] SEC-05: confirm lesson 403 tests pass
- [ ] SEC-16: SameSite=Strict on session cookie
- [ ] Update Swagger (`backend/docs/swagger.yaml`)

### Frontend (setelah BE merge — lihat fe-readiness.md)

- [ ] Migrasi auth cookie (SEC-01, SEC-11)
- [ ] OAuth code exchange (SEC-03)
- [ ] Checkout payload slim (SEC-06)
- [ ] Payment 403 UX (SEC-07)
- [ ] Invoice query tanpa user_id (SEC-08)
- [ ] Wire forgot/reset password (SEC-13)

### QA bersama

Gunakan checklist di [action-backlog.md](./action-backlog.md) § Checklist Verifikasi.

---

## Kontak & tracking

| Peran | Action |
|-------|--------|
| **BE lead** | Pick items dari urutan implementasi; comment di PR dengan `SEC-XX` |
| **FE lead** | Monitor BE PR; trigger fe-readiness PR setelah kontrak terpenuhi |
| **QA** | Jalankan acceptance test curl + manual di checklist |

*Update dokumen ini ketika kontrak BE berubah atau item ditutup.*
