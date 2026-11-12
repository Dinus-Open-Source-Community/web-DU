# Laporan: Rebranding DKelas + Perbaikan Animasi Landing Page

**Tanggal:** 12 November 2026
**Repo:** web-DU (`frontend/`, `backend/`)
**Status:** Perubahan selesai & terverifikasi lokal. **Produksi belum ter-deploy dan API produksi sedang rusak.**

---

## 1. Ringkasan

| Item | Status |
|---|---|
| Rebranding "Doscom University"/"DU" → "DKelas"/"DK" (frontend + backend) | Selesai, build & test pass |
| Animasi landing hanya jalan sekali per page load | Selesai, build & lint pass |
| Docker lokal (frontend + backend) rebuild | Selesai, semua container Up |
| Deploy ke produksi `d-kelas.doscom.org` | **Belum** — bundle lama masih live |
| API produksi `/api-dkelas/api/*` | **Rusak** — balas 200 dengan body kosong |

Dampak ke pengguna: section **"Program Belajar"** dan **"Mentor Kami"** di landing produksi menampilkan state error ("Gagal Memuat Program Belajar" / "Gagal Memuat Mentor"), bukan karena bug komponen, melainkan karena API tidak mengembalikan JSON.

---

## 2. Perubahan yang Sudah Dikerjakan

### 2.1 Rebranding

**Frontend**
- `frontend/index.html` — `<title>`, meta description, OG/Twitter title → `DKelas`
- Komponen: `Navbar`, `Sidebar`, `Footer`, `AuthBrandMark`, `AuthLayouts`, `Login`, `Register`, `VerifyOtp`, `NavbarAccountHoverMenu`, `OauthButton`, `JoinedCourseCard`, `MentorDetailModal`, `Course`, `PopularCourse`, `GallerySection`, `SplashScreen`, gallery admin panel/dialog
- Chip logo navbar `DU` → `DK`
- Prefix default kode redeem `DU` → `DK`
- Label dekoratif hero `doscom-learning` → `dkelas-learning`

**Backend**
- `backend/main.go` — Swagger title/description → `DKelas Backend`
- `internal/mailer/mailer.go` + 2 template email — sender name, subject, body, footer → `DKelas` / `DKELAS`
- `internal/service/otp.go` — pesan verifikasi → `DKelas`
- `internal/service/redeem_code.go` — prefix default `"DU"` → `"DK"`
- `internal/model/dto/register.go` — contoh → `User DK`
- `internal/model/entity/gallery.go` — komentar → `DKelas`
- `docs/` (swagger + external-redeem-api.md) disesuaikan

**Sengaja tidak diubah** (fungsional/eksternal, bukan brand situs):
- Email seed `@doscom.id` di `internal/database/seeder.go`
- Label `DOSCOM SSO` dan URL `sso-docs.doscom.org` — nama provider eksternal
- Social URL `doscomedia`, storage key `du-*` / `doscom-ui-theme`

### 2.2 Animasi Landing (sekali per page load)

- File baru `frontend/src/components/playful/LandingMotion.tsx` — flag level modul yang bertahan saat navigasi SPA dan reset saat refresh.
- `Home.tsx` dibungkus `LandingMotionProvider`.
- Gate diterapkan ke: `Reveal`, `HandUnderline`, parallax `CourseSection` & `GallerySection`.
- Semua `once={false}` dihapus agar reveal tidak replay saat scroll bolak-balik.
- **Ticker (`ScrollVelocityTape`) sengaja tidak di-gate** — harus tetap berjalan terus. Ini hasil koreksi setelah QA menemukan ticker ikut berhenti.

Perilaku akhir:
- Load pertama: animasi masuk + parallax + ticker jalan.
- Scroll ulang: tidak animate lagi.
- Pindah route lalu balik ke `/`: konten statis.
- Refresh: animasi jalan lagi.

### 2.3 Verifikasi Lokal

```
npm run build   → pass
npm run lint    → No issues found
go build ./...  → pass
go vet ./...    → pass
go test ./...   → 17 passed in 12 packages
```

Docker lokal sudah di-rebuild:
- `localhost/web-du-frontend:latest` — title `DKelas`, gate animasi aktif
- `localhost/web-du-backend:latest` — Swagger `DKelas Backend`
- Semua container `Up`

---

## 3. Blocker Produksi

### 3.1 API produksi balas body kosong

