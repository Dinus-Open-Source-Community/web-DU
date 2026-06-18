# Security Action Backlog

Backlog prioritas hasil audit keamanan halaman & infrastruktur auth. Format mengikuti `performance/action-backlog.md`.

**Branch:** `features/frontend-sapto` · **Review date:** 18 Juni 2026

---

## Rating Distribution

| Severity | Count | Target |
|----------|-------|--------|
| 🔴 P0 Critical | 0 | 0 |
| 🟠 P1 High | 3 | 0 open |
| 🟡 P2 Medium | 6 | ≤ 3 |
| 🟢 P3 Low | 5 | Backlog |

---

## P1 — High (perbaiki segera)

| ID | Task | Temuan | Aksi | Owner | Status |
|----|------|--------|------|-------|--------|
| SEC-01 | httpOnly session cookie | JWT di `js-cookie` | BE set cookie httpOnly; FE hapus `Cookies.set(TOKEN)` | BE + FE | 🔴 Open |
| SEC-02 | Sanitize rich HTML | XSS stored di lesson/submission | `DOMPurify` helper + pakai di 8 komponen | FE | 🟢 Done |
| SEC-03 | OAuth token di URL | `?token=` di callback | Authorization code flow atau hash fragment | BE + FE | 🟡 Partial — FE strip query via `history.replaceState` |
| SEC-06 | Payment amount client-side | `use-checkout` kirim amount | BE validate; FE kirim minimal payload | BE + FE | 🔴 Open |
| SEC-09 | Download URL fallback | Bearer ke URL arbitrary | Reject jika parse null | FE | 🟢 Done |

---

## P2 — Medium

| ID | Task | Temuan | Aksi | Owner | Status |
|----|------|--------|------|-------|--------|
| SEC-04 | Payment instructions HTML | Tripay steps XSS | Sanitize atau plain text | FE | 🟢 Done |
| SEC-05 | Public module viewer | Route tanpa guard | Protected route + verify BE 403 | FE + BE | 🟢 Done (FE) — BE verify masih wajib |
| SEC-07 | Payment IDOR | `?reference=` arbitrer | BE enforce ownership; FE 403 UX | BE | 🔴 Open |
| SEC-08 | Invoice user_id param | Query user_id | BE derive from JWT | BE | 🔴 Open |
| SEC-10 | Open redirect login | `state.from` unvalidated | `isSafeInternalPath()` helper | FE | 🟢 Done |
| SEC-11 | Role cookie terpisah | syncAuthState tanpa API | Role dari JWT/API only | FE | 🔴 Open |
| SEC-12 | super_admin → student | normalizeRole | Map super_admin → admin | FE | 🟢 Done |
| SEC-13 | Reset password mock | Success UI palsu | Wire API atau disable route | BE + FE | 🔴 Open |

---

## P3 — Low / Defense in depth

| ID | Task | Temuan | Aksi | Owner | Status |
|----|------|--------|------|-------|--------|
| SEC-14 | OAuth error reflection | Raw error in toast | Static error map | FE | 🟢 Done |
| SEC-15 | Payment payload schema | `unknown` type | Zod schema createPayment | FE | 🟢 Done (`createPaymentRequestSchema`) |
| SEC-16 | SameSite Strict | Lax cookies | Strict jika OAuth OK | BE + FE | 🔴 Open |
| SEC-17 | CSP headers | Tidak ada di FE build | nginx/CDN CSP policy | DevOps | 🔴 Open |
| SEC-18 | Admin on mentor routes | Broad role access | Konfirmasi product + audit log | PM + FE | 🔴 Open |

---

## Checklist Verifikasi (post-fix)

Centang setelah fix + retest manual:

```markdown
- [ ] SEC-01: document.cookie tidak expose du_access_token (httpOnly)
- [x] SEC-02: Payload XSS `<script>alert(1)</script>` tidak dieksekusi di lesson viewer
- [ ] SEC-03: Network tab OAuth callback — token tidak di query string (full fix butuh BE code flow)
- [ ] SEC-06: Tamper amount di DevTools → BE reject
- [x] SEC-09: invoice_url eksternal → FE error, no request ke host luar
- [x] SEC-05: Guest /course/:uid/view → login redirect (RouteGuard)
- [ ] SEC-07: Student B tidak bisa lihat reference student A
- [x] SEC-10: Login redirect //evil.com → blocked
- [x] SEC-12: super_admin login → akses /admin/dashboard OK
```

---

## Koordinasi FE ↔ BE

**Dokumen handoff lengkap:** [be-coordination.md](./be-coordination.md)  
**Rencana FE setelah BE:** [fe-readiness.md](./fe-readiness.md)

| ID | FE (setelah BE) | BE (implementasi) |
|----|-----------------|-------------------|
| SEC-01 | Hapus js-cookie token | Set-Cookie httpOnly on login/OAuth |
| SEC-03 | POST code exchange | OAuth redirect + `/auth/oauth/exchange` |
| SEC-06 | Slim payload checkout | Recalculate price server-side + enrollment ownership |
| SEC-07 | 403 UX payment page | Filter payment by auth user di `/payment/tripay` |
| SEC-08 | Hapus user_id dari query | Derive from JWT |
| SEC-05 | — (RouteGuard ✅) | Regression test lesson 403 |
| SEC-13 | Wire forgot/reset forms | Implement endpoints |

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

**Sprint 1 (1 minggu):** SEC-09, SEC-02, SEC-10 — pure FE, high impact ✅ **Done (18 Jun 2026)**  
**Sprint 2 (2 minggu):** SEC-01, SEC-03, SEC-06, SEC-07 — **[be-coordination.md](./be-coordination.md)** handoff ke BE  
**Sprint 3:** SEC-08, SEC-13, SEC-05 verify — FE follow-up via [fe-readiness.md](./fe-readiness.md)

---

*Update status kolom saat PR merge.*
