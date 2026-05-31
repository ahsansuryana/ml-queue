# FR-2-WEBHOOK: Webhook Integration

## Deskripsi
Integrasi webhook dengan SociaBuzz untuk menerima donation notifications.

## Dependensi
- FR-1-AUTH (setup webhook perlu authentication)

## Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-2.1 | Sistem generate webhook URL random (nanoid 16+ chars) | HIGH |
| FR-2.2 | URL memiliki format `/api/webhooks/sociabuzz/:randomId` | HIGH |
| FR-2.3 | Streamer dapat regenerate URL kapan saja | HIGH |
| FR-2.4 | URL lama otomatis nonaktif saat regenerate | HIGH |
| FR-2.5 | Streamer dapat input **sb-webhook-token** dari dashboard SociaBuzz | HIGH |
| FR-2.6 | Token di-hash (bcrypt) sebelum disimpan — tidak pernah plaintext | HIGH |
| FR-2.7 | Endpoint webhook menerima POST request | HIGH |
| FR-2.8 | Validasi token dari header `sb-webhook-token` dengan bcrypt compare | HIGH |
| FR-2.9 | Log semua incoming webhook (sukses/gagal) | HIGH |
| FR-2.10 | Idempotency berdasarkan `id` (transactionId) | HIGH |

## Endpoints

| Method | Path | Auth |
|---|---|---|
| POST | `/api/webhooks/sociabuzz/:randomId` | No (public, verified by sb-webhook-token) |
| GET | `/api/integrations/webhook` | Yes |
| POST | `/api/integrations/webhook/regenerate` | Yes |
| POST | `/api/integrations/webhook/secret` | Yes |

## Webhook Request (dari SociaBuzz)

### Headers
```json
{
  "sb-webhook-token": "sbwhook-qqfasegvhytoxk69bw3mirbp",
  "content-type": "application/json"
}
```

### Body
```json
{
  "id": "6033613743",
  "amount": 10000,
  "currency": "IDR",
  "supporter": "Jessica",
  "email_supporter": "jessica@example.com",
  "message": "Ini hanya test notifikasi",
  "item": { "name": "Kopi", "qty": 1 },
  "level": { "title": "Pilihan Dukungan", "price": 10000 },
  "created_at": "2026-05-31T16:26:12+07:00"
}
```

### Field Mapping

| Field SociaBuzz | Mapping ke DB | Notes |
|---|---|---|
| `id` | `transactionId` | Unique, untuk idempotency |
| `supporter` | `viewerName` (di PredictionLog) | Nama viewer |
| `email_supporter` | `emailSociaBuzz` (di Player) | Email viewer |
| `amount` | `donationAmount` | Nominal donasi |
| `message` | `rawMessage` | Yang di-parse |
| `sb-webhook-token` (header) | — | Compare dengan hash di DB |

## Validasi Flow

```
1. Extract randomId dari URL → cari WebhookIntegration
2. Extract header "sb-webhook-token" dari request
3. bcrypt.compare(token, hash di DB)
4. Jika cocok → proses queue
5. Jika tidak → return 401
```
