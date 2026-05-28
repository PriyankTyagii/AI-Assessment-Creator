# AI Assessment Creator

An AI-powered exam paper generator for teachers. Fill a form, the system generates a structured question paper using Grok (xAI), and displays it in a clean, exam-ready format with PDF download support.

## Architecture Overview

```
┌─────────────────┐     HTTP/WebSocket      ┌──────────────────────┐
│   Next.js 14    │ ──────────────────────► │  Express + TypeScript │
│   (port 3000)   │                         │     (port 4000)       │
│                 │                         │                       │
│  Zustand store  │                         │  BullMQ worker        │
│  WebSocket hook │                         │  MongoDB (Mongoose)   │
└─────────────────┘                         │  Redis (cache+jobs)   │
                                            │  Grok API (xAI)       │
                                            └──────────────────────┘
                                                      │
                                            ┌─────────┴──────────┐
                                            │  Docker Compose     │
                                            │  MongoDB + Redis    │
                                            └────────────────────┘
```

## Approach

1. Teacher fills the assignment form (subject, question types, marks, difficulty, optional file upload).
2. Frontend POSTs to `/api/assignments` — backend saves to MongoDB and enqueues a BullMQ job.
3. Frontend opens a WebSocket connection and receives live progress events (10% → 30% → 80% → 100%).
4. BullMQ worker constructs a structured prompt, calls Grok API, parses the JSON response (never renders raw text), and saves the `Result` document to MongoDB + Redis cache.
5. On completion, frontend navigates to `/output/[id]` and renders the paper: sections, questions, difficulty badges.
6. Teacher can regenerate or download as a properly formatted PDF.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| State | Zustand |
| Real-time | WebSocket (native browser + `ws` on server) |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB (Mongoose) |
| Cache/Queue | Redis + BullMQ |
| AI | Grok (xAI) via OpenAI-compatible SDK |
| PDF | @react-pdf/renderer |

## Setup

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- Grok API key from [x.ai](https://x.ai)

### 1. Start infrastructure

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp ../.env.example .env
# Edit .env — set GROK_API_KEY
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
cp ../.env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Bonus Features
- **PDF Export** — `@react-pdf/renderer` generates a properly formatted exam PDF
- **Regenerate** — re-queue the job to get a fresh question paper
- **Redis caching** — result cached for 1 hour, subsequent loads are instant
- **Difficulty badges** — colour-coded Easy (green) / Medium (amber) / Hard (red)
- **File upload** — attach PDF or .txt as context for question generation
