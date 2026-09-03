from typing import Dict, Any, Optional
from fastapi import APIRouter, Form, UploadFile, File, Request, HTTPException
from fastapi.responses import HTMLResponse

router = APIRouter(prefix="/mock-portal", tags=["Mock Job Portal (Browser Automation Playground)"])

@router.get("", response_model=None, response_class=HTMLResponse)
@router.get("/apply", response_model=None, response_class=HTMLResponse)
async def mock_job_portal_page(job: Optional[str] = "stripe-backend"):
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TechCorp Careers — Application Portal (Mock)</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-900 text-slate-100 min-h-screen p-8 flex flex-col items-center">
        <div class="max-w-2xl w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
            <div class="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
                <div>
                    <span class="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Mock Careers Portal</span>
                    <h1 class="text-2xl font-bold text-white mt-1">Application for Senior Backend Engineer</h1>
                </div>
                <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">Req #8491</span>
            </div>

            <form id="mock-apply-form" action="/mock-portal/submit" method="POST" enctype="multipart/form-data" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
                    <input type="text" name="full_name" id="full_name" required value="Alex Mercer" class="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-slate-600 text-white focus:outline-none focus:border-indigo-500">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                        <input type="email" name="email" id="email" required value="alex.mercer.eng@gmail.com" class="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-slate-600 text-white focus:outline-none focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">Phone Number *</label>
                        <input type="tel" name="phone" id="phone" required value="+1 (415) 555-0192" class="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-slate-600 text-white focus:outline-none focus:border-indigo-500">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">LinkedIn Profile</label>
                        <input type="url" name="linkedin" id="linkedin" value="https://linkedin.com/in/alex-mercer-ai" class="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-slate-600 text-white focus:outline-none focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">GitHub Profile</label>
                        <input type="url" name="github" id="github" value="https://github.com/alex-mercer-dev" class="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-slate-600 text-white focus:outline-none focus:border-indigo-500">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-300 mb-1">Upload Resume (PDF) *</label>
                    <input type="file" name="resume" id="resume" accept=".pdf" class="w-full px-4 py-2 rounded-lg bg-slate-900/90 border border-slate-600 text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white file:text-xs">
                </div>

                <!-- SENSITIVE CHECKPOINT SECTION -->
                <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <h3 class="text-sm font-semibold text-amber-300 mb-2">⚡ Legal & Work Authorization Checkpoint</h3>
                    <div class="space-y-2">
                        <label class="flex items-center space-x-3 text-sm text-slate-300 cursor-pointer">
                            <input type="checkbox" name="work_auth" id="work_auth" checked class="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-600">
                            <span>I am legally authorized to work in the United States without visa sponsorship.</span>
                        </label>
                        <label class="flex items-center space-x-3 text-sm text-slate-300 cursor-pointer">
                            <input type="checkbox" name="attestation" id="attestation" checked class="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-600">
                            <span>I certify that all information provided is accurate and verifiable.</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-300 mb-1">Why do you want to join our team?</label>
                    <textarea name="cover_letter" id="cover_letter" rows="3" class="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-slate-600 text-white focus:outline-none focus:border-indigo-500">I am excited by your payments reliability scale. My production experience with async FastAPI and PostgreSQL directly maps to your core architecture.</textarea>
                </div>

                <div class="pt-4">
                    <button type="submit" id="submit-btn" class="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg transition duration-200">
                        Submit Application
                    </button>
                </div>
            </form>
        </div>
    </body>
    </html>
    """

@router.post("/submit", response_model=None, response_class=HTMLResponse)
async def mock_job_portal_submit(
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    linkedin: Optional[str] = Form(None),
    github: Optional[str] = Form(None),
    work_auth: Optional[str] = Form(None),
    attestation: Optional[str] = Form(None)
):
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Application Received — TechCorp</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-6">
        <div class="max-w-md w-full bg-slate-800 border border-emerald-500/40 rounded-2xl p-8 text-center shadow-2xl">
            <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ✓
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">Application Submitted!</h1>
            <p class="text-slate-300 text-sm mb-6">Thank you, <strong class="text-white">{full_name}</strong>. Your application has been successfully logged.</p>
            
            <div class="bg-slate-900/80 p-4 rounded-xl text-left text-xs font-mono space-y-1 mb-6 text-slate-400">
                <div>Candidate: {email}</div>
                <div>Status: RECEIVED / CONFIRMED</div>
                <div>Confirmation: CONF-8491-09281</div>
            </div>

            <a href="/mock-portal" class="inline-block px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition">
                Return to Portal
            </a>
        </div>
    </body>
    </html>
    """
