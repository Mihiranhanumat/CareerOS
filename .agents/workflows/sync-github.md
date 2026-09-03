---
description: Sync GitHub repositories and generate candidate codebase evidence
---

# /sync-github Workflow

1. Request user's GitHub username or OAuth session.
2. Call `POST /api/github/sync` to inspect dependency manifests, commit structures, and API routers.
3. Present extracted evidence items to the user for approval.
