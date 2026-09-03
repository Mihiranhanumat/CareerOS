# CareerOS User Guide — Normal Daily Workflow

## 1. Updating Your Career Knowledge Base
1. Click **Update My Career** in the navbar or go to `/career/update`.
2. Type your informal update in plain English:  
   *“I learned Docker and containerized my FastAPI NLP service with PostgreSQL.”*
3. Click **Parse & Propose Diff**.
4. Inspect the structured diff (Added skills, Changed items, Suggested projects, Needs clarification).
5. Click **Approve & Commit to Verified Facts**. Your verified knowledge base, public portfolio, and resume studio update instantly.

## 2. Reviewing Opportunities & 1-Click Apply
1. Open the **Opportunity Inbox** (`/jobs`).
2. Review new jobs ranked by match score.
3. Click on a high-match role (e.g. **Stripe — Backend Software Engineer (94% Match)**).
4. Inspect the **Explainable Factor Breakdown**:
   - Mandatory skills matched
   - Supporting evidence trail
   - Minor gaps and recovery suggestions
5. Click **YES — 1-Click Approve & Apply**.
6. CareerOS immediately:
   - Locks the requisition to prevent duplicate applications.
   - Generates a tailored, ATS-compliant resume version.
   - Drafts verified answers to common application questions.
   - Prepares the application state.

## 3. Running Browser Automation & Resolving Checkpoints
1. On the application details page (`/applications/[id]`), click **Launch Browser Assistant**.
2. The Playwright engine navigates to the career portal, maps form fields, and attaches your tailored resume.
3. If the portal requires a sensitive declaration (e.g., Work Authorization or Legal Attestation), CareerOS automatically pauses and displays a **Safety Checkpoint Modal**.
4. Review what the site asks and what CareerOS knows from your verified facts.
5. Click **Approve & Proceed**.
6. The application is submitted, confirmation number is stored, and the lifecycle status moves to `SUBMITTED`.

## 4. Preparing for Interviews
1. Open **Interview Center** (`/interview`).
2. Select your target company.
3. Review customized technical architecture questions and recommended discussion points.
4. Review verified **STAR Framework Stories** generated directly from your project outcomes.
5. Follow the **Final-Day Revision Checklist**.
