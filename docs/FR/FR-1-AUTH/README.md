# FR-1-AUTH: Authentication

## Deskripsi
Sistem autentikasi streamer menggunakan OAuth Google.

## Dependensi
- Tidak ada

## Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1.1 | Streamer dapat login menggunakan akun Google | HIGH |
| FR-1.2 | Sistem menyimpan googleId, email, displayName, avatarUrl | HIGH |
| FR-1.3 | Session dikelola dengan JWT (access + refresh token) | HIGH |
| FR-1.4 | Streamer dapat logout dan session dihapus | HIGH |
| FR-1.5 | Halaman dashboard hanya bisa diakses streamer terautentikasi | HIGH |
| FR-1.6 | Redirect ke Google OAuth jika belum login | MEDIUM |

## Endpoints

| Method | Path | Auth |
|---|---|---|
| GET | `/api/auth/google` | No |
| GET | `/api/auth/google/callback` | No |
| POST | `/api/auth/logout` | Yes |
| GET | `/api/auth/me` | Yes |

## Alur

```
1. Streamer klik "Login with Google"
2. Redirect ke Google OAuth consent screen
3. User approve → Google redirect ke callback SAS
4. SAS cek user di DB:
   - Exist → login (update token)
   - Not exist → create baru
5. Generate JWT → redirect ke dashboard
```
