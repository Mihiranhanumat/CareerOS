# Automation Policy & Safe Interaction Guidelines

## Principles of Ethical & Permitted Automation

CareerOS automates repetitive, permitted tasks aggressively while upholding strict ethical and compliance standards.

### Non-Negotiable Compliance Rules:
1. **Never Bypass CAPTCHA**: CareerOS never solves, evades, or circumvents CAPTCHAs. When a CAPTCHA appears, automation pauses for human interaction.
2. **Never Bypass MFA / 2FA**: Authentication challenges are strictly reserved for the human candidate.
3. **Never Evade Rate Limits**: Exponential backoff and conservative timeouts prevent hammering external servers.
4. **Never Use Stolen / Copied Session Tokens**: Access is strictly limited to authorized OAuth credentials or browser sessions opened with user consent.
5. **No Unauthorized LinkedIn Automation**: In accordance with LinkedIn terms of service prohibiting third-party scraping/bot submission, CareerOS operates in **assistive/manual mode** for restricted sources. It pre-populates answers and copies resumes, allowing the candidate to review and submit directly.

### Mandatory Pause Conditions:
- Work authorization / visa sponsorship checkboxes
- Background, legal, or demographic self-identification declarations
- Salary expectations or binding compensation commitments
- Irreversible final submission confirmation
