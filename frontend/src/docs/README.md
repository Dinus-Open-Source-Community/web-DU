# Dokumentasi Frontend — Web DU

Indeks dokumentasi aktif untuk integrasi FE↔BE, QA, progress developer, audit performa, dan keamanan.

**Branch:** `features/frontend-sapto`  
**Terakhir diperbarui:** 18 Juni 2026

---

## Mulai dari Mana?

| Peran | Mulai dari |
|-------|------------|
| **FE Developer** | [progress/revision-guide.md](./progress/revision-guide.md) → [progress/files-to-revise.md](./progress/files-to-revise.md) |
| **QA** | [qa/qa-status-board.md](./qa/qa-status-board.md) → [progress/qa-checklist.md](./progress/qa-checklist.md) |
| **PM / Reviewer** | [progress/integration-status.md](./progress/integration-status.md) |
| **Security** | [security/README.md](./security/README.md) |
| **Performance** | [performance/README.md](./performance/README.md) |

---

## Struktur Folder

```
docs/
├── README.md                 ← Anda di sini
├── progress/                 ← Status integrasi, panduan revisi, arsitektur
├── qa/                       ← Temuan QA & status board
├── security/                 ← Audit keamanan
└── performance/              ← Audit performa
```

---

## Progress & Integrasi

| Dokumen | Isi |
|---------|-----|
| [progress/README.md](./progress/README.md) | Ringkasan kemajuan & indeks progress |
| [progress/integration-status.md](./progress/integration-status.md) | **Status FE↔BE** — fitur live, gap, prioritas |
| [progress/revision-guide.md](./progress/revision-guide.md) | Panduan revisi P0–P3 untuk developer |
| [progress/files-to-revise.md](./progress/files-to-revise.md) | Peta file yang perlu diubah per task |
| [progress/qa-checklist.md](./progress/qa-checklist.md) | Skenario uji manual regression |
| [progress/architecture.md](./progress/architecture.md) | Struktur folder & pola arsitektur |

---

## QA

| Dokumen | Isi |
|---------|-----|
| [qa/README.md](./qa/README.md) | Indeks QA & cara melaporkan bug |
| [qa/qa-status-board.md](./qa/qa-status-board.md) | Papan status bug (living doc) |
| [qa/qa-global.md](./qa/qa-global.md) | Temuan global (revalidate, dll.) |
| [qa/qa-course.md](./qa/qa-course.md) | Temuan course student |

---

## Audit

| Area | Indeks |
|------|--------|
| Keamanan | [security/README.md](./security/README.md) |
| Performa | [performance/README.md](./performance/README.md) |

---

## Referensi Kode

| Area | Lokasi |
|------|--------|
| Halaman | `src/pages/` |
| Route app | `src/App.tsx`, `lib/routes.ts` |
| API path FE | `src/services/api-path.ts` |
| Service layer | `src/services/` |
| Validator payload | `src/lib/validator/` |
