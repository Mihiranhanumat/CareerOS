# Security & Privacy Rules

1. **No Secrets in Git**: Never commit `.env`, API keys, OAuth client secrets, or session tokens.
2. **Client Bundle Isolation**: Service role keys and backend secrets must never be exposed to frontend code or client bundles.
3. **Public vs Private Isolation**: Public portfolio endpoints must only expose fields explicitly marked as `public` or `selective`. Phone numbers, private addresses, application histories, and recruiter communications are strictly private.
4. **Structured Auditing**: Every data modification (approvals, status updates, resume generation) must log actor, action, timestamp, and entity ID without logging secrets.