```
GET https://d-kelas.doscom.org/api-dkelas/api/courses?page=1&per_page=4
→ 200 OK, Content-Type: text/plain, Content-Length: 0

GET https://d-kelas.doscom.org/api-dkelas/api/mentor/all?page=1&per_page=4
→ 200 OK, body kosong

GET https://d-kelas.doscom.org/api-dkelas/api/swagger/doc.json
→ 200 OK, body kosong

GET http://localhost:8080/courses?page=1&per_page=4
→ 200 OK, application/json, 4736 bytes (backend lokal sehat)
```

Semua path di bawah `/api-dkelas/` dijawab nginx dengan `200` dan body 0 byte. Frontend menerima string kosong, `JSON.parse` gagal, React Query masuk `isError`, lalu fallback error tampil.

Sebagai pembanding, `https://d-kelas.doscom.org/api/courses` membalas HTML SPA — artinya prefix `/api-dkelas/` punya blok nginx sendiri, tetapi tidak meneruskan request ke backend.

### 3.2 Bundle produksi masih versi lama

- HTML produksi masih `<title>Doscom University — ...</title>`
- Asset aktif: `assets/index-KRptdf80.js`; build lokal sekarang `index-BFwTdVYz.js`

Jadi seluruh perubahan rebranding dan gate animasi **belum live**.

Catatan: base URL yang ter-hardcode di bundle prod sudah benar bentuknya:
`https://d-kelas.doscom.org/api-dkelas/api`. Masalahnya di proxy, bukan di env build.

---

## 4. Rekomendasi Perbaikan

### 4.1 Perbaiki nginx di server

Repo tidak menyimpan konfigurasi nginx (tidak ada file `*.conf` berisi `proxy_pass` atau `api-dkelas`), jadi perubahan harus di server.

```nginx
location /api-dkelas/api/ {
    proxy_pass http://127.0.0.1:8080/;   # trailing slash = strip prefix /api-dkelas/api/
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    client_max_body_size 20m;            # upload avatar/galeri
}
```

Penting: `proxy_pass` **wajib** berakhir `/`. Backend Go mendaftarkan route di root (`/courses`, `/mentor/all`), bukan di `/api/...`.

Lalu:
```bash
nginx -t && systemctl reload nginx
curl -sS "https://d-kelas.doscom.org/api-dkelas/api/courses?page=1&per_page=4" | head -c 200
# harus JSON, bukan kosong
```

Kemungkinan penyebab blok lama: `return 200;`, `proxy_pass` tanpa trailing slash ke path yang tidak ada, atau `root` menunjuk direktori kosong. Perlu lihat config asli untuk memastikan.

### 4.2 Deploy ulang frontend

```bash
cd frontend
VITE_BACKEND_URL=https://d-kelas.doscom.org/api-dkelas/api npm run build
# salin dist/ ke server, atau docker compose build frontend di server
```

Setelah itu verifikasi title di tab sudah `DKelas`.

---

## 5. Item Terbuka

1. **Variable SSO belum diisi** — `.env` produksi belum punya `SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, `SSO_REDIRECT_URI`. Login SSO tidak akan berfungsi. Sudah ada sebelum perubahan ini.
2. **`MAIL_FROM_NAME` menimpa default** — `.env` berisi `MAIL_FROM_NAME="Dinus Open Source Community"`, sehingga email tetap tampil dengan nama itu, bukan `DKelas`. Ubah di `.env` bila ingin konsisten.
3. **Kode redeem lama** — perubahan prefix default hanya berlaku untuk kode baru. Kode `DU-*` yang sudah beredar tetap valid.
4. **Seeder produksi** — perlu dipastikan apakah data seed (email `@doscom.id`) ikut dipakai di produksi. Bila ya, keputusan rename domain email perlu dibahas terpisah.

---

## 6. Ringkasan Aksi

| # | Aksi | Pemilik | Prioritas |
|---|---|---|---|
| 1 | Perbaiki blok nginx `location /api-dkelas/api/` + reload | DevOps | P0 |
| 2 | Verifikasi endpoint produksi balas JSON | DevOps | P0 |
| 3 | Rebuild & deploy frontend dengan env produksi | DevOps | P0 |
| 4 | Isi variable `SSO_*` di `.env` produksi | Backend | P1 |
| 5 | Putuskan `MAIL_FROM_NAME` dan rename email seed | Product/Backend | P2 |