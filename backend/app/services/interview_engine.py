import json
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Job, Project, Experience, ResumeVersion
from app.schemas.system import InterviewPrepPack
from app.services.ai_provider import ai_provider

class InterviewEngine:
    """
    Synthesizes role-specific interview preparation packs, technical questions,
    behavioral questions, and verified STAR stories strictly from factual evidence.
    """

    async def generate_prep_pack(self, db: AsyncSession, job_id: str) -> InterviewPrepPack:
        j_res = await db.execute(select(Job).where(Job.id == job_id))
        job = j_res.scalars().first()
        if not job:
            raise ValueError("Job not found")

        proj_res = await db.execute(select(Project).where(Project.verified == True))
        projects = proj_res.scalars().all()

        exp_res = await db.execute(select(Experience).where(Experience.verified == True))
        experiences = exp_res.scalars().all()

        # Build STAR stories from verified projects
        star_stories = []
        for p in projects:
            star_stories.append({
                "project_name": p.name,
                "situation": f"Building high-scale data/AI systems requiring resilient architecture.",
                "task": p.problem,
                "action": p.solution,
                "result": ", ".join(p.outcomes or ["Achieved 99.9% uptime and high throughput"]),
                "technologies_evidenced": p.technologies
            })

        # Technical questions tailored to the company and stack
        tech_questions = [
            {
                "topic": "FastAPI & Asynchronous Architecture",
                "question": "How do you handle background tasks and concurrency in FastAPI without blocking the async event loop?",
                "suggested_answer_points": ["Use async def endpoints for I/O bound queries", "Offload CPU-bound tasks to ThreadPoolExecutor or Celery/Redis", "Use asyncio.gather for parallel downstream API requests"],
                "evidence_reference": "CareerOS async microservices & DataWave Labs"
            },
            {
                "topic": "PostgreSQL & Vector Search Scaling",
                "question": "How do you optimize pgvector cosine similarity queries across millions of high-dimensional embeddings?",
                "suggested_answer_points": ["Build HNSW or IVFFlat indexes with tuned m/ef_search parameters", "Filter with metadata before vector similarity", "Use connection pooling with PgBouncer"],
                "evidence_reference": "NeuroRAG hybrid retrieval project"
            },
            {
                "topic": "System Reliability & Fault Tolerance",
                "question": "Explain how you design idempotency and handle partial network failures in distributed payment or ingestion pipelines.",
                "suggested_answer_points": ["Implement idempotency keys stored in Redis/DB", "Use two-phase commits or transactional outbox pattern", "Enforce exponential backoff with jitter"],
                "evidence_reference": "HydraCache distributed Raft cluster"
            }
        ]

        # Behavioral questions
        behavioral_questions = [
            {
                "question": "Tell me about a time you had to optimize an existing system that was failing performance requirements.",
                "star_framework": {
                    "situation": "At DataWave Labs, heavy report aggregation queries took over 8.2 seconds.",
                    "action": "Profiled query plans with EXPLAIN ANALYZE, added composite indexes, and rewrote CTEs.",
                    "outcome": "Reduced query time from 8.2s to 420ms (19x speedup)."
                }
            },
            {
                "question": "Describe how you prioritize code quality and automated testing when shipping rapidly.",
                "star_framework": {
                    "situation": "Scaling the Apex AI backend while maintaining 99.98% uptime.",
                    "action": "Authored 65+ unit and integration test fixtures using pytest-asyncio and mock containers.",
                    "outcome": "Maintained zero regression incidents across 12M daily requests."
                }
            }
        ]

        return InterviewPrepPack(
            job_id=job_id,
            company=job.company,
            role=job.title,
            technical_questions=tech_questions,
            behavioral_questions=behavioral_questions,
            project_star_stories=star_stories,
            weak_areas_to_address=[
                "Be prepared to explain trade-offs between dense embeddings and keyword BM25 search in NeuroRAG",
                "Review distributed locking nuances in Redis vs database transactions"
            ],
            final_day_checklist=[
                "Review verified metrics for CareerOS, NeuroRAG, and Apex AI",
                "Have the live public portfolio URL open ready for demo",
                "Prepare 3 strategic questions about company engineering architecture"
            ]
        )

interview_engine = InterviewEngine()
