# FR-6-FORWARD: Forward Webhook

## Deskripsi
Meneruskan (forward) webhook yang sudah tervalidasi ke URL eksternal yang ditentukan streamer.

## Dependensi
- FR-2-WEBHOOK (forward setelah webhook divalidasi)

## Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-6.1 | Forward default dalam keadaan DISABLED | HIGH |
| FR-6.2 | Streamer dapat toggle ON/OFF forward | HIGH |
| FR-6.3 | Streamer dapat input URL tujuan forward | HIGH |
| FR-6.4 | Forward dikirim setelah webhook sukses diproses | HIGH |
| FR-6.5 | Payload yang diforward = payload asli dari SociaBuzz | HIGH |
| FR-6.6 | Log status forward (sukses/gagal, response code) | MEDIUM |
| FR-6.7 | Forward tidak blocking — async setelah proses queue | MEDIUM |
| FR-6.8 | Timeout forward request 5 detik | MEDIUM |

## Endpoints

| Method | Path | Auth |
|---|---|---|
| GET | `/api/integrations/forward` | Yes |
| PUT | `/api/integrations/forward` | Yes |

## Forward Flow

```
1. Webhook diterima & divalidasi
2. Proses queue entry
3. Cek isForwardEnabled
   - YES → kirim POST ke forwardUrl (async)
   - NO → selesai
4. Log forward response
```

## Request Payload (forward)

```json
{
  "original_payload": { ... payload dari SociaBuzz ... },
  "processed_at": "2026-05-31T12:00:00Z",
  "queue_entries": [ ... queue entry yang dihasilkan ... ]
}
```
