# Antigravity Prompt Guide — Planogram Compliance System

Use these prompts in order. Run one phase at a time.
Always start each session with /grill-me to let the agent clarify before acting.
Reference PROJECT_CONTEXT.md in every prompt.

---

## Phase 1 — Foundation

### 1.1 Backend scaffold
```
/goal
Scaffold the Node.js Express backend at /backend based on PROJECT_CONTEXT.md.

Create this folder structure:
  backend/
    src/
      config/        → db.js (pg pool), redis.js (ioredis), minio.js, env.js
      middleware/    → auth.js (JWT verify), role.js (role guard), upload.js (multer)
      queues/        → complianceQueue.js, embeddingQueue.js (BullMQ setup)
      workers/       → complianceWorker.js, embeddingWorker.js
      routes/        → auth.js, admin.js, agent.js, clientManager.js
      controllers/   → one per route file
      utils/         → errors.js
    index.js

Install: express, pg, ioredis, bullmq, jsonwebtoken, bcrypt, multer, sharp, axios, minio, dotenv
Create .env.example with all required env vars.
Do not implement any business logic yet — just scaffold with placeholder handlers.
```

### 1.2 Database setup
```
/goal
Create the full PostgreSQL schema at /backend/src/db/schema.sql
based on PROJECT_CONTEXT.md database schema section.

Requirements:
- Enable pgvector extension at top of file
- Create ENUM types before tables
- All primary keys UUID using gen_random_uuid()
- All foreign keys with ON DELETE RESTRICT
- Indexes on: client_id, store_id, section_id, agent_id, planogram_id, status columns
- Do not skip any of the 13 tables
```

### 1.3 Frontend scaffold
```
/goal
Scaffold the Angular 19 frontend at /frontend based on PROJECT_CONTEXT.md.

Create this structure:
  frontend/src/app/
    core/
      guards/        → auth.guard.ts, role.guard.ts
      interceptors/  → auth.interceptor.ts (attach JWT, handle 401 refresh)
      services/      → auth.service.ts
    shared/
      components/    → empty for now
    features/
      admin/         → empty module
      agent/         → empty module
      client-manager/ → empty module
    app.routes.ts    → lazy load each feature module with role guards

Install NG-Zorro and Chart.js.
Do not implement any screens yet — scaffold only.
```

### 1.4 Python CV service scaffold
```
/goal
Scaffold the Python FastAPI CV service at /cv-service based on PROJECT_CONTEXT.md.

Create this structure:
  cv-service/
    app/
      main.py              → FastAPI app, register routers
      routers/
        compliance.py      → POST /process/compliance (placeholder)
        embedding.py       → POST /process/embedding (placeholder)
        health.py          → GET /health
      services/
        detector.py        → YOLOv8 detection (placeholder)
        embedder.py        → ResNet50 embedding (placeholder)
        matcher.py         → cosine similarity matching (placeholder)
        scorer.py          → compliance scoring (placeholder)
        annotator.py       → draw bounding boxes (placeholder)
      db/
        queries.py         → planogram fetch queries (placeholder)
    requirements.txt       → fastapi, uvicorn, ultralytics, torch, torchvision, opencv-python, faiss-cpu, numpy, Pillow, psycopg2-binary
    .env.example

Do not implement CV logic yet — scaffolding only.
```

---

## Phase 2 — Auth

```
/goal
Implement JWT authentication in /backend based on PROJECT_CONTEXT.md auth section.

Implement:
1. POST /api/auth/login
   - Validate email + password
   - bcrypt compare
   - Sign access token (15min) with userId, role, clientId, storeIds in payload
   - Set refresh token (7 days) as httpOnly cookie
   - Return access token in response body

2. POST /api/auth/refresh
   - Read refresh token from httpOnly cookie
   - Verify and issue new access token

3. POST /api/auth/logout
   - Clear refresh token cookie

4. auth.js middleware
   - Verify access token on every protected route
   - Attach decoded payload to req.user

5. role.js middleware
   - Factory function: requireRole('admin') | requireRole('agent') | requireRole('client_manager')
```

---

## Phase 3 — Admin APIs

```
/goal
Implement all admin API endpoints in /backend based on PROJECT_CONTEXT.md admin endpoints section.

Implement in this order:
1. Client CRUD (GET, POST /api/clients)
2. Store CRUD under client
3. Section CRUD under store
4. User creation (agent + client_manager)
5. Agent-store assignment
6. Reference product upload → trigger BullMQ embedding_generation job
7. Planogram CRUD + activate endpoint
8. Planogram cells bulk insert
9. Flags list + resolve

All routes protected by auth middleware + requireRole('admin').
All queries parameterized. UUIDs generated server-side.
```

---

## Phase 4 — BullMQ Workers

