# FR-5-MESSAGE-PARSER: Message Parser & AI

## Deskripsi
Parse message dari webhook donation untuk menentukan intent (queue/support), queueType, dan jumlah match.

## Dependensi
- FR-2-WEBHOOK (input dari webhook payload)

## Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-5.1 | Extract MLBB ID dari message (regex: 6-8 digit angka) | HIGH |
| FR-5.2 | Detect "nambah" keyword untuk existing player | HIGH |
| FR-5.3 | Detect "fastrack" keyword untuk override queueType | HIGH |
| FR-5.4 | Hitung matches = floor(amount / tierPrice) | HIGH |
| FR-5.5 | Jika tidak ada ID dan tidak ada "nambah" → pure support | HIGH |
| FR-5.6 | Rule-based jadi default parser (no AI cost) | HIGH |
| FR-5.7 | LLM fallback jika rule-based ambiguous | MEDIUM |
| FR-5.8 | System prompt LLM: klasifikasi JSON { queue, type, matches } | MEDIUM |
| FR-5.9 | PredictionLog mencatat rawMessage + hasil prediksi | HIGH |
| FR-5.10 | Streamer bisa koreksi hasil prediksi di dashboard | HIGH |
| FR-5.11 | Koreksi streamer disimpan di PredictionLog | HIGH |
| FR-5.12 | Export training data (rawMessage + corrected labels) | MEDIUM |
| FR-5.13 | Data training format JSONL untuk fine-tune model | MEDIUM |

## Parser Flow

```
                 ┌──────────────────────┐
                 │   rawMessage         │
                 └──────────┬───────────┘
                            │
                    ┌───────▼────────┐
                    │ Extract MLBB ID│
                    │ (6-8 digit)   │
                    └───┬──────┬─────┘
                   YES  │      │  NO
         ┌──────────────┘      └──────────────┐
         ▼                                     ▼
  ┌──────────────┐                     ┌──────────────┐
  │ queue = true │                     │ Check "nambah"│
  │ ID = found   │                     └───┬──────┬─────┘
  └──────┬───────┘                    YES  │      │  NO
         │                                 ▼      ▼
         │                          ┌────────┐ ┌────────────┐
         │                          │ Existing│ │ Pure       │
         │                          │ player  │ │ Support ❌ │
         │                          └───┬────┘ └────────────┘
         │                              │
         └──────────────┬───────────────┘
                        ▼
              ┌──────────────────┐
              │ Check "fastrack" │
              │ → override type  │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ Calculate matches│
              │ amount ÷ price   │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ Insert QueueEntry│
              │ + PredictionLog  │
              └──────────────────┘
```

## Training Data Format (JSONL)

```jsonl
{"message": "12345678", "queue": true, "type": "NORMAL", "matches": 1}
{"message": "87654321 fastrack", "queue": true, "type": "FASTRACK", "matches": 1}
{"message": "bang nambah 1", "queue": true, "type": "NORMAL", "matches": 1}
{"message": "semangat bangg", "queue": false, "type": null, "matches": 0}
{"message": "bang ikut fastrack 2", "queue": true, "type": "FASTRACK", "matches": 2}
```

## LLM System Prompt

```
Anda adalah classifier untuk pesan donation viewer.
Tugas: tentukan apakah viewer ingin main bareng (queue) atau
hanya support, serta tipe queue (NORMAL/FASTRACK).

Output JSON:
{
  "queue": boolean,
  "type": "NORMAL" | "FASTRACK" | null,
  "matches": int,
  "confidence": float
}

Aturan:
- Jika message mengandung angka 6-8 digit → queue = true
- Jika message mengandung "nambah" → queue = true
- Jika message mengandung "fastrack"/"fast"/"cepat" → type = "FASTRACK"
- Jika tidak ada indikasi queue → queue = false
- matches = jumlah pertandingan yang diminta (default 1 jika tidak disebut)
```
