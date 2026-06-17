# Security Action Backlog

Backlog prioritas hasil audit keamanan halaman & infrastruktur auth. Format mengikuti `performance/action-backlog.md`.

**Branch:** `features/frontend-sapto` · **Review date:** 17 Juni 2026

---

## Rating Distribution

| Severity | Count | Target |
|----------|-------|--------|
| 🔴 P0 Critical | 0 | 0 |
| 🟠 P1 High | 5 | 0 open |
| 🟡 P2 Medium | 8 | ≤ 3 |
| 🟢 P3 Low | 5 | Backlog |

---

## P1 — High (perbaiki segera)

| ID | Task | Temuan | Aksi | Owner | Status |
|----|------|--------|------|-------|--------|
| SEC-01 | httpOnly session cookie | JWT di `js-cookie` | BE set cookie httpOnly; FE hapus `Cookies.set(TOKEN)` | BE + FE | 🔴 Open |
| SEC-02 | Sanitize rich HTML | XSS stored di lesson/submission | `DOMPurify` helper + pakai di 7 komponen | FE | 🔴 Open |
| SEC-03 | OAuth token di URL | `?token=` di callback | Authorization code flow atau hash fragment | BE + FE | 🔴 Open |
| SEC-06 | Payment amount client-side | `use-checkout` kirim amount | BE validate; FE kirim minimal payload | BE + FE | 🔴 Open |
| SEC-09 | Download URL fallback | Bearer ke URL arbitrary | Reject jika parse null | FE | 🔴 Open |

---

## P2 — Medium

| ID | Task | Temuan | Aksi | Owner | Status |
|----|------|--------|------|-------|--------|
| SEC-04 | Payment instructions HTML | Tripay steps XSS | Sanitize atau plain text | FE | 🔴 Open |
| SEC-05 | Public module viewer | Route tanpa guard | Protected route + verify BE 403 | FE + BE | 🔴 Open |
| SEC-07 | Payment IDOR | `?reference=` arbitrer | BE enforce ownership; FE 403 UX | BE | 🔴 Open |
| SEC-08 | Invoice user_id param | Query user_id | BE derive from JWT | BE | 🔴 Open |
| SEC-10 | Open redirect login | `state.from` unvalidated | `isSafeInternalPath()` helper | FE | 🔴 Open |
| SEC-11 | Role cookie terpisah | syncAuthState tanpa API | Role dari JWT/API only | FE | 🔴 Open |
| SEC-12 | super_admin → student | normalizeRole | Map super_admin → admin | FE | 🔴 Open |
| SEC-13 | Reset password mock | Success UI palsu | Wire API atau disable route | BE + FE | 🔴 Open |

---

## P3 — Low / Defense in depth

| ID | Task | Temuan | Aksi | Owner | Status |
|----|------|--------|------|-------|--------|
| SEC-14 | OAuth error reflection | Raw error in toast | Static error map | FE | 🔴 Open |
| SEC-15 | Payment payload schema | `unknown` type | Zod schema createPayment | FE | 🔴 Open |
| SEC-16 | SameSite Strict | Lax cookies | Strict jika OAuth OK | BE + FE | 🔴 Open |
| SEC-17 | CSP headers | Tidak ada di FE build | nginx/CDN CSP policy | DevOps | 🔴 Open |
| SEC-18 | Admin on mentor routes | Broad role access | Konfirmasi product + audit log | PM + FE | 🔴 Open |

---

## Checklist Verifikasi (post-fix)

Centang setelah fix + retest manual:

```markdown
- [ ] SEC-01: document.cookie tidak expose du_access_token (httpOnly)
- [ ] SEC-02: Payload XSS `<script>alert(1)</script>` tidak dieksekusi di lesson viewer
- [ ] SEC-03: Network tab OAuth callback — token tidak di query string
- [ ] SEC-06: Tamper amount di DevTools → BE reject
- [ ] SEC-09: invoice_url eksternal → FE error, no request ke host luar
- [ ] SEC-05: Guest /course/:uid/view → 403 atau login redirect
- [ ] SEC-07: Student B tidak bisa lihat reference student A
- [ ] SEC-10: Login redirect //evil.com → blocked
- [ ] SEC-12: super_admin login → akses /admin/dashboard OK
```

---

## Koordinasi FE ↔ BE

| ID | FE | BE |
|----|----|----|
| SEC-01 | Hapus js-cookie token | Set-Cookie httpOnly on login/OAuth |
| SEC-03 | Tukar code, bukan token URL | OAuth code endpoint |
| SEC-06 | Hapus amount dari payload (optional) | Recalculate price server-side |
| SEC-07 | Handle 403 UI | Filter payment by auth user |
| SEC-08 | Hapus user_id dari query | Derive from JWT |
| SEC-05 | RouteGuard on viewer | 403 on lesson without enrollment |
| SEC-13 | POST forgot/reset | Implement endpoints |

---

## Mapping ke QA / Progress

| Security ID | QA / Progress terkait |
|-------------|----------------------|
| SEC-09 | QA-C-07 download invoice 401 |
| SEC-02 | Course editor rich text — review BE sanitize |
| SEC-05 | Course preview access — qa-course |
| SEC-01 | Gambar 401 fix (file proxy) — sudah partial |

---

## Sprint Rekomendasi

**Sprint 1 (1 minggu):** SEC-09, SEC-02, SEC-10 — pure FE, high impact  
**Sprint 2 (2 minggu):** SEC-01, SEC-03, SEC-06 — butuh BE  
**Sprint 3:** SEC-05, SEC-07, SEC-08, SEC-13 — access control end-to-end

---

*Update status kolom saat PR merge.*
