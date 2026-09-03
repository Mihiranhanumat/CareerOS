---
description: Execute complete automated test suite across backend services, matching, and factuality
---

# /test Workflow

1. Run backend unit and integration test suite: `python -m tests.run_tests` in `backend/`.
2. Verify all tests pass with 0 failures.
3. Validate factuality evidence gate, matching weights, and proposal approvals.
