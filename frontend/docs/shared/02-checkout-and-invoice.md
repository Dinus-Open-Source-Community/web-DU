# Shared — Checkout & Invoice

## Ringkasan integrasi backend

- Pembayaran: **`POST /payment/create`** (JWT), **`GET /payment`** (JWT), **`POST /payment/callback`** (Tripay, tanpa JWT).
- Invoice enrollment: **`GET /invoices/:enrollment_id`**, **`GET /invoices/url`** — lihat [route map](../api/route-map.md).

Semua respons mengikuti envelope `success`, `message`, `data`, `error` ([response-envelope.md](../api/response-envelope.md)).

## Rute frontend

| Path | File |
|------|------|
| `/checkout/[slug]` | [`checkout/[slug]/page.tsx`](../../src/app/checkout/[slug]/page.tsx) |
| `/checkout/invoice/[uid]` | [`checkout/invoice/[uid]/page.tsx`](../../src/app/checkout/invoice/[uid]/page.tsx) |

---

## `POST /payment/create`

| Properti | Nilai |
|----------|--------|
| **Auth** | `Authorization: Bearer <JWT>` |
| **Content-Type** | `application/json` |

### Request body (`dto.CreatePaymentRequest`)

```json
{
  "enrollment_id": 12,
  "method": "OVO",
  "amount": 199000,
  "order_items": [
    {
      "sku": "CRS-12",
      "name": "Nama kursus",
      "price": 199000,
      "quantity": 1,
      "product_url": "https://app.example.com/course/12",
      "image_url": "https://cdn.example.com/thumb.jpg"
    }
  ],
  "callback_url": "https://api.example.com/payment/callback",
  "return_url": "https://app.example.com/payment/success"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|--------|------------|
| `enrollment_id` | number \| null | Tidak | Pointer di backend; jika enrollment sudah **active**, create akan gagal |
| `method` | string | Ya | Salah satu: `PERMATAVA`, `BNIVA`, `BRIVA`, `MANDIRIVA`, `BCAVA`, `MUAMALATVA`, `CIMBVA`, `BSIVA`, `OCBCVA`, `DANAMONVA`, `OVO`, `DANA`, `QRIS2` |
| `amount` | integer | Ya | > 0 |
| `order_items` | array | Ya | Min 1 item; tiap item wajib `name`, `price` > 0, `quantity` > 0 |
| `callback_url` | string | Tidak | Default dari `BASE_URL` + `/payment/callback` jika kosong |
| `return_url` | string | Tidak | Default `BASE_URL/payment/success` jika kosong |

**Order item**

| Field | Wajib |
|-------|--------|
| `name`, `price`, `quantity` | Ya |
| `sku`, `product_url`, `image_url` | Opsional |

### Response sukses — **200 OK**

Handler membungkus **`data`** = isi Tripay (`CreatePaymentResponse`), bukan wrapper `APIResponse` luar.

```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "reference": "...",
    "merchant_ref": "INV1",
    "payment_method": "OVO",
    "payment_name": "...",
    "customer_name": "...",
    "customer_email": "...",
    "callback_url": "...",
    "return_url": "...",
    "amount": 199000,
    "fee_merchant": 0,
    "fee_customer": 0,
    "total_fee": 0,
    "amount_received": 199000,
    "pay_code": "",
    "pay_url": null,
    "checkout_url": "https://...",
    "status": "UNPAID",
    "expired_time": 1710000000,
    "order_items": [],
    "instructions": [],
    "qr_string": null,
    "qr_url": null
  },
  "error": null
}
```

*Nilai pasti bergantung respons Tripay sandbox/production.*

### Response error

| HTTP | Kapan |
|------|--------|
| **401** | Tanpa JWT / user_id tidak di context |
| **400** | Bind JSON gagal; Tripay error; enrollment tidak ada; enrollment sudah active; kredensial Tripay / `BASE_URL` tidak set; gagal simpan DB |

**Contoh 400**

```json
{
  "success": false,
  "message": "Failed to create payment",
  "data": null,
  "error": "enrollment is already active, no payment needed"
}
```

---

## `GET /payment`

| Properti | Nilai |
|----------|--------|
| **Auth** | JWT |

**Query (salah satu wajib):**

- `reference=<transaction_id>` **atau**
- `enrollmentId=<uint>` (camelCase sesuai handler)

### Response sukses — **200 OK**

`data` = object entity **`Payment`** (GORM), antara lain: `id`, `enrollment_id`, `amount`, `payment_method`, `payment_status`, `transaction_id`, `checkout_url`, `paid_at`, `created_at`.

### Response error

| HTTP | Kondisi |
|------|---------|
| **400** | Tidak ada `reference` dan `enrollmentId` / `enrollmentId` bukan angka |
| **404** | Pembayaran tidak ditemukan |

---

## `POST /payment/callback`

Dipanggil oleh **gateway** (bukan browser user). Body [`PaymentCallbackRequest`](../../../backend/internal/model/dto/payment.go): `reference`, `status`, `signature`, `total_amount`, dll.

| HTTP | Kondisi |
|------|---------|
| **200** | Status pembayaran ter-update; jika `PAID`, enrollment dapat di-set **active** |
| **400** | Body invalid / signature salah / update gagal |
| **500** | `TRIPAY_PRIVATE_KEY` tidak diset |

---

## Invoice

### `GET /invoices/:enrollment_id`

- **Auth:** JWT
- **200:** `data` berisi `enrollment_id`, `user_id`, `course_id`, `filename`, `invoice_url`, `enrolled_at`
- **403:** Bukan admin / bukan pemilik / bukan mentor course tersebut
- **404:** Enrollment tidak ada

### `GET /invoices/url?enrollment_id=&user_id=&course_id=`

- **200:** URL invoice konsisten dengan path file di storage
- **400:** Parameter kurang atau invalid
- **403:** Enrollment tidak cocok dengan user yang memanggil

---

## Mapping UI checkout → `method`

ID di UI (mis. `gopay`, `va-bca`) harus dipetakan ke enum backend (mis. `OVO`, `BCAVA`). Simpan mapping di konfigurasi frontend atau di BFF.

---

## Referensi

- [Route map — Payment](../api/route-map.md#6-payment)
- [`CreatePaymentFunc`](../../../backend/internal/service/payment.go)
