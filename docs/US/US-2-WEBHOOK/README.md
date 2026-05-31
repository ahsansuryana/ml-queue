# US-2-WEBHOOK: Webhook Setup

## US-2.1: Generate Webhook URL
**Sebagai** streamer  
**Saya ingin** sistem menggenerate URL webhook yang unik dan random  
**Sehingga** saya bisa memasangnya di dashboard SociaBuzz  

**Acceptance Criteria:**
- URL digenerate otomatis saat pertama setup
- URL memiliki format `/api/webhooks/sociabuzz/xxxxxxxxxxxxxxxx`
- URL unik per streamer (tidak bisa ditebak)

## US-2.2: Input Webhook Token (sb-webhook-token)
**Sebagai** streamer  
**Saya ingin** memasukkan **sb-webhook-token** dari dashboard SociaBuzz  
**Sehingga** webhook hanya menerima request valid dari SociaBuzz  

**Acceptance Criteria:**
- Ada input field untuk token (dari SociaBuzz → Settings → Webhook → Token)
- Token di-hash (bcrypt) sebelum disimpan — tidak pernah plaintext
- Verifikasi: header `sb-webhook-token` dari request dibanding dengan bcrypt hash
- Tidak bisa melihat token setelah disimpan (hanya diganti)
- Webhook yang token-nya tidak cocok ditolak (401)

## US-2.3: Regenerate URL
**Sebagai** streamer  
**Saya ingin** regenerate webhook URL jika curiga bocor  
**Sehingga** keamanan tetap terjaga  

**Acceptance Criteria:**
- Tombol "Regenerate" tersedia
- URL lama langsung nonaktif
- URL baru langsung aktif
- Tidak perlu setup ulang secret

## US-2.4: Test Webhook
**Sebagai** streamer  
**Saya ingin** melihat log webhook yang masuk  
**Sehingga** saya tau integrasi berfungsi  

**Acceptance Criteria:**
- Log menampilkan timestamp, viewer, amount, message, status
- Status sukses/gagal terlihat jelas
- Bisa filter by status
