# Security Review — Web DU Frontend

Living document hasil audit keamanan halaman di `src/pages/` dan infrastruktur auth/data terkait.

**Branch:** `features/frontend-sapto`  
**Terakhir diperbarui:** 18 Juni 2026  
**Metode:** Analisis statis codebase (`find-bugs` + `security-review` checklist OWASP)

---

## Ringkasan Eksekutif

| Area | Rating | Ringkasan |
|------|--------|-----------|
| **Autentikasi & session** | 🟠 Perlu perbaikan | JWT di cookie JS-readable (`js-cookie`), bukan `httpOnly`; OAuth token lewat query string |
| **Autorisasi route** | 🟡 Cukup | `RouteGuard` role-based; proteksi utama di BE; beberapa route publik perlu verifikasi BE |
| **XSS** | 🟡 Perbaikan FE | `DOMPurify` via `SanitizedHtml` / `sanitizeRichHtml()` di 8 komponen |
| **Payment & file proxy** | 🟡 Partial | SEC-09 fixed (reject URL non-backend); amount client-side masih butuh BE |
| **Input validation** | 🟢 Baik | Zod di auth, profil, avatar; nuqs enum whitelist |
| **CSRF / headers** | 🟡 Cukup | `SameSite=Lax`; tidak ada CSP di Vite/nginx (verifikasi infra) |
| **Secrets** | 🟢 Bersih | Tidak ada hardcoded API key di `src/` |

**Prioritas sprint berikutnya:** Koordinasi BE via [be-coordination.md](./be-coordination.md) — SEC-06, SEC-07, SEC-01, SEC-03. FE follow-up di [fe-readiness.md](./fe-readiness.md) setelah BE merge.

---

## Daftar Isi

| Dokumen | Isi |
|---------|-----|
| [**pages-security-matrix.md**](./pages-security-matrix.md) | Matriks keamanan per halaman: auth, input, API, risiko |
| [**audit-report.md**](./audit-report.md) | Temuan lengkap dengan severity, evidence, dan rekomendasi fix |
| [**action-backlog.md**](./action-backlog.md) | Backlog SEC-01…24 prioritas P0–P3 + checklist verifikasi |
| [**be-coordination.md**](./be-coordination.md) | **Handoff BE** — kontrak API, acceptance test, tanpa ubah kode BE dari FE |
| [**fe-readiness.md**](./fe-readiness.md) | Rencana perubahan FE setelah BE merge per SEC |

---

## Halaman Kritis (prioritas audit)

1. **`/auth/oauth/callback`** — token JWT di URL (referrer/history leak)
2. **`/auth/login`** — open redirect via `location.state.from`
3. **`/checkout/:courseUid`** — amount & enrollment client-driven
4. **`/student/transactions/payment`** — query `reference` / `merchant_ref` (IDOR jika BE lemah)
5. **`/course/:courseUid/view`** — route publik, konten lesson HTML raw
6. **`/admin/*`** — manajemen user, moderasi, transaksi
7. **`/profile`** — avatar upload, ganti password

---

## Checklist OWASP (ringkas)

| Kategori | Status | Catatan |
|----------|--------|---------|
| Injection | ✅ Bersih | SPA React; tidak ada SQL/command di FE |
| XSS | 🟡 Partial | Rich HTML + payment instructions disanitize (`isomorphic-dompurify`) |
| Authentication | 🟠 Temuan | Cookie non-httpOnly; OAuth token di URL |
| Authorization / IDOR | 🟡 Partial | RouteGuard FE; IDOR payment/invoice butuh BE |
| CSRF | 🟡 Partial | Bearer token + SameSite=Lax; tidak ada CSRF token eksplisit |
| Session | 🟠 Temuan | Role disimpan terpisah di cookie |
| Cryptography | ✅ N/A FE | Tidak ada crypto custom di browser |
| Information disclosure | 🟡 Partial | Error toast bisa bawa pesan API mentah |
| DoS | 🟡 Partial | Batch file max 50; tidak ada rate limit di FE |
| Business logic | 🟠 Temuan | Payment amount dari client |

---

## Cara Menggunakan Dokumen Ini

| Peran | Mulai dari |
|-------|------------|
| **FE Senior** | [action-backlog.md](./action-backlog.md) P0 → [be-coordination.md](./be-coordination.md) handoff BE |
| **FE Junior** | [pages-security-matrix.md](./pages-security-matrix.md) halaman yang sedang dikerjakan |
| **BE** | **[be-coordination.md](./be-coordination.md)** — kontrak + curl tests (FE tidak ubah BE) |
| **QA** | Checklist verifikasi di action-backlog + skenario di audit-report |

---

## Sinkronisasi

| Dokumen terkait | Path |
|-----------------|------|
| Matriks halaman (integrasi) | [../progress/integration-status.md](../progress/integration-status.md) |
| QA status | [../qa/qa-status-board.md](../qa/qa-status-board.md) |
| Performance audit | [../performance/README.md](../performance/README.md) |
| Revisi file | [../progress/files-to-revise.md](../progress/files-to-revise.md) |

---

*Update action-backlog setiap kali temuan ditutup atau ada audit ulang.*
