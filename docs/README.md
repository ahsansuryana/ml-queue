# SAS — Server as a Service

**Pengelola Antrian Mabar Online Streamer MLBB via Webhook SociaBuzz**

## Dokumentasi

| Dokumen | Deskripsi |
|---|---|
| [SRS.md](./SRS.md) | Software Requirements Specification — gambaran sistem lengkap |
| [NFR.md](./NFR.md) | Non-Functional Requirements — performa, keamanan, skalabilitas |
| [TECHSTACK.md](./TECHSTACK.md) | Tech Stack & Arsitektur |
| [FR/](./FR/README.md) | Functional Requirements (detail fitur) |
| [US/](./US/README.md) | User Stories (skenario pengguna) |
| [UML/](./UML/README.md) | Diagram UML (ERD, Sequence, dll) |

## Ringkasan Sistem

SAS adalah platform **multi-tenant** untuk streamer MLBB:

1. **Login** via OAuth Google
2. **Setup webhook** — sistem generate URL random + secret verification
3. **Atur pricing** — regular, bundle, fastrack
4. **Listen donation** — parse message viewer untuk detek intent (queue/support, normal/fastrack)
5. **Queue management** — skip, pull, confirm grouping 4 pemain
6. **Human feedback** — streamer koreksi prediksi → training data untuk AI
7. **Forward webhook** (optional) — forward ke app lain
