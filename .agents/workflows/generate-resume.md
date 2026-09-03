---
description: Synthesize role-specific ATS resume with factuality audit against verified career facts
---

# /generate-resume Workflow

1. Select target resume family (SWE, Backend, Full-Stack, Data, ML/AI, NLP/GenAI, General).
2. Query verified skills, projects, and experiences from the database.
3. Call `POST /api/resumes/generate` with custom refinement instructions if provided.
4. Verify that ATS score >= 95 and hallucination risk is 0.0%.
5. Render ATS HTML and generate printable PDF snapshot.
