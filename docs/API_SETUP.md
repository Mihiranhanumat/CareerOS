# API Setup & Credentials Guide

| Service | Purpose | Where to Get Credential | Environment Variable | Redirect URI | Scopes Needed | Test Endpoint | Common Errors |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Gemini API** | Natural language diff parsing, ATS resume tailoring, STAR interview synthesis | [Google AI Studio](https://aistudio.google.com/app/apikey) | `GEMINI_API_KEY` | N/A | Default API access | `GET /api/system/health` | Invalid key or quota exhaustion |
| **Supabase PostgreSQL** | Cloud Postgres database, pgvector semantic search, and document storage | [Supabase Dashboard](https://supabase.com/dashboard) | `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | N/A | Full DB access | `GET /api/system/health` | Network timeout or incorrect password |
| **GitHub OAuth / API** | Sync repositories, parse commit manifests, and extract codebase evidence | [GitHub Developer Settings](https://github.com/settings/developers) | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | `http://localhost:8000/api/github/callback` | `read:user`, `repo` (read-only) | `GET /api/github/accounts` | Redirect URI mismatch or bad client secret |
| **Google Workspace (Optional)** | Detect application confirmation emails and interview calendar events | [Google Cloud Console](https://console.cloud.google.com) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `http://localhost:8000/api/auth/google/callback` | `gmail.readonly`, `calendar.events` | `GET /api/system/health` | Consent screen not verified |
| **Playwright Browser** | Automated form field mapping and safe resume uploads | Runs locally (Pre-installed) | `BROWSER_AUTOMATION_ENABLED=true` | N/A | Local system permissions | `GET /mock-portal` | Headless display driver issues |

---

## Step-by-Step Setup Instructions

### 1. Google Gemini API Setup
1. Log in to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. Copy the generated key.
4. Open `.env` in the root folder and paste: `GEMINI_API_KEY=your_actual_key_here`.
5. Restart backend. CareerOS will automatically switch to live `gemini-2.0-flash` generation.

### 2. GitHub OAuth App Setup
1. Go to [GitHub Settings -> Developer settings -> OAuth Apps](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. Application name: `CareerOS Local`.
4. Homepage URL: `http://localhost:3000`.
5. Authorization callback URL: `http://localhost:8000/api/github/callback`.
6. Save and copy **Client ID** and generate **Client Secret**.
7. Paste into `.env`:
   ```bash
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```
