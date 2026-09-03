# Security & Privacy Model

## Privacy Boundaries
CareerOS enforces strict data isolation across public, selective, and private data fields.

1. **Public Information**:
   - Display name, headline, summary, availability.
   - Verified skills and featured projects.
   - Public GitHub profile and repository proof-of-work.
   - Intentionally published public CV.

2. **Selective Information**:
   - Email address and GPA (configurable in `/settings/privacy`).

3. **Strictly Private Information**:
   - Phone number, home address, personal communications.
   - Application histories, rejected/withdrawn statuses, salary targets.
   - Recruiter notes, internal interview feedback.
   - Database service-role keys and AI provider credentials.

## Row Level Security & Server Isolation
- All privileged database mutations and AI provider queries execute strictly on the FastAPI backend.
- Service-role credentials and API keys are never bundled in frontend JavaScript.
- API endpoints sanitize payloads before serving public requests (`GET /api/public/{slug}`).
