# US-4-DASHBOARD: Dashboard Usage

## US-4.1: Setup Pricing
**Sebagai** streamer  
**Saya ingin** mengatur harga regular, bundle, dan fastrack  
**Sehingga** viewer tau nominal donation untuk mabar  

**Acceptance Criteria:**
- Input field untuk regularPrice, bundlePrice, bundleCount, fastrackPrice
- Bisa diubah kapan saja
- Perubahan langsung生效 (entry lama tetap pakai harga lama)

## US-4.2: Lihat Prediction Log
**Sebagai** streamer  
**Saya ingin** melihat log prediksi message viewer  
**Sehingga** saya bisa koreksi jika prediksi salah  

**Acceptance Criteria:**
- Tabel menampilkan: message, predicted type, actual type, status
- Warna berbeda untuk prediksi benar/salah
- Tombol "Koreksi" untuk yang salah

## US-4.3: Koreksi Prediksi
**Sebagai** streamer  
**Saya ingin** mengubah hasil prediksi yang salah  
**Sehingga** queue tetap akurat dan data training terkumpul  

**Acceptance Criteria:**
- Bisa ubah: queue (true/false), type (NORMAL/FAST), matches
- Perubahan langsung update QueueEntry terkait
- PredictionLog tercatat sebagai MANUAL_FIXED

## US-4.4: Export Training Data
**Sebagai** developer / admin  
**Saya ingin** export data training dalam format JSONL  
**Sehingga** AI model bisa di-fine-tune  

**Acceptance Criteria:**
- Export semua prediction yang sudah dikoreksi
- Format JSONL: { message, queue, type, matches }
- Download button di dashboard
