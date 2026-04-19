# Dokumentasi API (Backend Go — Gin)

Dokumen ini diselaraskan dengan implementasi di [`backend/internal/service/`](../../../backend/internal/service/), [`backend/internal/handler/routes/`](../../../backend/internal/handler/routes/), dan DTO [`backend/internal/model/dto/`](../../../backend/internal/model/dto/).

**Base URL (dev):** `http://localhost:8080` — [`main.go`](../../../backend/main.go)  
**Swagger UI:** `GET /swagger/index.html`

| Dokumen | Isi |
|---------|-----|
| [response-envelope.md](./response-envelope.md) | Bentuk JSON standar (`success`, `message`, `data`, `error`), header auth, kode HTTP |
| [route-map.md](./route-map.md) | **Semua route** — method, path, auth, content-type, contoh request/response lengkap, status error |

**Aturan:** jika perilaku runtime berbeda dari Swagger, **utamakan kode handler** (`service/*.go`).

Folder dokumentasi fitur di [`../`](../README.md) mengacu ke file di sini untuk konsistensi envelope.
