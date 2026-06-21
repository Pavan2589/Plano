# Planogram Compliance System — Project Context

## Overview
An FMCG retail intelligence tool that enables brands (Nestlé, Ferrero) to verify
whether their products are correctly placed on store shelves according to defined
planogram specifications. Field agents capture shelf images which are processed
automatically using computer vision to detect compliance violations and generate
actionable reports.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19, NG-Zorro, Chart.js, Canvas API |
| Backend | Node.js, Express.js, BullMQ, ioredis |
| CV Microservice | Python 3.10+, FastAPI, YOLOv8 (ultralytics), ResNet50, FAISS, OpenCV |
| Database | PostgreSQL 15 + pgvector extension |
| Queue | BullMQ + Redis 7 |
| Object Storage | MinIO (self-hosted, S3-compatible) |
| Auth | JWT (access token 15min) + Refresh token (7 days, httpOnly cookie) |
| Password hashing | bcrypt (10 salt rounds) |

---

## Project Folder Structure

```
planogram-compliance/
  ├── GEMINI.md
  ├── PROJECT_CONTEXT.md
  ├── frontend/          → Angular 19 app
  ├── backend/           → Node.js Express API
  └── cv-service/        → Python FastAPI microservice
```

---

## Roles

| Role | Description | Access |
|------|-------------|--------|
| Admin | System administrator (Accenture-side) | Full system access |
| Agent | Field staff who visits stores (mobile) | Assigned stores only, upload + view results |
| Client Manager | Brand-side stakeholder (Nestlé/Ferrero) | Read-only for their client, export reports |

### JWT Token Payload
```json
{
  "userId": "uuid",
  "role": "admin | agent | client_manager",
  "clientId": "uuid or null",
  "storeIds": ["uuid1", "uuid2"]
}
```

---

## App Flow

### Phase 1 — Admin Setup
```
Admin logs in
  → Creates client (e.g. Nestlé)
  → Creates stores under client (DMart Velachery, DMart OMR)
  → Creates sections under each store (Chocolate, Biscuits, Beverages)
  → Creates agent accounts → assigns to specific stores
  → Creates client manager account → assigns to a client

  → Uploads reference product images per client
      (KitKat 4-finger, Ferrero Rocher, Raffaello...)
      → BullMQ triggers embedding_generation job per image
      → Python generates 2048-d ResNet50 embedding
      → Saved to reference_products.embedding (pgvector)
      → Status: pending → processing → complete

  → Creates planogram for each section
      → Defines grid: Row × Position → expected product
      → Sets facing count per cell
      → Marks planogram as active
      → Only one active planogram per section at a time
      → Old planograms preserved for historical accuracy
```

### Phase 2 — Agent Visit
```
Agent logs in (mobile-responsive Angular)
  → Sees only their assigned stores
  → Selects store → selects section
  → Uploads shelf image (camera or gallery)
  → Node creates compliance_job (status: queued)
  → Job pushed to BullMQ compliance_check queue
  → Angular polls job status
```

### Phase 3 — Background Processing
```
BullMQ picks up compliance_check job
  → Node worker calls Python FastAPI /process/compliance

Python pipeline:
  1. Receive shelf image + planogram_id
  2. Fetch planogram cells from DB (expected grid)
  3. CLAHE preprocessing (lighting normalization)
  4. YOLOv8 detects all products → bounding boxes [x,y,w,h,conf]
  5. Cluster boxes by Y coordinate → shelf rows
  6. Sort each row by X coordinate → positions
  7. Crop each bounding box
  8. ResNet50 embeds each crop → 2048-d vector
  9. Per cell: cosine similarity vs expected product embedding (direct lookup, not search)
  10. Gap calculation: pixel distance between adjacent boxes per row
  11. Facing count: consecutive same-product boxes per row
  12. Compute scores: product_accuracy, spacing_accuracy, facing_accuracy, overall_score
  13. Draw annotated image (green = correct, red = violation)
  14. Save annotated image to MinIO
  15. Return JSON result to Node

Node on completion:
  → Save compliance_results
  → Save compliance_violations (normalized)
  → Update store_scores (running average)
  → Evaluate flagging rules:
      avg score < 70% over last 5 checks → flag: low_score
      same cell violation 3 consecutive checks → flag: recurring_violation
      no submission in 7 days → flag: overdue_submission
  → Update compliance_job status → complete
```

