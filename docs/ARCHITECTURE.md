# CareerOS Technical Architecture

## 1. System Overview
CareerOS is designed as a single-user private AI placement platform with strict factuality, explainability, and safety guards.

```
[ Frontend: Next.js 14 App Router + Tailwind CSS + Lucide Icons ]
                      │  (REST API / JSON)
                      ▼
[ Backend: FastAPI (Python 3.12+) + Pydantic v2 + SQLAlchemy ]
     │                │                  │
     ├───────────────┼──────────────────┤
     ▼               ▼                  ▼
[ AI Provider ] [ Browser Engine ] [ Database: SQLite / PostgreSQL ]
  - Gemini Flash  - Playwright       - 29 Mapped Tables
  - Text & Embed  - Safety Check     - Strict RLS & Evidence Map
```

## 2. Multi-Agent Orchestrator Model
- **CareerManagerAgent**: Manages canonical facts and proposal diff calculations.
- **GithubAnalystAgent**: Ingests codebases and generates contextual evidence without shallow assumptions.
- **JobDiscoveryAgent**: Ingests and normalizes external job listings.
- **JobAnalystAgent**: Extracts requirements, mandatory skills, and eligibility constraints.
- **MatchAgent**: Computes weighted explainable 0–100 match scores.
- **ResumeEngineerAgent**: Selects families and creates ATS resumes from verified facts.
- **ApplicationWriterAgent**: Generates answers and cover letters strictly from verified data.
- **BrowserAgent**: Navigates forms, fills fields, attaches resumes, and pauses on human checkpoints.
- **TrackerAgent**: Enforces lifecycle state machine transitions.
- **FollowupAgent**: Tracks upcoming deadlines and interview dates.
- **CareerAdvisorAgent**: Calculates funnel conversion and skill gaps.

## 3. Database Schema Overview (29 Logical Entities)
1. `profiles`: Canonical contact, headline, summary, and availability.
2. `profile_visibility`: Per-field visibility controls (public / private / selective).
3. `skills`: Verified technical and domain skills.
4. `skill_evidence`: Evidence links pointing to repositories, metrics, and experience.
5. `projects`: High-impact projects with problem, solution, architecture, and outcomes.
6. `project_skills`: Project-to-skill evidence mappings.
7. `experience`: Employment history and verified achievements.
8. `education`: Academic credentials, institutions, and coursework.
9. `certifications`: Industry certifications with verification links.
10. `achievements`: Honors, awards, and hackathon wins.
11. `preferences`: Target roles, locations, remote preference, and minimum score threshold.
12. `github_accounts`: Authorized GitHub OAuth sessions.
13. `github_repositories`: Synced repository metadata and languages.
14. `github_evidence`: Codebase-derived evidence proposals.
15. `job_sources`: Ingestion sources and connector policies.
16. `jobs`: Normalized job postings with SHA-256 deduplication hashes.
17. `job_requirements`: Extracted mandatory and preferred skills.
18. `job_matches`: Explainable multi-factor match breakdowns.
19. `resume_families`: 7 role-specific resume configurations.
20. `resume_versions`: Immutable resume snapshots with ATS and factuality audit reports.
21. `cover_letter_versions`: Generated cover letter snapshots.
22. `applications`: Lifecycle state machine records.
23. `application_events`: Auditable state transition timeline.
24. `application_answers`: Form question and verified answer pairings.
25. `followups`: Upcoming deadlines and reminders.
26. `agent_runs`: Observability logs for autonomous agent steps.
27. `audit_logs`: Data mutation logs answering WHO, WHAT, WHEN, and WHY.
28. `public_profile_settings`: Vanity slug and SEO metadata.
29. `career_proposals`: Staging table for unverified natural language and GitHub updates.
