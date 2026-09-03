---
description: Process natural language career updates and generate structured diff proposals
---

# /career-update Workflow

1. Prompt the user for an informal career update.
2. Send the update to `POST /api/profile/proposals`.
3. Display the structured diff (Added / Changed / Suggested / Needs clarification).
4. Prompt the user to approve or reject the proposal before committing to verified facts.
