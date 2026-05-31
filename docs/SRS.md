# Software Requirements Specification — SAS

## 1. Pendahuluan

### 1.1 Tujuan
SAS (Server as a Service) adalah platform untuk streamer MLBB mengelola antrian Mabar (Main Bareng) secara otomatis dengan listen webhook donation SociaBuzz.

### 1.2 Scope
- Autentikasi streamer via OAuth Google
- Integrasi webhook SociaBuzz dengan URL random + secret verification
- Parsing message donation untuk detek intent (queue vs support, normal vs fastrack)
- Queue management (skip, pull, confirm)
- Grouping 4 pemain per match
- Forward webhook ke app eksternal (opsional)
- Human feedback loop untuk training data AI

## 2. Arsitektur Sistem

```
┌──────────────┐     Webhook POST     ┌──────────────────┐
│  SociaBuzz   │ ──────────────────→  │  SAS API Server  │
│  (Donation)  │                      │  (Express)       │
└──────────────┘                      └────────┬─────────┘
                                               │
                    ┌──────────────────────────┼──────────────┐
                    │                          │              │
                    ▼                          ▼              ▼
           ┌──────────────┐          ┌──────────────┐ ┌──────────┐
           │  PostgreSQL  │          │  Socket.IO   │ │   Redis  │
           │  (Database)  │          │  (Real-time) │ │ (Cache)  │
           └──────────────┘          └──────────────┘ └──────────┘
                    │                          │
                    ▼                          ▼
           ┌──────────────┐          ┌──────────────────┐
           │  React       │          │  OBS Overlay     │
           │  Dashboard   │          │  (Status Antrian)│
           └──────────────┘          └──────────────────┘
```

## 3. Entity Relationship

### Streamer
- `id` (PK, UUID)
- `googleId` (unique)
- `email`
- `displayName`
- `avatarUrl`
- `createdAt`

### WebhookIntegration (1:1 dengan Streamer)
- `id` (PK)
- `streamerId` (FK → Streamer)
- `webhookUrl` (random nanoid)
- `webhookTokenHash` (bcrypt hash dari sb-webhook-token)
- `isForwardEnabled` (default false)
- `forwardUrl` (nullable)
- `createdAt`

### Player
- `id` (PK)
- `streamerId` (FK → Streamer)
- `idMlPlayer`
- `namaSociaBuzz`
- `emailSociaBuzz`
- `role` (nullable, future)
- `createdAt`

### QueueEntry
- `id` (PK)
- `streamerId` (FK → Streamer)
- `playerId` (FK → Player)
- `queueType` (NORMAL | FASTRACK)
- `done` (boolean)
- `timestamp`
- `bundleGroupId` (nullable)
- `transactionId` (unique)

### PredictionLog
- `id` (PK)
- `streamerId` (FK → Streamer)
- `transactionId` (unique)
- `viewerName`
- `donationAmount`
- `rawMessage`
- `predictedQueue` (boolean)
- `predictedType` (NORMAL | FASTRACK | null)
- `predictedMatches` (int)
- `correctedQueue` (boolean, nullable)
- `correctedType` (NORMAL | FASTRACK | null, nullable)
- `correctedMatches` (int, nullable)
- `status` (AUTO_ACCEPTED | MANUAL_FIXED | IGNORED)
- `createdAt`

## 4. Alur Utama

### 4.1 Webhook → Queue
1. SociaBuzz kirim POST ke `/api/webhooks/sociabuzz/:randomId`
2. Extract header `sb-webhook-token` → compare dengan bcrypt hash di DB
3. Jika token tidak cocok → return 401
4. Parse message viewer:
   - Jika ada MLBB ID (6-8 digit) → new player, insert queue
   - Jika ada keyword "nambah" → existing player, insert queue
   - Jika tidak ada → pure support, skip queue
5. Cek keyword fastrack → override queueType
6. Hitung jumlah match dari nominal ÷ price
7. Insert QueueEntry & PredictionLog
8. Push real-time ke dashboard

### 4.2 Queue Display & Grouping
- Urutan: FASTRACK → NORMAL, lalu timestamp ASC
- Streamer lihat top 4 sebagai current batch
- Skip: player kembali ke posisi queue semula
- Pull: tarik player dari bawah ke atas
- Confirm 4 → match start
- Selesai → 1 QueueEntry per player mark done

### 4.3 Human Feedback
- Streamer lihat PredictionLog
- Koreksi jika salah prediksi
- Data disimpan untuk training AI

## 5. API Endpoints

### Auth
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/auth/google` | Redirect Google OAuth |
| GET | `/api/auth/google/callback` | Callback OAuth |
| POST | `/api/auth/logout` | Logout |

### Webhook (Public)
| Method | Path | Deskripsi |
|---|---|---|
| POST | `/api/webhooks/sociabuzz/:randomId` | Webhook dari SociaBuzz |

### Integrasi (Authenticated)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/integrations/webhook` | Detail webhook integration |
| POST | `/api/integrations/webhook/regenerate` | Regenerate URL |
| POST | `/api/integrations/webhook/secret` | Update secret |
| GET | `/api/integrations/forward` | Status forward |
| PUT | `/api/integrations/forward` | Update forward config |

### Queue (Authenticated)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/queue` | List queue entries |
| POST | `/api/queue/skip/:id` | Skip player (tetap di queue) |
| POST | `/api/queue/pull/:id` | Pull player ke posisi atas |
| POST | `/api/queue/confirm` | Confirm 4 player |

### Prediction (Authenticated)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/predictions` | List prediction log |
| PATCH | `/api/predictions/:id` | Koreksi prediksi |
| GET | `/api/predictions/export` | Export training data JSONL |

### Player (Authenticated)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/players` | List players |
| PATCH | `/api/players/:id` | Update player |
| DELETE | `/api/players/:id` | Hapus player |

## 6. Message Parsing Logic

### Input: `rawMessage`, `donationAmount`, `viewerName`

```
Step 1: Extract MLBB ID (regex /\b\d{6,8}\b/)
  - Found → queue = true, player diidentifikasi by ID
  - Not found → lanjut Step 2

Step 2: Check "nambah" keyword
  - Found → queue = true, cari existing player by viewerName
  - Not found → lanjut Step 3

Step 3: Check "fastrack" keyword
  - Found → type = FASTRACK
  - Not found → type = NORMAL

Step 4: Calculate matches = floor(amount / tierPrice)

Step 5: Jika Step 1 + Step 2 gagal → pure support
```

### LLM Fallback
Jika rule-based ambiguous → kirim ke LLM dengan system prompt:
```
Klasifikasikan pesan viewer. Output JSON:
{ "queue": boolean, "type": "NORMAL|FASTRACK|null", "matches": int }
```
