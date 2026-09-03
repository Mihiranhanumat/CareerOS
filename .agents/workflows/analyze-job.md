---
description: Ingest job descriptions, extract mandatory requirements, and score opportunity fit
---

# /analyze-job Workflow

1. Ingest pasted job description or URL via `POST /api/jobs/import`.
2. Extract mandatory technical skills, preferred qualifications, and eligibility constraints.
3. Compute explainable match score (0-100) and present strengths and gap recommendations.
