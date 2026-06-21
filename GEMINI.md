# Planogram Compliance System — Agent Configuration

## Project Summary
An FMCG planogram compliance checker. Field agents upload shelf photos.
Computer vision pipeline detects product placement violations against a
defined planogram spec. Results are scored and flagged for brand managers.

## Critical Reference Files
- PROJECT_CONTEXT.md — full app flow, DB schema, all API endpoints, BullMQ design
- PRD_TRD.docx — full product and technical requirements

## Stack (do not deviate)
- Frontend:     Angular 19 + NG-Zorro + Chart.js
- Backend:      Node.js + Express.js + BullMQ + ioredis
- CV Service:   Python 3.10+ + FastAPI + YOLOv8 + ResNet50 + FAISS + OpenCV
- Database:     PostgreSQL 15 + pgvector extension
- Queue:        BullMQ + Redis 7
- Storage:      MinIO (S3-compatible, self-hosted)
- Auth:         JWT (15min access) + refresh token (7 days, httpOnly cookie)

## Folder Structure
```
planogram-compliance/
  ├── GEMINI.md
  ├── PROJECT_CONTEXT.md
  ├── frontend/      → Angular 19
  ├── backend/       → Node.js Express
  └── cv-service/    → Python FastAPI
```

## Coding Rules (always follow)
- UUID primary keys on every table — never auto-increment integers
- async/await everywhere — no callbacks, no .then() chains
- All DB queries must be parameterized — no string concatenation in SQL
- Role enforcement middleware on every protected route
- Agent data scoped by storeIds in JWT payload — filter all queries server-side
- Never expose Python FastAPI service externally — internal only via Node.js
- MinIO paths: shelf-images/, reference-products/, annotated-results/
- Environment variables for all secrets — never hardcode
- All errors returned as { error: string, code: string } JSON

## Three Roles
- admin          → full access
- agent          → assigned stores only (storeIds in token)
- client_manager → their clientId only (clientId in token)

## BullMQ Queues
- compliance_check      → concurrency 3, retries 2
- embedding_generation  → concurrency 5

## Python CV Pipeline Order (do not reorder)
1. CLAHE preprocessing
2. YOLOv8 detection (single class: product)
3. Row clustering by Y coordinate
4. ResNet50 embedding per crop
5. Cosine similarity vs planogram expected product (direct lookup)
6. Gap calculation
7. Facing count check
8. Score computation
9. Annotate image → save to MinIO
10. Return JSON to Node

## What NOT to do
- Do not train YOLO on individual SKUs — single class 'product' only
- Do not use nearest-neighbor search for identification — use direct planogram cell lookup
- Do not expose cv-service port externally
- Do not use AWS S3 — MinIO only
- Do not use WidthType.PERCENTAGE in any docx generation
- Do not use sessionStorage or localStorage in Angular for tokens — httpOnly cookie for refresh token
