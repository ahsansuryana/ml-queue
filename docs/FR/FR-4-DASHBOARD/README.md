# FR-4-DASHBOARD: Dashboard

## Deskripsi
Web dashboard untuk streamer mengelola antrian dan konfigurasi.

## Dependensi
- Semua FR sebelumnya

## Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-4.1 | Halaman login dengan Google OAuth button | HIGH |
| FR-4.2 | Halaman utama menampilkan queue (top 4 + sisa antrian) | HIGH |
| FR-4.3 | Setiap queue entry menampilkan: nama, id ML, queueType, timestamp | HIGH |
| FR-4.4 | Tombol SKIP, PULL, CONFIRM di setiap entry | HIGH |
| FR-4.5 | Panel Setup Webhook: show URL, regenerate button, input secret | HIGH |
| FR-4.6 | Panel Pricing: input regularPrice, bundlePrice, bundleCount, fastrackPrice | HIGH |
| FR-4.7 | Panel Prediction Log: daftar prediksi + koreksi | HIGH |
| FR-4.8 | Panel Forward Webhook: toggle + input URL tujuan | MEDIUM |
| FR-4.9 | Panel Player: daftar player + edit/delete | MEDIUM |
| FR-4.10 | Queue update real-time via Socket.IO | HIGH |
| FR-4.11 | Export training data button (JSONL) | MEDIUM |
| FR-4.12 | Responsive design (desktop primary) | LOW |

## Layout

```
┌─────────────────────────────────────────────┐
│  Nav: Dashboard | Integrasi | Players | Log │
├──────────────────┬──────────────────────────┤
│  Queue (Top 4)   │  Prediction Log          │
│  ┌──────────────┐│  ┌──────────────────────┐│
│  │ A - FAST ⛔✅ ││  │ msg: "fastrack"     ││
│  │ B - NORM ⛔✅ ││  │ pred: NORMAL ❌     ││
│  │ C - NORM ⛔✅ ││  │ koreksi: FASTRACK   ││
│  │ D - NORM ⛔✅ ││  │ ...                 ││
│  └──────────────┘│  └──────────────────────┘│
│  [CONFIRM GROUP] │                          │
├──────────────────┴──────────────────────────┤
│  Queue List (sisa antrian, scroll)          │
│  E - NORM 10:30 | F - NORM 10:35 | ...      │
└─────────────────────────────────────────────┘
```
