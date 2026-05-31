# US-3-QUEUE: Queue Management

## US-3.1: Lihat Antrian
**Sebagai** streamer  
**Saya ingin** melihat antrian viewer yang ingin mabar  
**Sehingga** saya tau siapa saja yang mengantri  

**Acceptance Criteria:**
- Top 4 antrian tampil sebagai current batch
- Sisa antrian tampil di bawahnya (scroll)
- Setiap entry menampilkan: nama, id ML, queueType (NORM/FAST), timestamp
- Urutan: FASTRACK dulu, lalu NORMAL (berdasarkan timestamp tertua)

## US-3.2: Skip Player
**Sebagai** streamer  
**Saya ingin** me-skip player yang tidak online di top 4  
**Sehingga** player berikutnya naik ke posisi current batch  

**Acceptance Criteria:**
- Klik SKIP → player skip dari current batch
- Player tetap di queue (posisi timestamp tidak berubah)
- Player berikutnya (ke-5) naik ke posisi yang di-skip

## US-3.3: Pull Player
**Sebagai** streamer  
**Saya ingin** menarik player dari bawah langsung ke posisi atas  
**Sehingga** saya bisa prioritize player tertentu  

**Acceptance Criteria:**
- Klik PULL pada player di queue bawah
- Player pindah ke urutan paling atas
- Urutan player lain menyesuaikan

## US-3.4: Confirm Group
**Sebagai** streamer  
**Saya ingin** confirm 4 player setelah puas dengan pilihan  
**Sehingga** match bisa dimulai  

**Acceptance Criteria:**
- Tombol CONFIRM aktif hanya jika ada 4 player
- Setelah confirm → 1 QueueEntry per player di-mark done
- Group dianggap selesai
- Player dengan sisa tiket bundle tetap di queue

## US-3.5: Bundle Handling
**Sebagai** streamer  
**Saya ingin** viewer bundle 3 match masuk 3x queue entry  
**Sehingga** mereka bisa main 3 round berturut-turut  

**Acceptance Criteria:**
- Donasi 100k → insert 3 QueueEntry dengan timestamp sama
- Setiap round: 1 QueueEntry di-mark done
- Sisa 2 tiket tetap di queue untuk round selanjutnya
- Distinct by playerId: viewer bundle cuma 1 slot per round