### Phase 4 — Agent Views Result
```
Angular polling detects job complete
  → Displays:
      Annotated shelf image with colored bounding boxes
      Overall score (e.g. 82%)
      Per-metric scores: product_accuracy, spacing_accuracy, facing_accuracy
      Violation list:
        Row 1, Pos 3 — expected Ferrero, found Raffaello
        Row 2, Pos 1 — missing product (gap detected)
        Row 1, Pos 5 — spacing violation (gap too large)
```

### Phase 5 — Client Manager Reviews
```
Client Manager logs in
  → Sees only their client's stores
  → Color-coded store dashboard:
      green  = avg score > 85%
      yellow = avg score 70–85%
      red    = avg score < 70% (flagged)
      grey   = no submission in 7 days (overdue)
  → Drill into store → compliance history, trend chart, violation breakdown
  → Export PDF / CSV report
```

### Phase 6 — Admin Monitors
```
Admin dashboard
  → Flagged stores list (low_score, recurring_violation, overdue_submission)
  → Resolve flags with notes
  → Update planograms (old preserved, new set active)
  → Add new SKU → upload reference image → embedding job → available immediately
```

---

## Database Schema

> All primary keys are UUID. All tables have created_at TIMESTAMP.
> Use pgvector extension for embedding columns.

### clients
```sql
id            UUID PRIMARY KEY
name          VARCHAR        -- Nestlé, Ferrero
contact_email VARCHAR
is_active     BOOLEAN DEFAULT true
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### stores
```sql
id         UUID PRIMARY KEY
client_id  UUID REFERENCES clients(id)
name       VARCHAR        -- DMart Velachery
location   VARCHAR
is_active  BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP
```

### sections
```sql
id         UUID PRIMARY KEY
store_id   UUID REFERENCES stores(id)
name       VARCHAR        -- Chocolate Section, Biscuits Section
is_active  BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP
```

### users
```sql
id            UUID PRIMARY KEY
name          VARCHAR
email         VARCHAR UNIQUE
password_hash VARCHAR
role          ENUM ('admin', 'agent', 'client_manager')
client_id     UUID REFERENCES clients(id)  -- null for admin
is_active     BOOLEAN DEFAULT true
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### agent_store_assignments
```sql
id          UUID PRIMARY KEY
agent_id    UUID REFERENCES users(id)
store_id    UUID REFERENCES stores(id)
assigned_at TIMESTAMP
is_active   BOOLEAN DEFAULT true
```

### reference_products
```sql
id               UUID PRIMARY KEY
client_id        UUID REFERENCES clients(id)
name             VARCHAR        -- KitKat 4-finger
sku_code         VARCHAR
image_url        VARCHAR
embedding        VECTOR(2048)   -- pgvector
embedding_status ENUM ('pending', 'processing', 'complete', 'failed')
created_at       TIMESTAMP
updated_at       TIMESTAMP
```

### planograms
```sql
id                  UUID PRIMARY KEY
section_id          UUID REFERENCES sections(id)
name                VARCHAR
is_active           BOOLEAN DEFAULT false
reference_image_url VARCHAR
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### planogram_cells
```sql
id                   UUID PRIMARY KEY
planogram_id         UUID REFERENCES planograms(id)
row                  INTEGER
position             INTEGER
reference_product_id UUID REFERENCES reference_products(id)
facing_count         INTEGER DEFAULT 1
created_at           TIMESTAMP
```

### compliance_jobs
```sql
id            UUID PRIMARY KEY
store_id      UUID REFERENCES stores(id)
section_id    UUID REFERENCES sections(id)
agent_id      UUID REFERENCES users(id)
planogram_id  UUID REFERENCES planograms(id)
shelf_image_url VARCHAR
status        ENUM ('queued', 'processing', 'complete', 'failed')
bullmq_job_id VARCHAR
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### compliance_results
```sql
id                   UUID PRIMARY KEY
job_id               UUID REFERENCES compliance_jobs(id)
store_id             UUID REFERENCES stores(id)
section_id           UUID REFERENCES sections(id)
overall_score        DECIMAL(5,2)
product_accuracy     DECIMAL(5,2)
spacing_accuracy     DECIMAL(5,2)
facing_accuracy      DECIMAL(5,2)
annotated_image_url  VARCHAR
violations_json      JSONB
created_at           TIMESTAMP
```

### compliance_violations
```sql
id                  UUID PRIMARY KEY
result_id           UUID REFERENCES compliance_results(id)
row                 INTEGER
position            INTEGER
violation_type      ENUM ('wrong_product', 'missing_product', 'gap_violation', 'facing_violation')
expected_product_id UUID REFERENCES reference_products(id)
detected_product_id UUID REFERENCES reference_products(id)  -- null if missing
expected_gap        DECIMAL
detected_gap        DECIMAL
created_at          TIMESTAMP
```

