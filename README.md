# AI Assessment Creator

An AI-powered exam paper generator built for teachers. A teacher fills a form (subject, class, question types, marks, difficulty), the system queues a background job, calls the Groq API, and delivers a fully structured, exam-ready question paper with real-time progress updates and PDF download.

---

## Architecture

```text
┌──────────────────────┐         HTTP / WebSocket         ┌────────────────────────────┐
│   Next.js 14         │ ───────────────────────────────► │   Express + TypeScript      │
│   (port 3000)        │                                  │   (port 4000)               │
│                      │                                  │                             │
│  Zustand (state)     │ ◄── WS progress events ───────── │   WebSocket Server (ws)     │
│  useWebSocket hook   │                                  │                             │
│  @react-pdf/renderer │                                  │   BullMQ Worker             │
└──────────────────────┘                                  │   ├─ Groq API call          │
                                                          │   ├─ Zod validation         │
                                                          │   └─ MongoDB + Redis write  │
                                                          │                             │
                                                          │   MongoDB  (Mongoose)       │
                                                          │   Redis    (cache + queue)  │
                                                          └────────────────────────────┘
                                                                       │
                                                          ┌────────────┴───────────┐
                                                          │   Docker Compose        │
                                                          │   mongo:7 + redis:7     │
                                                          └────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
| --- | --- | --- |
| Frontend | Next.js 14 (App Router) + TypeScript | File-based routing, server components, fast DX |
| Styling | Tailwind CSS | Utility-first, no CSS files to maintain |
| State | Zustand | Minimal boilerplate, no provider wrapping |
| Real-time | Native WebSocket (`ws` server + browser `WebSocket`) | No polling; server pushes progress at each stage |
| Backend | Node.js + Express + TypeScript | Familiar REST setup, easy middleware composition |
| Database | MongoDB via Mongoose | Flexible schema for evolving question types |
| Queue | BullMQ + Redis | Durable job queue; AI call runs in a worker, not the request cycle |
| Cache | Redis (ioredis) | Result cached for 1 hour; repeat loads are instant |
| AI | Groq API (OpenAI-compatible SDK) | Fast inference, `json_object` response format enforced |
| Validation | Zod | Runtime schema validation on both request body and AI response |
| File parsing | multer + pdf-parse | Accepts PDF/TXT context files; text extracted server-side |
| PDF export | @react-pdf/renderer | Generates downloadable, properly formatted exam PDF |

---

## Folder Structure

```text
AI-Assessment-Creator/
├── docker-compose.yml          # MongoDB + Redis containers
├── .env.example                # All required env vars documented
│
├── backend/
│   ├── src/
│   │   ├── index.ts            # Express app + WS server + bootstrap
│   │   ├── types/index.ts      # Shared TypeScript types & enums
│   │   ├── models/
│   │   │   ├── Assignment.ts   # Mongoose model — stores form input + status
│   │   │   └── Result.ts       # Mongoose model — stores generated paper
│   │   ├── controllers/
│   │   │   ├── assignmentController.ts
│   │   │   └── resultController.ts
│   │   ├── routes/
│   │   │   ├── assignments.ts  # REST routes + multer + Zod validation
│   │   │   └── results.ts
│   │   ├── middleware/
│   │   │   ├── validate.ts     # Generic Zod request body validator
│   │   │   └── errorHandler.ts
│   │   ├── services/
│   │   │   ├── aiService.ts    # Groq API call + Zod schema validation of response
│   │   │   ├── redisService.ts # Job state cache + result cache
│   │   │   └── wsService.ts    # WebSocket room management + broadcast
│   │   └── queues/
│   │       ├── generationQueue.ts          # BullMQ queue definition
│   │       └── workers/generationWorker.ts # Job processor (AI → MongoDB → Redis)
│   └── tsconfig.json
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx              # Home — assignment list + search
        │   ├── create/page.tsx       # Create assignment form
        │   ├── assignments/page.tsx  # /assignments alias route
        │   ├── output/[id]/page.tsx  # Generated paper viewer
        │   ├── layout.tsx            # Root layout with sidebar + mobile nav
        │   ├── globals.css           # Tailwind base + brand colours
        │   └── not-found.tsx         # 404 page
        ├── components/
        │   ├── create/               # Form sub-components (stepper, file upload, etc.)
        │   ├── output/               # Paper renderer (sections, questions, badges)
        │   ├── layout/               # Sidebar, TopBar, MobileBottomNav, VedaLogo
        │   └── ui/                   # Primitives — Button, Input, Badge
        ├── hooks/
        │   └── useWebSocket.ts       # Connects WS, dispatches progress to store
        ├── lib/
        │   ├── api.ts                # Typed axios wrappers for all API calls
        │   └── pdfExport.tsx         # @react-pdf/renderer document definition
        ├── store/
        │   ├── useAssignmentStore.ts # Assignment list state
        │   └── useGenerationStore.ts # Active generation progress state
        └── types/index.ts            # Frontend TypeScript types
