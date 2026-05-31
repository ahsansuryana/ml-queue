# Non-Functional Requirements — SAS

## 1. Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-PERF-1 | Webhook processing latency | < 2 detik dari webhook → queue entry |
| NFR-PERF-2 | Dashboard real-time update | < 500ms via Socket.IO |
| NFR-PERF-3 | Queue query (top 4) | < 100ms |
| NFR-PERF-4 | LLM fallback latency | < 3 detik (acceptable karena fallback) |

## 2. Scalability

| ID | Requirement | Target |
|---|---|---|
| NFR-SCAL-1 | Concurrent streamers | Support 100+ streamer paralel |
| NFR-SCAL-2 | Queue per streamer | Support 500+ queue entries per streamer |
| NFR-SCAL-3 | Webhook throughput | 1000+ request/menit |
| NFR-SCAL-4 | Horizontal scaling | Backend stateless, scale with Docker |

## 3. Security

| ID | Requirement | Detail |
|---|---|---|
| NFR-SEC-1 | OAuth Google | Hanya streamer terverifikasi yang bisa akses dashboard |
| NFR-SEC-2 | Webhook URL random | nanoid 16+ karakter, unik per streamer |
| NFR-SEC-3 | Secret hashing | SociaBuzz secret di-hash dengan bcrypt sebelum disimpan |
| NFR-SEC-4 | Rate limiting | Per streamer: max 100 request/menit ke webhook endpoint |
| NFR-SEC-5 | Input validation | Semua input divalidasi (XSS, SQL injection) |
| NFR-SEC-6 | HTTPS only | Seluruh komunikasi via HTTPS |

## 4. Reliability

| ID | Requirement | Detail |
|---|---|---|
| NFR-REL-1 | Webhook retry | Retry 3x jika gagal proses (exponential backoff) |
| NFR-REL-2 | Idempotency | Berdasarkan transactionId — duplicate webhook tidak double-insert |
| NFR-REL-3 | Graceful degradation | Jika LLM down → fallback ke rule-based |
| NFR-REL-4 | Data backup | Database backup setiap 6 jam |

## 5. Availability

| ID | Requirement | Target |
|---|---|---|
| NFR-AVAIL-1 | Uptime SLA | 99.5% (≈ 3.5 jam downtime/bulan) |
| NFR-AVAIL-2 | Maintenance window | Diluar jam tayang streamer (pagi hari) |
| NFR-AVAIL-3 | Health check | Endpoint `/health` untuk monitoring |

## 6. Maintainability

| ID | Requirement | Detail |
|---|---|---|
| NFR-MAINT-1 | Logging | Semua webhook request & response tercatat |
| NFR-MAINT-2 | Error tracking | Error dilog dengan stack trace + context |
| NFR-MAINT-3 | Modular code | Setiap fitur dipisah per modul (auth, webhook, queue) |
| NFR-MAINT-4 | Config driven | Pricing, keyword, threshold via env/config |

## 7. Data

| ID | Requirement | Detail |
|---|---|---|
| NFR-DATA-1 | Retention | PredictionLog disimpan 6 bulan, QueueEntry 3 bulan |
| NFR-DATA-2 | Export format | Training data export JSONL |
| NFR-DATA-3 | GDPR | Streamer bisa hapus akun + semua data terkait |
