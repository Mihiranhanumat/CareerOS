---
description: Verify full-stack CareerOS running health across frontend, backend, and database
---

# /verify Workflow

1. Query `GET http://127.0.0.1:8000/api/system/health`.
2. Ensure database, AI provider, and browser engine report healthy.
3. Query `GET http://localhost:3000/api/profile` to verify Next.js proxying to FastAPI.
4. Confirm public portfolio and CV routes render without error.