```

---

## End-to-End Flow

```text
1. Teacher fills form  →  POST /api/assignments
                           ├─ multer extracts file text (PDF/TXT)
                           ├─ Zod validates request body
                           ├─ Assignment saved to MongoDB (status: pending)
                           └─ BullMQ job enqueued

2. Frontend opens WebSocket connection for that assignmentId

3. BullMQ worker picks up job:
   10%  →  Preparing prompt
   30%  →  Calling Groq API  (structured JSON prompt, temperature 0.7)
   80%  →  Parsing + Zod-validating AI response
   95%  →  Saving Result to MongoDB + caching in Redis
   100% →  Emits { type: "completed", resultId }  over WebSocket

4. Frontend receives "completed" event  →  navigates to /output/[id]

5. Output page fetches GET /api/results/:assignmentId
   └─ Redis hit (1 hr TTL) → instant; miss → MongoDB query

6. Teacher downloads PDF  or  clicks Regenerate
   └─ Regenerate: POST /api/assignments/:id/regenerate
      re-enqueues job, same WebSocket flow repeats
```

---

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/assignments` | List all assignments |
| `POST` | `/api/assignments` | Create assignment + enqueue generation job |
| `GET` | `/api/assignments/:id` | Get single assignment |
| `DELETE` | `/api/assignments/:id` | Delete assignment + result |
| `POST` | `/api/assignments/:id/regenerate` | Re-enqueue generation for existing assignment |
| `GET` | `/api/results/:assignmentId` | Get generated question paper (Redis → MongoDB) |
| `GET` | `/health` | Health check |
| `WS` | `ws://localhost:4000` | Real-time progress events |

### WebSocket message types (server → client)

```json
{ "type": "progress", "percent": 30, "message": "Generating questions with AI…" }
{ "type": "completed", "resultId": "<mongoId>" }
{ "type": "failed", "error": "AI returned invalid JSON" }
```

---

## Environment Variables

Copy `.env.example` to `backend/.env` and `frontend/.env.local`.

| Variable | Used by | Description |
| --- | --- | --- |
| `PORT` | Backend | Express port (default `4000`) |
| `MONGODB_URI` | Backend | MongoDB connection string |
| `REDIS_URL` | Backend | Redis connection string |
| `GROK_API_KEY` | Backend | Groq API key from [console.groq.com](https://console.groq.com) |
| `GROK_MODEL` | Backend | Model ID (default `grok-3-latest`) |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend base URL |
| `NEXT_PUBLIC_WS_URL` | Frontend | WebSocket URL |

---

## Setup & Run

### Prerequisites

- Node.js 18+
- Docker + Docker Compose
- Groq API key — get one free at [console.groq.com](https://console.groq.com)

### 1. Start infrastructure

```bash
docker compose up -d
```

Starts MongoDB on `27017` and Redis on `6379` with persistent volumes.

### 2. Backend

```bash
cd backend
cp ../.env.example .env
# Open .env and set GROK_API_KEY=your_key_here
npm install
npm run dev
```

Server starts at `http://localhost:4000`. You should see:

```text
[MongoDB] Connected to mongodb://localhost:27017/assessment-creator
[Worker] Generation worker started
[Server] Running on http://localhost:4000
[WS]     WebSocket ready on ws://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp ../.env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Design Decisions

**Background queue (BullMQ) instead of inline API call**
AI generation can take 5–15 seconds. Doing it synchronously would block the request and timeout on slow connections. BullMQ runs the job in a worker process; the HTTP response returns immediately with the assignment ID.

**Zod validation on AI response**
The Groq API is instructed to return `json_object` format, but LLM output is not guaranteed to match any schema. Every response is validated against a strict Zod schema before being stored. Invalid responses throw a descriptive error rather than silently storing malformed data.

**WebSocket rooms per assignmentId**
Each assignment gets its own WebSocket "room" (a `Map<assignmentId, Set<WebSocket>>`). Progress events are scoped to that room so multiple teachers can use the app simultaneously without receiving each other's events.

**Redis dual role**
Redis is used both as the BullMQ job broker and as a 1-hour result cache. The `getResult` endpoint checks Redis first, falling back to MongoDB only on a cache miss.

**File context injection**
PDF and TXT uploads are parsed server-side (pdf-parse / UTF-8 decode) and the first 2500 characters are appended to the AI prompt as reference material. This lets teachers generate questions grounded in their own content.

---

## Features

- Generate structured exam papers with multiple question types (MCQ, short answer, long answer, fill-in-the-blank, etc.)
- Real-time progress bar via WebSocket — no polling
- Configurable per question type: count + marks per question
- Optional file upload (PDF / TXT) as question context
- Difficulty badges — Easy (green) / Medium (amber) / Hard (red)
- One-click PDF export with proper exam formatting
- Regenerate button to get a fresh paper for the same assignment
- Redis caching — repeat views load instantly
- Mobile-responsive layout with bottom navigation
- Assignment list with search, status indicators, and delete
