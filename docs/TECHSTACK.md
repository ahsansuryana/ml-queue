# Tech Stack — SAS

## 1. Backend

| Komponen | Teknologi | Alasan |
|---|---|---|
| Runtime | Node.js 20 LTS | Event-driven, cocok untuk real-time & webhook |
| Framework | Express.js | Ringan, mature, ecosystem luas |
| ORM | Prisma | Type-safe, migration otomatis, schema-first |
| Database | PostgreSQL 16 | Reliable, support JSON, indexing powerful |
| Cache | Redis 7 | Queue cache, session, real-time state |
| Realtime | Socket.IO | WebSocket + fallback long-polling |
| Auth | Passport.js + Google OAuth | Strategy OAuth yang mature |

## 2. Frontend

| Komponen | Teknologi |
|---|---|
| Framework | React 18 |
| Bundler | Vite |
| Styling | Tailwind CSS 3 |
| State | React Context + SWR (cache) |
| Router | React Router 6 |
| Realtime | Socket.IO Client |
| OAuth | @react-oauth/google |

## 3. AI / ML

| Komponen | Teknologi | Notes |
|---|---|---|
| LLM API | Google Gemini / OpenAI | Fallback untuk ambiguous message |
| Training (future) | IndoBERT / SmolLM | Fine-tune dengan collected data |
| Format | JSONL | Export training data |

## 4. Deployment

| Komponen | Teknologi |
|---|---|
| Container | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |
| Hosting | VPS / Railway / Render |

## 5. Development

| Komponen | Tools |
|---|---|
| Language | TypeScript (strict) |
| Linter | ESLint + Prettier |
| Testing | Jest + Supertest (API) |
| API Docs | OpenAPI / Swagger |
| Monitoring | Sentry (error tracking) |
| Logging | Winston |
