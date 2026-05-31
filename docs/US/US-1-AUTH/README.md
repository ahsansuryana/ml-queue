# US-1-AUTH: Authentication

## US-1.1: Login dengan Google
**Sebagai** streamer MLBB  
**Saya ingin** login menggunakan akun Google  
**Sehingga** saya tidak perlu registrasi manual  

**Acceptance Criteria:**
- Klik tombol "Login with Google"
- Redirect ke halaman consent Google
- Setuju → redirect ke dashboard SAS
- Data akun (email, nama, avatar) tersimpan otomatis

## US-1.2: Logout
**Sebagai** streamer  
**Saya ingin** logout dari dashboard  
**Sehingga** akun saya aman saat tidak digunakan  

**Acceptance Criteria:**
- Klik tombol Logout
- Session dihapus
- Redirect ke halaman login
- Tidak bisa akses dashboard tanpa login ulang

## US-1.3: Session expired
**Sebagai** streamer  
**Saya ingin** session otomatis expired setelah 24 jam  
**Sehingga** akun tetap aman  

**Acceptance Criteria:**
- Setelah 24 jam, JWT expired
- Redirect ke login dengan pesan "Session expired"
- Tidak ada data yang hilang
