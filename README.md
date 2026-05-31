# ML Queue — SAS (Server as a Service)

Queue management untuk streamer MLBB via webhook SociaBuzz.

## Stack

- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis
- **Frontend**: React + Vite + Tailwind CSS + Socket.IO
- **AI**: Rule-based parser + LLM fallback + human feedback loop
- **Deploy**: Docker Compose

## Fitur

- OAuth Google login
- Webhook SociaBuzz dengan token verification (bcrypt hash)
- Auto-detect intent donation (queue vs support, normal vs fastrack)
- Queue management: skip, pull, confirm 4-player group
- Real-time dashboard via Socket.IO
- Human feedback → training data export (JSONL)
- Forward webhook ke endpoint eksternal

## Cara Jalankan

```bash
# Development (hot reload)
docker compose -f compose.yaml -f compose.dev.yaml up --build

# Production
docker compose up --build
```

## Project Structure

```
backend/          Express API (modules: auth, webhook, queue, player, prediction)
frontend/         React dashboard (pages: login, dashboard, webhook, predictions, settings)
docs/             PRD, SRS, FR, US, UML, DESIGN, NFR, TECHSTACK
```
