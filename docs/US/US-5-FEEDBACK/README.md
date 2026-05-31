# US-5-FEEDBACK: Feedback & Training

## US-5.1: Koreksi Queue Intent
**Sebagai** streamer  
**Saya ingin** mengubah donation yang terdeteksi queue padahal hanya support  
**Sehingga** antrian tidak terisi oleh yang tidak ingin mabar  

**Acceptance Criteria:**
- Tombol "Mark as Support" di prediction log
- QueueEntry yang terkait dihapus
- PredictionLog tercatat: correctedQueue = false

## US-5.2: Koreksi Queue Type
**Sebagai** streamer  
**Saya ingin** mengubah NORMAL menjadi FASTRACK (atau sebaliknya)  
**Sehingga** viewer dapat antrian yang sesuai  

**Acceptance Criteria:**
- Dropdown untuk ubah queueType
- QueueEntry di-update
- Antrian real-time langsung menyesuaikan urutan

## US-5.3: Lihat Statistik Koreksi
**Sebagai** developer  
**Saya ingin** melihat statistik akurasi prediksi  
**Sehingga** saya tau kapan perlu fine-tune model  

**Acceptance Criteria:**
- Hitung: total prediksi, benar, salah, accuracy %
- Breakdown per type (NORMAL, FAST, SUPPORT)
- Grafik accuracy per minggu