```
/goal
Implement BullMQ workers in /backend based on PROJECT_CONTEXT.md BullMQ section.

1. embeddingWorker.js
   - Process jobs from embedding_generation queue
   - Call Python POST /process/embedding with { referenceProductId, imagePath }
   - On success: update reference_products.embedding_status = 'complete'
   - On failure: update status = 'failed'
   - Concurrency: 5

2. complianceWorker.js
   - Process jobs from compliance_check queue
   - Update compliance_job status = 'processing'
   - Call Python POST /process/compliance with { jobId, shelfImagePath, planogramId, sectionId, storeId }
   - On success:
       Save compliance_results row
       Save all compliance_violations rows (normalized)
       Update store_scores running average
       Evaluate flagging rules (see PROJECT_CONTEXT.md flagging section)
       Update compliance_job status = 'complete'
   - On failure: update job status = 'failed'
   - Concurrency: 3, retries: 2 with exponential backoff
```

---

## Phase 5 — Agent APIs

```
/goal
Implement agent API endpoints in /backend based on PROJECT_CONTEXT.md agent endpoints section.

1. GET /api/agent/stores
   - Return only stores where agent has an active assignment
   - Filter using storeIds from req.user JWT payload

2. POST /api/compliance/jobs
   - Accept multipart image upload (multer)
   - Resize with Sharp before saving to MinIO (shelf-images/ bucket)
   - Create compliance_job record (status: queued)
   - Push job to BullMQ compliance_check queue
   - Return { jobId }

3. GET /api/compliance/jobs/:id
   - Return job status — used for polling

4. GET /api/compliance/results/:jobId
   - Return full compliance result with violations

All routes: requireRole('agent')
```

---

## Phase 6 — Python CV Pipeline

```
/goal
Implement the full CV pipeline in /cv-service based on PROJECT_CONTEXT.md Python CV pipeline section.

Implement in app/services/ in this exact order:

1. detector.py — YOLOv8 inference, single class 'product', returns bounding boxes
2. embedder.py — ResNet50 with FC head removed, returns 2048-d numpy vector per crop
3. matcher.py — fetch expected product embedding from DB by planogram cell, cosine similarity
4. scorer.py — gap calculation, facing count, compute product_accuracy / spacing_accuracy / facing_accuracy / overall_score
5. annotator.py — draw green (correct) / red (violation) boxes on image using Pillow, save to MinIO

Then wire in compliance.py router:
  POST /process/compliance
  - Fetch planogram cells from DB
  - Run detector → cluster rows → embedder → matcher → scorer → annotator
  - Return full result JSON

And embedding.py router:
  POST /process/embedding
  - Load image, run embedder
  - Save vector to reference_products.embedding via psycopg2
  - Return { status: 'complete' }
```

---

## Phase 7 — Frontend Screens

### Admin screens
```
/goal
Build Angular admin screens at /frontend/src/app/features/admin/ using NG-Zorro.

Screens:
1. Client list + create client form
2. Store list per client + create store form
3. Section list per store + create section form
4. User management: list agents and client managers, create user, assign agent to store
5. Reference product management: list products per client, upload image, show embedding status badge
6. Planogram builder: grid UI (row × position), select product per cell, set facing count, activate button
7. Flagged stores dashboard: table with flag reason, flagged date, resolve button

All API calls via Angular services. Role guard: admin only.
```

### Agent screen
```
/goal
Build Angular agent screen at /frontend/src/app/features/agent/ using NG-Zorro.
Mobile-responsive layout.

Screens:
1. My stores list (only assigned stores)
2. Section selection under a store
3. Image upload screen with camera/gallery input
4. Processing status screen with polling every 3 seconds
5. Result screen:
   - Annotated shelf image (Canvas overlay for bounding boxes)
   - Overall score percentage (large, color coded green/yellow/red)
   - Per-metric scores: product_accuracy, spacing_accuracy, facing_accuracy
   - Violation list table: row, position, expected product, found product, violation type
```

### Client Manager screen
```
/goal
Build Angular client manager screen at /frontend/src/app/features/client-manager/ using NG-Zorro.

Screens:
1. Store overview dashboard
   - Cards per store with color-coded score (green >85%, yellow 70-85%, red <70%, grey = overdue)
2. Store detail:
   - Compliance history list
   - Trend chart (Chart.js line chart, score over time per section)
   - Violation breakdown (Chart.js bar chart, violations by type)
3. Export button → download PDF or CSV
```

---

## Useful Antigravity Commands

```
/grill-me     → run at start of every session, let agent ask clarifying questions
/goal         → define the task, agent works autonomously
/browser      → force agent to open browser and test the running app
```

## Tips
- Always run /grill-me before /goal on a new phase
- Review the Artifact (task plan) before agent starts writing code
- Comment on the Artifact if anything deviates from PROJECT_CONTEXT.md
- Test Phase 2 (auth) completely before moving to Phase 3
- Run the Python CV pipeline end-to-end with a test image before wiring BullMQ workers
