# UML Diagrams — SAS

## 1. Entity Relationship Diagram (ERD)

```
┌─────────────────────┐       ┌─────────────────────────────┐
│     Streamer        │       │        Player               │
├─────────────────────┤       ├─────────────────────────────┤
│ PK id: UUID         │       │ PK id: UUID                 │
│    googleId: String │──┐    │ FK streamerId: UUID         │
│    email: String    │  │    │    idMlPlayer: String       │
│    displayName      │  │    │    namaSociaBuzz: String    │
│    avatarUrl        │  │    │    emailSociaBuzz: String   │
│    createdAt        │  │    │    role: String?            │
└─────────────────────┘  │    │    createdAt                │
        │                │    └──────────┬──────────────────┘
        │                │               │
        │                │               │
        ▼                │               ▼
┌─────────────────────┐  │   ┌─────────────────────────────┐
│ WebhookIntegration  │  │   │      QueueEntry             │
├─────────────────────┤  │   ├─────────────────────────────┤
│ PK id: UUID         │  │   │ PK id: UUID                 │
│ FK streamerId: UUID │──┘   │ FK streamerId: UUID         │
│    webhookUrl       │      │ FK playerId: UUID           │
│    sociaBuzzSecret  │      │    queueType: Enum          │
│    isForwardEnabled │      │    done: Boolean            │
│    forwardUrl       │      │    timestamp: DateTime      │
│    createdAt        │      │    bundleGroupId: UUID?     │
└─────────────────────┘      │    transactionId: String    │
                              └──────────┬──────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────────────┐
                              │      PredictionLog          │
                              ├─────────────────────────────┤
                              │ PK id: UUID                 │
                              │ FK streamerId: UUID         │
                              │    transactionId: String    │
                              │    viewerName               │
                              │    donationAmount           │
                              │    rawMessage               │
                              │    predictedQueue           │
                              │    predictedType            │
                              │    predictedMatches         │
                              │    correctedQueue?          │
                              │    correctedType?           │
                              │    correctedMatches?        │
                              │    status: Enum             │
                              │    createdAt                │
                              └─────────────────────────────┘
```

## 2. Sequence Diagram — Webhook → Queue

```
Viewer          SociaBuzz          SAS Server          DB          Dashboard
  │                 │                 │                │              │
  │── Donasi ──────→│                 │                │              │
  │                 │── POST Webhook ─→│               │              │
  │                 │                 │                │              │
  │                 │                 │── Validasi ────→│              │
  │                 │                 │←── OK ────────│              │
  │                 │                 │                │              │
  │                 │                 │── Parse Msg ───→│              │
  │                 │                 │── Insert Queue ─→│              │
  │                 │                 │── Insert Log ───→│              │
  │                 │                 │                │              │
  │                 │                 │── Push Realtime ──────────────→│
  │                 │                 │                │              │
  │                 │                 │── 200 OK ─────→│              │
  │                 │── Response ────→│                │              │
  │←── Notif ──────│                 │                │              │
```

## 3. Sequence Diagram — Queue Management

```
Streamer          Dashboard          SAS Server          DB
  │                    │                  │              │
  │── Open Dashboard ──→│                 │              │
  │                    │── GET /queue ────→│── Query ────→│
  │                    │                  │←── Top 4 ────│
  │                    │←── Display ─────│              │
  │                    │                  │              │
  │── Click SKIP ──────→│                 │              │
  │                    │── POST /skip ────→│─ Update ───→│
  │                    │                  │← OK ────────│
  │                    │←── Update UI ───│              │
  │                    │                  │              │
  │── Click CONFIRM ───→│                 │              │
  │                    │── POST /confirm ─→│─ Mark Done ─→│
  │                    │                  │← OK ────────│
  │                    │←── Done ────────│              │
```

## 4. Sequence Diagram — Human Feedback Loop

```
Streamer          Dashboard          API Server          DB          Training Data
  │                    │                  │              │              │
  │── Lihat Log ───────→│                 │              │              │
  │                    │── GET /predictions ─→│── Query ──→│              │
  │                    │                  │←── List ────│              │
  │                    │←── Display ─────│              │              │
  │                    │                  │              │              │
  │── Koreksi ─────────→│                 │              │              │
  │                    │── PATCH /prediction ─→│── Update ─→│              │
  │                    │                  │←── OK ──────│              │
  │                    │←── Updated ─────│              │              │
  │                    │                  │              │              │
  │── Export ──────────→│                 │              │              │
  │                    │── GET /export ───→│── Query ────→│              │
  │                    │                  │←── Data ────│              │
  │                    │←── JSONL ───────│              │── Save ─────→│
  │                    │                  │              │              │
```

## 5. State Diagram — QueueEntry

```
                    ┌─────────┐
                    │ PENDING │ (inserted by webhook)
                    └────┬────┘
                         │
                         ▼
                    ┌─────────┐
             ┌──────│ ACTIVE  │──────┐
             │      └─────────┘      │
             │                       │
             ▼                       ▼
       ┌──────────┐          ┌──────────┐
       │ SKIPPED  │          │ CONFIRMED│ (selected in group)
       └──────────┘          └────┬─────┘
                                  │
                                  ▼
                            ┌──────────┐
                            │   DONE   │ (match selesai)
                            └──────────┘
```

## 6. Use Case Diagram

```
                    ┌─────────────────────────────┐
                    │          SAS System          │
                    │                              │
                    │  ┌───────────────────────┐   │
                    │  │ Login with Google     │   │
                    │  └───────────────────────┘   │
                    │  ┌───────────────────────┐   │
                    │  │ Setup Webhook         │   │
                    │  └───────────────────────┘   │
                    │  ┌───────────────────────┐   │
         ┌──────────│  │ Manage Queue          │   │
         │          │  └───────────────────────┘   │
         │          │  ┌───────────────────────┐   │
         │          │  │ Confirm Group          │   │
         │          │  └───────────────────────┘   │
         │          │  ┌───────────────────────┐   │
         │          │  │ Koreksi Prediksi      │   │
         │          │  └───────────────────────┘   │
         │          │  ┌───────────────────────┐   │
         │          │  │ Export Training Data  │   │
      ┌──┴──┐       │  └───────────────────────┘   │
      │Streamer│     └─────────────────────────────┘
      └──────┘
```