### store_scores
```sql
id            UUID PRIMARY KEY
store_id      UUID REFERENCES stores(id)
section_id    UUID REFERENCES sections(id)
avg_score     DECIMAL(5,2)
total_checks  INTEGER
last_check_at TIMESTAMP
updated_at    TIMESTAMP
```

### store_flags
```sql
id          UUID PRIMARY KEY
store_id    UUID REFERENCES stores(id)
section_id  UUID REFERENCES sections(id)  -- null if store-level flag
flag_reason ENUM ('low_score', 'recurring_violation', 'overdue_submission')
flagged_at  TIMESTAMP
resolved_at TIMESTAMP    -- null if still active
resolved_by UUID REFERENCES users(id)
is_active   BOOLEAN DEFAULT true
notes       TEXT
```

---

## API Endpoints

### Auth
```
POST   /api/auth/login           Login, returns access + refresh token
POST   /api/auth/refresh         Exchange refresh token for new access token
POST   /api/auth/logout          Invalidate refresh token
```

### Admin
```
GET    /api/clients                          List clients
POST   /api/clients                          Create client
GET    /api/clients/:id/stores               List stores under client
POST   /api/clients/:id/stores               Create store
GET    /api/stores/:id/sections              List sections
POST   /api/stores/:id/sections              Create section
POST   /api/users                            Create agent or client manager
POST   /api/agent-assignments                Assign agent to store
POST   /api/reference-products              Upload reference product image
GET    /api/reference-products/:id/status   Check embedding job status
GET    /api/planograms                       List planograms
POST   /api/planograms                       Create planogram
POST   /api/planograms/:id/cells             Define planogram grid cells
PATCH  /api/planograms/:id/activate          Set planogram as active
GET    /api/flags                            List all active store flags
PATCH  /api/flags/:id/resolve                Resolve a store flag
```

### Agent
```
GET    /api/agent/stores                     Get assigned stores
GET    /api/stores/:id/sections              Get sections under a store
POST   /api/compliance/jobs                  Upload shelf image, create job
GET    /api/compliance/jobs/:id              Poll job status
GET    /api/compliance/results/:jobId        Fetch full result
```

### Client Manager
```
GET    /api/client/stores                    All stores for this client
GET    /api/client/stores/:id/results        Compliance history for a store
GET    /api/client/stores/:id/scores         Aggregated scores and trends
GET    /api/client/results/:id/export        Export as PDF or CSV
```

### Python FastAPI (internal, not exposed)
```
POST   /process/compliance                   Run full compliance pipeline
POST   /process/embedding                    Generate embedding for reference image
GET    /health                               Health check
```

---

## BullMQ Queues

### compliance_check
```
Triggered by: Agent image upload
Job data:     { jobId, shelfImagePath, planogramId, sectionId, storeId }
Worker:       Node.js → calls Python /process/compliance
Concurrency:  3
Retries:      2 with exponential backoff
On complete:  Save results, update store_scores, evaluate flags
On failure:   Update job status to failed
```

### embedding_generation
```
Triggered by: Admin reference product image upload
Job data:     { referenceProductId, imagePath }
Worker:       Node.js → calls Python /process/embedding
Concurrency:  5
On complete:  Update reference_products.embedding_status to complete
On failure:   Update embedding_status to failed
```

---

## Compliance Scoring

| Metric | Formula |
|--------|---------|
| product_accuracy | correct product matches / total planogram cells |
| spacing_accuracy | gaps within threshold / total adjacent pairs |
| facing_accuracy | correct facing counts / total expected facings |
| overall_score | weighted average of above three |

## Store Flagging Rules

| Flag | Condition |
|------|-----------|
| low_score | avg score < 70% over last 5 checks |
| recurring_violation | same cell violation in 3 consecutive checks |
| overdue_submission | no compliance check submitted in 7 days |

---

## Key Design Decisions

1. YOLO trained on single class `product` only — never trained per SKU
2. Product identification via ResNet50 embeddings + cosine similarity (not YOLO classification)
3. New SKU = add reference image + run embedding job. Zero retraining.
4. Planogram cell comparison is a direct lookup (not nearest-neighbor search across all products)
5. Planograms are versioned — old ones preserved when a new one is activated
6. Python FastAPI is internal only — never exposed outside Node.js
7. MinIO used instead of AWS S3 for local/self-hosted storage
8. pgvector used instead of a separate vector DB (FAISS used inside Python pipeline only)
9. store_scores is a running aggregate — updated after every job, not recomputed
10. Agent's JWT embeds storeIds — data access scoped at token level
