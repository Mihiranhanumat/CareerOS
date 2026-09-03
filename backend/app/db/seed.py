import asyncio
import hashlib
from datetime import datetime, timedelta
from sqlalchemy import select
from app.db.session import AsyncSessionLocal, init_db
from app.db.models import (
    Profile, ProfileVisibility, Skill, SkillEvidence, Project, ProjectSkill,
    Experience, Education, Certification, Achievement, Preference,
    ResumeFamily, ResumeVersion, Job, JobRequirement, JobMatch,
    Application, ApplicationEvent, ApplicationAnswer, PublicProfileSetting,
    GithubAccount, GithubRepository, GithubEvidence
)

async def seed_database():
    await init_db()

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        res = await db.execute(select(Profile))
        if res.scalars().first():
            print("Database already seeded with career facts.")
            return

        print("Seeding CareerOS database with canonical verified facts...")

        # 1. Profile
        profile = Profile(
            id="prof-alex-mercer",
            display_name="Alex Mercer",
            headline="Full-Stack AI & Distributed Systems Engineer",
            summary="Full-stack and AI systems engineer specializing in high-throughput FastAPI/Python services, Next.js web applications, vector search architectures, and agentic workflows. Proven track record building production RAG pipelines, distributed caching engines, and ATS-optimized document generators.",
            location="San Francisco, CA / Remote",
            email_public="alex.mercer.eng@gmail.com",
            phone_public="+1 (415) 555-0192",
            linkedin_url="https://linkedin.com/in/alex-mercer-ai",
            github_url="https://github.com/alex-mercer-dev",
            website_url="https://careeros.dev/alex-mercer",
            availability="Actively interviewing for Senior/Staff & Founding roles",
            created_at=datetime.utcnow() - timedelta(days=120)
        )
        db.add(profile)

        # 2. Profile Visibility
        visibilities = [
            ProfileVisibility(profile_id=profile.id, field_name="display_name", visibility="public"),
            ProfileVisibility(profile_id=profile.id, field_name="headline", visibility="public"),
            ProfileVisibility(profile_id=profile.id, field_name="summary", visibility="public"),
            ProfileVisibility(profile_id=profile.id, field_name="skills", visibility="public"),
            ProfileVisibility(profile_id=profile.id, field_name="projects", visibility="public"),
            ProfileVisibility(profile_id=profile.id, field_name="experience", visibility="public"),
            ProfileVisibility(profile_id=profile.id, field_name="github_url", visibility="public"),
            ProfileVisibility(profile_id=profile.id, field_name="linkedin_url", visibility="public"),
            ProfileVisibility(profile_id=profile.id, field_name="email_public", visibility="selective"),
            ProfileVisibility(profile_id=profile.id, field_name="phone_public", visibility="private"),
        ]
        db.add_all(visibilities)

        # 3. Public Profile Settings
        pub_settings = PublicProfileSetting(
            slug="alex-mercer",
            custom_domain=None,
            enabled=True,
            seo_title="Alex Mercer — AI & Systems Engineer Portfolio",
            seo_description="Verified software engineering portfolio, live projects, GitHub proof-of-work, and ATS resume.",
            public_cv_enabled=True,
            current_public_resume_id="res-backend-v1"
        )
        db.add(pub_settings)

        # 4. Resume Families
        families = [
            ResumeFamily(
                id="fam-swe",
                name="SWE / Software Engineering",
                slug="swe",
                description="General software engineering focus emphasizing algorithms, data structures, full-stack architecture, clean testing, and production reliability.",
                priority_rules=["Python", "TypeScript", "FastAPI", "React", "PostgreSQL", "Docker", "System Design"],
                section_order=["summary", "skills", "projects", "experience", "education", "certifications"],
                default_settings={"one_page": True, "ats_mode": True, "bullet_style": "action_metric"}
            ),
            ResumeFamily(
                id="fam-backend",
                name="Backend Developer",
                slug="backend",
                description="High-performance backend engineering focus emphasizing asynchronous APIs, distributed databases, caching, concurrency, and microservices.",
                priority_rules=["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "SQLAlchemy", "AsyncIO", "Kafka"],
                section_order=["summary", "skills", "projects", "experience", "education"],
                default_settings={"one_page": True, "ats_mode": True, "bullet_style": "action_metric"}
            ),
            ResumeFamily(
                id="fam-fullstack",
                name="Full-Stack Developer",
                slug="fullstack",
                description="End-to-end product development emphasizing Next.js/React frontend UX seamlessly connected to scalable Python/Node backends.",
                priority_rules=["TypeScript", "Next.js", "React", "Tailwind CSS", "Python", "FastAPI", "PostgreSQL"],
                section_order=["summary", "skills", "projects", "experience", "education"],
                default_settings={"one_page": True, "ats_mode": True, "bullet_style": "action_metric"}
            ),
            ResumeFamily(
                id="fam-datascience",
                name="Data Science / Data Analyst",
                slug="datascience",
                description="Quantitative data analysis, statistical modeling, exploratory data analysis, and scalable SQL/Pandas pipelines.",
                priority_rules=["Python", "SQL", "Pandas", "NumPy", "PostgreSQL", "Scikit-Learn", "Data Visualization"],
                section_order=["summary", "skills", "projects", "experience", "education"],
                default_settings={"one_page": True, "ats_mode": True, "bullet_style": "action_metric"}
            ),
            ResumeFamily(
                id="fam-ml-ai",
                name="Machine Learning / AI Engineer",
                slug="ml-ai",
                description="Deep learning models, neural architectures, PyTorch pipelines, vector indexing, and production ML deployment.",
                priority_rules=["Python", "PyTorch", "pgvector", "FastAPI", "Embeddings", "Docker", "Transformers"],
                section_order=["summary", "skills", "projects", "experience", "education"],
                default_settings={"one_page": True, "ats_mode": True, "bullet_style": "action_metric"}
            ),
            ResumeFamily(
                id="fam-nlp-genai",
                name="NLP / Generative AI Engineer",
                slug="nlp-genai",
                description="Large Language Model orchestration, RAG pipelines, agentic execution, structured prompting, and semantic search systems.",
                priority_rules=["Python", "Gemini API", "LLM Agents", "RAG", "pgvector", "LangChain", "FastAPI", "TypeScript"],
                section_order=["summary", "skills", "projects", "experience", "education"],
                default_settings={"one_page": True, "ats_mode": True, "bullet_style": "action_metric"}
            ),
            ResumeFamily(
                id="fam-general",
                name="General Placement Resume",
                slug="general",
                description="Balanced, concise profile highlighting well-rounded problem-solving, project leadership, and fast technology adoption.",
                priority_rules=["Python", "TypeScript", "FastAPI", "React", "PostgreSQL", "Git", "Testing"],
                section_order=["summary", "skills", "projects", "experience", "education", "achievements"],
                default_settings={"one_page": True, "ats_mode": True, "bullet_style": "action_metric"}
            )
        ]
        db.add_all(families)

        # 5. Skills
        skill_data = [
            ("Python", "languages", "python", "Expert", True, 1.0),
            ("TypeScript", "languages", "typescript", "Advanced", True, 1.0),
            ("SQL", "languages", "sql", "Advanced", True, 1.0),
            ("FastAPI", "backend", "fastapi", "Expert", True, 1.0),
            ("PostgreSQL", "backend", "postgresql", "Expert", True, 1.0),
            ("Next.js", "frontend", "nextjs", "Advanced", True, 1.0),
            ("React", "frontend", "react", "Advanced", True, 1.0),
            ("Tailwind CSS", "frontend", "tailwindcss", "Advanced", True, 1.0),
            ("Docker", "devops", "docker", "Advanced", True, 0.95),
            ("pgvector", "ai_ml", "pgvector", "Advanced", True, 1.0),
            ("Gemini API / LLMs", "ai_ml", "gemini_api", "Expert", True, 1.0),
            ("Playwright", "tools", "playwright", "Advanced", True, 0.9),
            ("Redis", "backend", "redis", "Intermediate", True, 0.85),
            ("PyTorch", "ai_ml", "pytorch", "Intermediate", True, 0.85),
            ("Git / CI-CD", "devops", "git", "Expert", True, 1.0),
        ]

        skills_dict = {}
        for name, cat, norm, prof, ver, conf in skill_data:
            s_id = f"sk-{norm}"
            s = Skill(
                id=s_id,
                name=name,
                category=cat,
                normalized_name=norm,
                proficiency=prof,
                verified=ver,
                confidence=conf
            )
            db.add(s)
            skills_dict[norm] = s

            # Add Evidence
            ev = SkillEvidence(
                skill_id=s_id,
                source_type="github",
                source_id="repo-careeros",
                evidence_text=f"Demonstrated production usage and architecture of {name} in multiple production repositories and published projects.",
                evidence_url="https://github.com/alex-mercer-dev",
                verification_state="verified",
                confidence=conf
            )
            db.add(ev)

        # 6. Projects
        proj1 = Project(
            id="proj-careeros",
            name="CareerOS — Personal AI Career & Placement Engine",
            slug="careeros",
            short_description="Agentic career operating system with pgvector semantic matching, 1-approval browser automation, and ATS resume synthesis.",
            problem="Job applicants struggle with scattered notes, repetitive ATS resume tailoring, unverified hallucinated bullet points, and brittle application trackers.",
            solution="Engineered an end-to-end verified career knowledge base that acts as the single source of truth for dynamic portfolio rendering, role-specific ATS resumes, and safe Playwright browser automation.",
            architecture="FastAPI async backend + Next.js App Router frontend + PostgreSQL/pgvector database + Gemini 2.0 Flash structured generation.",
            outcomes=[
                "Reduced resume tailoring time from 45 minutes to 4 seconds per opportunity",
                "Achieved 100% factuality verification against source evidence IDs with zero hallucinated claims",
                "Automated safe form autofill with human checkpoints for sensitive declarations"
            ],
            technologies=["Python", "FastAPI", "Next.js", "TypeScript", "PostgreSQL", "pgvector", "Playwright", "Docker"],
            github_url="https://github.com/alex-mercer-dev/CareerOS",
            demo_url="https://careeros.dev/alex-mercer",
            featured=True,
            verified=True
        )
        db.add(proj1)

        proj2 = Project(
            id="proj-neurorag",
            name="NeuroRAG — Hybrid Vector & Graph Semantic Retrieval Engine",
            slug="neurorag",
            short_description="High-throughput RAG search platform combining dense embeddings with sparse BM25 indexing and dynamic re-ranking.",
            problem="Standard vector search suffers from semantic drift and poor precision on technical keywords and exact IDs.",
            solution="Created a hybrid retrieval pipeline using reciprocal rank fusion (RRF), cross-encoder re-ranking, and pgvector cosine indexing.",
            architecture="Python AsyncIO backend, pgvector 0.5+, HuggingFace sentence-transformers, Redis cache layer, and FastAPI streaming responses.",
            outcomes=[
                "Improved retrieval recall@10 by 34% compared to vanilla dense embeddings",
                "Maintained p99 query latency under 48ms across 2.5 million indexed technical papers",
                "Built an interactive query visualization canvas in React and D3"
            ],
            technologies=["Python", "FastAPI", "pgvector", "PyTorch", "Redis", "Docker", "React"],
            github_url="https://github.com/alex-mercer-dev/NeuroRAG",
            demo_url="https://neurorag.demo.dev",
            featured=True,
            verified=True
        )
        db.add(proj2)

        proj3 = Project(
            id="proj-hydracache",
            name="HydraCache — Distributed In-Memory Key-Value Store",
            slug="hydracache",
            short_description="Raft-consensus distributed cache supporting write-ahead logging, consistent hashing, and Prometheus metrics.",
            problem="High-scale services require predictable microsecond cache latency with resilient leader election under network partitions.",
            solution="Implemented a distributed key-value cluster with consistent hashing rings, heartbeats, and TCP socket pooling in Python and Go.",
            architecture="Custom Raft protocol implementation, memory-mapped storage engine, snapshot compaction, and CLI monitoring tool.",
            outcomes=[
                "Sustained 85,000 requests/sec with sub-millisecond p95 latency on 3-node cluster",
                "Zero data loss during simulated split-brain network partition chaos tests"
            ],
            technologies=["Python", "AsyncIO", "Docker", "SQL", "Git"],
            github_url="https://github.com/alex-mercer-dev/HydraCache",
            demo_url=None,
            featured=False,
            verified=True
        )
        db.add(proj3)

        # 7. Experience
        exp1 = Experience(
            id="exp-1",
            organization="Apex AI Systems",
            title="Senior Backend & AI Engineer",
            location="San Francisco, CA",
            start_date="2024-01",
            end_date="Present",
            description="Leading development of high-throughput agentic backend services and vector database integrations for enterprise customers.",
            achievements=[
                "Architected asynchronous FastAPI microservices processing 12M+ daily requests with 99.98% uptime",
                "Implemented pgvector semantic caching that reduced third-party LLM API expenditure by $14,000/month",
                "Mentored 4 junior engineers on asynchronous Python design patterns and distributed system testing"
            ],
            technologies=["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "Gemini API"],
            verified=True
        )
        db.add(exp1)

        exp2 = Experience(
            id="exp-2",
            organization="DataWave Labs",
            title="Software Engineering Intern (Backend)",
            location="San Jose, CA",
            start_date="2023-05",
            end_date="2023-08",
            description="Engineered REST API endpoints, database migration scripts, and automated test suites for a real-time event analytics platform.",
            achievements=[
                "Optimized heavy PostgreSQL aggregation queries, cutting report generation time from 8.2s to 420ms",
                "Authored 65+ unit and integration test fixtures, boosting backend test coverage from 68% to 92%"
            ],
            technologies=["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "pytest", "Docker"],
            verified=True
        )
        db.add(exp2)

        # 8. Education
        edu1 = Education(
            id="edu-1",
            institution="University of California, Berkeley",
            degree="Bachelor of Science",
            field="Computer Science",
            start_date="2020-08",
            end_date="2024-05",
            grade="3.88 / 4.00 (High Honors)",
            coursework=["Distributed Systems", "Algorithms & Data Structures", "Artificial Intelligence", "Database Systems", "Operating Systems", "Computer Security"],
            verified=True
        )
        db.add(edu1)

        # 9. Certifications
        cert1 = Certification(
            id="cert-1",
            name="AWS Certified Solutions Architect – Associate",
            issuer="Amazon Web Services",
            credential_url="https://aws.amazon.com/verification",
            issue_date="2024-06",
            expiry_date="2027-06",
            verified=True
        )
        db.add(cert1)

        # 10. Achievements
        ach1 = Achievement(
            id="ach-1",
            title="1st Place Winner — Global AI Agent Hackathon 2024",
            organization="Google DeepMind / Antigravity",
            date="2024-11",
            description="Built an autonomous multi-agent verification system for academic paper peer review using Gemini 1.5 Pro.",
            evidence_url="https://hackathon.ai/winners/2024",
            verified=True
        )
        db.add(ach1)

        # 11. Preferences
        pref = Preference(
            id="pref-default",
            target_roles=["Backend Engineer", "Full-Stack AI Engineer", "Software Engineer", "AI Systems Engineer"],
            target_locations=["San Francisco, CA", "New York, NY", "Remote (US/Global)"],
            remote_preference="Remote or Hybrid",
            target_industries=["AI / Machine Learning", "Developer Tools", "Cloud Infrastructure", "FinTech"],
            target_companies=["Anthropic", "Stripe", "Linear", "Supabase", "OpenAI", "Datadog"],
            excluded_companies=["Spammy Marketing Agencies"],
            minimum_match_score=75,
            sponsorship_constraints="US Citizen / No visa sponsorship required",
            internship_or_fulltime="Full-time & Senior Placement",
            application_preferences={"auto_draft_cover_letter": True, "one_page_resume": True}
        )
        db.add(pref)

        # 12. GitHub Account & Sample Repo
        gh_acc = GithubAccount(
            id="gh-alex-mercer",
            provider="github",
            external_user_id="8492019",
            username="alex-mercer-dev",
            access_metadata={"connected": True, "synced_repos": 3}
        )
        db.add(gh_acc)

        gh_repo1 = GithubRepository(
            id="repo-careeros",
            github_account_id=gh_acc.id,
            name="CareerOS",
            full_name="alex-mercer-dev/CareerOS",
            description="Agentic AI placement platform with verified career knowledge base and ATS resume generation.",
            url="https://github.com/alex-mercer-dev/CareerOS",
            language="Python",
            stars=142,
            forks=28
        )
        db.add(gh_repo1)

        gh_ev = GithubEvidence(
            id="ghev-1",
            repository_id=gh_repo1.id,
            evidence_type="api_endpoint",
            evidence_text="FastAPI routers implementing async pgvector queries and Pydantic v2 schemas for verified career data validation.",
            source_path="backend/app/routers/resumes.py",
            detected_skill="FastAPI",
            confidence=0.98,
            proposal_status="approved"
        )
        db.add(gh_ev)

        # 13. Jobs & Explainable Matches
        # Job 1: Stripe Backend Engineer
        jd1 = """Stripe is looking for a Backend Software Engineer to build resilient distributed payment APIs. 
Requirements:
- Strong proficiency in Python or Go with async framework experience (FastAPI / Tornado).
- Experience with PostgreSQL, data modeling, and performance optimization.
- Familiarity with Docker and distributed system design.
- Bachelor's degree in Computer Science or equivalent practical experience.
- Strong focus on testing, code reliability, and API documentation."""
        
        jhash1 = hashlib.sha256(f"StripeBackend Engineer{jd1}".encode()).hexdigest()
        job1 = Job(
            id="job-stripe-backend",
            source="Direct Career Portal",
            external_id="stripe-req-8491",
            company="Stripe",
            title="Backend Software Engineer — Core Payments",
            location="San Francisco, CA / Remote",
            work_mode="Remote",
            url="https://stripe.com/jobs/backend-swe",
            description=jd1,
            posted_at="2 days ago",
            deadline="2026-10-15",
            normalized_hash=jhash1,
            status="APPROVED"
        )
        db.add(job1)

        reqs1 = [
            JobRequirement(job_id=job1.id, requirement_type="technical_skill", requirement_text="Python & Async FastAPI", normalized_skill="Python", mandatory=True),
            JobRequirement(job_id=job1.id, requirement_type="technical_skill", requirement_text="PostgreSQL & schema design", normalized_skill="PostgreSQL", mandatory=True),
            JobRequirement(job_id=job1.id, requirement_type="technical_skill", requirement_text="Docker containerization", normalized_skill="Docker", mandatory=True),
            JobRequirement(job_id=job1.id, requirement_type="education", requirement_text="BS in Computer Science", normalized_skill="Computer Science", mandatory=True),
            JobRequirement(job_id=job1.id, requirement_type="responsibility", requirement_text="Design high-throughput payment APIs", normalized_skill="FastAPI", mandatory=False),
        ]
        db.add_all(reqs1)

        match1 = JobMatch(
            id="match-stripe-1",
            job_id=job1.id,
            score=94,
            eligibility_score=1.0,
            skill_score=0.96,
            project_score=0.95,
            experience_score=0.92,
            preference_score=0.90,
            matched_evidence=[
                {"skill": "Python", "evidence": "Expert proficiency; built CareerOS and NeuroRAG in async Python."},
                {"skill": "PostgreSQL", "evidence": "Production experience optimizing 12M+ queries and pgvector indexes at Apex AI."},
                {"skill": "FastAPI", "evidence": "Core backend stack for all production microservices with p99 < 48ms."},
                {"skill": "Docker", "evidence": "Containerized multi-service architectures deployed across all projects."}
            ],
            missing_requirements=[
                {"requirement": "Kafka stream processing", "severity": "minor", "suggestion": "Highlight async queuing and Redis pub/sub experience"}
            ],
            explanation="Exceptional 94% match. Verified Python, FastAPI, and PostgreSQL evidence directly fulfills all mandatory technical requirements. BS in Computer Science from UC Berkeley confirms hard eligibility.",
            recommended_action="Apply with tailored Backend Resume"
        )
        db.add(match1)

        # Job 2: Anthropic AI Systems Engineer
        jd2 = """Anthropic is seeking an AI Systems & LLM Platform Engineer to build scalable evaluation and agentic execution pipelines.
Requirements:
- Deep experience with Python, LLM APIs (Gemini/Claude), and structured reasoning.
- Hands-on expertise with vector search, pgvector, or hybrid retrieval architectures.
- Experience with Next.js/TypeScript for developer inspection tools.
- Excellent background in automated evaluation and hallucination prevention."""

        jhash2 = hashlib.sha256(f"AnthropicAI Systems Engineer{jd2}".encode()).hexdigest()
        job2 = Job(
            id="job-anthropic-ai",
            source="Greenhouse",
            external_id="anthropic-ai-5501",
            company="Anthropic",
            title="AI Systems & Agent Platform Engineer",
            location="San Francisco, CA",
            work_mode="Hybrid",
            url="https://anthropic.com/careers/ai-systems",
            description=jd2,
            posted_at="1 day ago",
            deadline="2026-09-30",
            normalized_hash=jhash2,
            status="SHORTLISTED"
        )
        db.add(job2)

        match2 = JobMatch(
            id="match-anthropic-2",
            job_id=job2.id,
            score=96,
            eligibility_score=1.0,
            skill_score=0.98,
            project_score=0.96,
            experience_score=0.94,
            preference_score=0.95,
            matched_evidence=[
                {"skill": "Gemini API / LLMs", "evidence": "Created multi-agent orchestration engines and structured Pydantic extraction pipelines."},
                {"skill": "pgvector", "evidence": "Architected hybrid search engine in NeuroRAG and semantic caching at Apex AI."},
                {"skill": "TypeScript / Next.js", "evidence": "Built real-time dynamic portfolios and developer evaluation dashboards."}
            ],
            missing_requirements=[],
            explanation="Outstanding 96% match. Proven track record in agentic orchestration, pgvector retrieval, and zero-hallucination factuality verification matches Anthropic's core mission.",
            recommended_action="One-Click Approve and generate NLP/AI Resume"
        )
        db.add(match2)

        # 14. Initial Tailored Resume Snapshot
        resume1 = ResumeVersion(
            id="res-backend-v1",
            family_id="fam-backend",
            job_id=job1.id,
            version_name="Stripe_Backend_Engineer_v1",
            content_json={
                "header": {
                    "name": "Alex Mercer",
                    "headline": "Senior Backend & Distributed Systems Engineer",
                    "email": "alex.mercer.eng@gmail.com",
                    "phone": "+1 (415) 555-0192",
                    "location": "San Francisco, CA",
                    "github": "github.com/alex-mercer-dev",
                    "linkedin": "linkedin.com/in/alex-mercer-ai",
                    "website": "careeros.dev/alex-mercer"
                },
                "summary": "Backend and AI Systems Engineer with 3+ years of experience engineering high-throughput FastAPI services, PostgreSQL databases, and vector search systems. Proven success architecting microservices handling 12M+ daily requests with 99.98% uptime.",
                "skills": {
                    "Languages": ["Python", "TypeScript", "SQL", "Go (Basic)"],
                    "Backend & Data": ["FastAPI", "PostgreSQL", "SQLAlchemy", "AsyncIO", "Redis", "pgvector"],
                    "Cloud & DevOps": ["Docker", "Git", "CI/CD", "AWS", "Linux"],
                    "AI & Automation": ["Gemini API", "Playwright", "Vector Search", "Agentic Pipelines"]
                },
                "experience": [
                    {
                        "organization": "Apex AI Systems",
                        "title": "Senior Backend & AI Engineer",
                        "dates": "2024 - Present",
                        "bullets": [
                            "Architected asynchronous FastAPI microservices processing 12M+ daily requests with 99.98% uptime.",
                            "Implemented pgvector semantic caching that reduced third-party LLM API expenditure by $14,000/month.",
                            "Mentored 4 junior engineers on asynchronous Python design patterns and distributed system testing."
                        ]
                    },
                    {
                        "organization": "DataWave Labs",
                        "title": "Software Engineering Intern (Backend)",
                        "dates": "2023",
                        "bullets": [
                            "Optimized heavy PostgreSQL aggregation queries, cutting report generation time from 8.2s to 420ms.",
                            "Authored 65+ unit and integration test fixtures, boosting backend test coverage from 68% to 92%."
                        ]
                    }
                ],
                "projects": [
                    {
                        "name": "CareerOS — Personal AI Career & Placement Engine",
                        "stack": "Python, FastAPI, Next.js, PostgreSQL, pgvector, Playwright",
                        "bullets": [
                            "Engineered verified career knowledge base powering instant ATS resume generation and 1-approval browser automation.",
                            "Reduced per-job application tailoring latency to 4 seconds while enforcing 100% evidence-backed factuality."
                        ]
                    },
                    {
                        "name": "NeuroRAG — Hybrid Vector & Graph Semantic Retrieval Engine",
                        "stack": "Python, AsyncIO, pgvector, PyTorch, Redis, Docker",
                        "bullets": [
                            "Developed hybrid retrieval pipeline combining reciprocal rank fusion (RRF) and pgvector cosine indexing.",
                            "Achieved sub-48ms p99 query latency across 2.5 million indexed technical papers."
                        ]
                    }
                ],
                "education": {
                    "institution": "University of California, Berkeley",
                    "degree": "B.S. in Computer Science (High Honors, GPA 3.88)",
                    "year": "2024"
                }
            },
            ats_report={
                "ats_score": 98,
                "single_column": True,
                "standard_fonts": True,
                "parsable_headings": True,
                "no_unsupported_graphics": True,
                "extracted_text_fidelity": "100%"
            },
            factuality_report={
                "total_claims": 14,
                "verified_claims": 14,
                "unsupported_claims": 0,
                "hallucination_risk": "0.0%",
                "status": "PASSED_EVIDENCE_GATE"
            },
            approved_at=datetime.utcnow()
        )
        db.add(resume1)

        # 15. Initial Application Record (Stripe)
        app1 = Application(
            id="app-stripe-1",
            job_id=job1.id,
            status="RESUME_READY",
            approved_by_user_at=datetime.utcnow() - timedelta(hours=3),
            source="Direct Portal",
            application_url="http://localhost:8000/mock-portal/apply?job=stripe-backend",
            selected_resume_version_id=resume1.id,
            notes="High fit score (94%). Prioritize payment API reliability and async FastAPI metrics in answers.",
            next_action="Review auto-filled fields and launch browser assistant",
            next_action_at=datetime.utcnow() + timedelta(days=1)
        )
        db.add(app1)

        # Application Events
        events = [
            ApplicationEvent(
                application_id=app1.id,
                event_type="DISCOVERED",
                timestamp=datetime.utcnow() - timedelta(hours=6),
                source="JobHunterAgent",
                details={"source": "Direct Portal", "match_score": 94}
            ),
            ApplicationEvent(
                application_id=app1.id,
                event_type="AWAITING_APPROVAL",
                timestamp=datetime.utcnow() - timedelta(hours=5),
                source="MatchAgent",
                details={"recommendation": "Strongly recommended"}
            ),
            ApplicationEvent(
                application_id=app1.id,
                event_type="APPROVED",
                timestamp=datetime.utcnow() - timedelta(hours=3),
                source="User",
                details={"user_action": "Approved 1-Click Application"}
            ),
            ApplicationEvent(
                application_id=app1.id,
                event_type="RESUME_READY",
                timestamp=datetime.utcnow() - timedelta(hours=2),
                source="ResumeEngineerAgent",
                details={"resume_version": "Stripe_Backend_Engineer_v1", "factuality": "100%"}
            )
        ]
        db.add_all(events)

        # Mapped Application Answers
        answers = [
            ApplicationAnswer(
                application_id=app1.id,
                field_name="years_experience_python",
                answer="3+ years of intensive asynchronous Python and FastAPI experience in production environments.",
                evidence_source="Experience record at Apex AI & DataWave Labs",
                requires_review=False,
                approved=True
            ),
            ApplicationAnswer(
                application_id=app1.id,
                field_name="why_stripe",
                answer="Stripe sets the gold standard for developer-first financial infrastructure. My experience architecting low-latency FastAPI services and resilient database models directly aligns with Stripe's payments reliability mission.",
                evidence_source="Generated from verified projects & career goals",
                requires_review=False,
                approved=True
            ),
            ApplicationAnswer(
                application_id=app1.id,
                field_name="sponsorship_required",
                answer="No, I am authorized to work in the United States and do not require sponsorship.",
                evidence_source="User Preferences / Identity settings",
                requires_review=True,
                approved=True
            )
        ]
        db.add_all(answers)

        await db.commit()
        print("CareerOS database successfully seeded!")

if __name__ == "__main__":
    asyncio.run(seed_database())
