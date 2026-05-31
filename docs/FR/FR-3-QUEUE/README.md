# FR-3-QUEUE: Queue Management

## Deskripsi
Sistem antrian viewer yang akan mabar dengan streamer.

## Dependensi
- FR-5-MESSAGE-PARSER (untuk menentukan queueType & matches)
- FR-1-AUTH (hanya streamer terautentikasi bisa manage)

## Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-3.1 | QueueEntry memiliki streamerId, playerId, queueType, done, timestamp | HIGH |
| FR-3.2 | Queue entry dibuat saat webhook donation valid diproses | HIGH |
| FR-3.3 | Urutan queue: FASTRACK dulu → NORMAL, lalu timestamp ASC | HIGH |
| FR-3.4 | Top 4 queue = current batch yang ditampilkan | HIGH |
| FR-3.5 | Streamer dapat SKIP player → player tetap di posisi queue | HIGH |
| FR-3.6 | Streamer dapat PULL player dari bawah ke atas | HIGH |
| FR-3.7 | Streamer dapat CONFIRM 4 player → group terbentuk | HIGH |
| FR-3.8 | Saat confirm, 1 QueueEntry per player di-mark done | HIGH |
| FR-3.9 | Bundle (3 match): insert 3 QueueEntry dengan bundleGroupId sama | HIGH |
| FR-3.10 | Sisa tiket bundle tetap di queue untuk round berikutnya | HIGH |
| FR-3.11 | Distinct by playerId saat grouping — 1 player cuma 1 slot per match | HIGH |
| FR-3.12 | Status queue real-time via Socket.IO | MEDIUM |

## Endpoints

| Method | Path | Auth |
|---|---|---|
| GET | `/api/queue` | Yes |
| POST | `/api/queue/skip/:id` | Yes |
| POST | `/api/queue/pull/:id` | Yes |
| POST | `/api/queue/confirm` | Yes |

## Queue Sorting Logic

```sql
SELECT DISTINCT ON (qe."playerId")
  qe.*, p.*
FROM "QueueEntry" qe
JOIN "Player" p ON p.id = qe."playerId"
WHERE qe."streamerId" = :streamerId AND qe."done" = false
ORDER BY qe."playerId",
  CASE qe."queueType" WHEN 'FASTRACK' THEN 0 ELSE 1 END,
  qe."timestamp" ASC
LIMIT 4
```

## Skip vs Pull Behavior

| Action | Dampak ke player |
|---|---|
| SKIP | Player tetap di queue (posisi timestamp tidak berubah) |
| PULL | Player pindah ke urutan paling atas |
| CONFIRM | 1 QueueEntry player di-mark done |
