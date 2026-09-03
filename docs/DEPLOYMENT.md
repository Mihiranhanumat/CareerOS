# Production Deployment Guide

CareerOS is containerized and ready for single-node Docker Compose or cloud hosting (Vercel + Railway/Render + Supabase).

## Option 1: Full Docker Compose Deployment

```bash
# 1. Clone repository
git clone https://github.com/alex-mercer-dev/CareerOS.git
cd CareerOS

# 2. Configure environment
cp .env.example .env
# Edit .env with your secrets

# 3. Build and launch containers
docker compose up --build -d
```

Services started:
- `careeros-frontend` (Next.js on port 3000)
- `careeros-backend` (FastAPI on port 8000)
- `careeros-db` (PostgreSQL + pgvector on port 5432)

---

## Option 2: Cloud Hybrid Deployment

1. **Database**: Supabase PostgreSQL with `pgvector` extension enabled.
2. **Backend**: Deploy `backend/` to Railway, Render, or Google Cloud Run. Set environment variables from `.env.example`.
3. **Frontend**: Deploy `frontend/` to Vercel. Set `NEXT_PUBLIC_API_URL` to your production backend URL.
4. **Storage**: Configure Supabase Storage bucket `resumes` for public ATS PDF serving.
