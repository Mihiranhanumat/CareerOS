---
description: Perform production readiness and environment audit before deployment
---

# /deploy-check Workflow

1. Verify no secret tokens or credentials exist in tracked Git files.
2. Confirm `.env.example` has all placeholders and descriptions.
3. Validate Docker container build configurations in `docker-compose.yml`.
4. Ensure public URL slug and SEO metadata are configured in `PublicProfileSetting`.
