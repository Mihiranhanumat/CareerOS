const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('careeros_token') || sessionStorage.getItem('careeros_token');
}

export function setAuthSession(token: string, rememberMe = true, user?: any) {
  if (typeof window === 'undefined') return;
  if (rememberMe) {
    localStorage.setItem('careeros_token', token);
    if (user) localStorage.setItem('careeros_user', JSON.stringify(user));
  } else {
    sessionStorage.setItem('careeros_token', token);
    if (user) sessionStorage.setItem('careeros_user', JSON.stringify(user));
  }
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('careeros_token');
  localStorage.removeItem('careeros_user');
  sessionStorage.removeItem('careeros_token');
  sessionStorage.removeItem('careeros_user');
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('careeros_user') || sessionStorage.getItem('careeros_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorBody = await res.text();
      let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const parsed = JSON.parse(errorBody);
        errorMsg = parsed.detail || errorMsg;
      } catch {
        errorMsg = errorBody || errorMsg;
      }
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err: any) {
    // If backend is offline or network error, provide intelligent fallback so UI doesn't crash
    console.warn(`CareerOS API Notice for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Authentication
  signup: (data: { email: string; password: string; full_name: string }) =>
    fetcher<any>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string; remember_me?: boolean }) =>
    fetcher<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetcher<any>('/auth/me'),
  logout: () => {
    clearAuthSession();
  },

  // Profile & Career Brain
  getProfile: () => fetcher<any>('/profile'),
  updateProfile: (data: any) => fetcher<any>('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  getVisibility: () => fetcher<any[]>('/profile/visibility'),
  createCareerProposal: (text: string) => fetcher<any>('/profile/proposals', { method: 'POST', body: JSON.stringify({ text }) }),
  approveProposal: (proposalId: string) => fetcher<any>(`/profile/proposals/${proposalId}/approve`, { method: 'POST' }),
  rejectProposal: (proposalId: string) => fetcher<any>(`/profile/proposals/${proposalId}/reject`, { method: 'POST' }),

  // Skills
  getSkills: () => fetcher<any[]>('/skills'),
  createSkill: (data: any) => fetcher<any>('/skills', { method: 'POST', body: JSON.stringify(data) }),
  deleteSkill: (id: string) => fetcher<any>(`/skills/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: () => fetcher<any[]>('/projects'),
  createProject: (data: any) => fetcher<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => fetcher<any>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id: string) => fetcher<any>(`/projects/${id}`, { method: 'DELETE' }),

  // Facts & Preferences
  getExperience: () => fetcher<any[]>('/experience'),
  getEducation: () => fetcher<any[]>('/education'),
  getCertifications: () => fetcher<any[]>('/certifications'),
  getAchievements: () => fetcher<any[]>('/achievements'),
  getPreferences: () => fetcher<any>('/preferences'),
  updatePreferences: (data: any) => fetcher<any>('/preferences', { method: 'PATCH', body: JSON.stringify(data) }),

  // GitHub Intelligence
  getGithubAccounts: () => fetcher<any[]>('/github/accounts'),
  connectGithub: (username: string) => fetcher<any>('/github/connect', { method: 'POST', body: JSON.stringify({ username }) }),
  syncGithub: (accountId: string) => fetcher<any>('/github/sync', { method: 'POST', body: JSON.stringify({ account_id: accountId }) }),
  getGithubRepositories: () => fetcher<any[]>('/github/repositories'),
  approveGithubEvidence: (evidenceId: string, addAsVerifiedSkill = true) => 
    fetcher<any>(`/github/evidence/${evidenceId}/approve`, { 
      method: 'POST', 
      body: JSON.stringify({ action: 'approve', add_as_verified_skill: addAsVerifiedSkill, add_as_project_evidence: true }) 
    }),
  importRepoAsProject: (repoId: string) => fetcher<any>(`/github/repositories/${repoId}/import-project`, { method: 'POST' }),

  // Live direct GitHub fallback for client-side execution
  fetchPublicGithubRepos: async (username: string) => {
    const cleanUser = username.trim().replace('@', '');
    const res = await fetch(`https://api.github.com/users/${cleanUser}/repos?sort=updated&per_page=20`);
    if (!res.ok) throw new Error('Could not find GitHub user or rate limit reached.');
    return await res.json();
  },

  // Jobs & Matching
  getJobs: () => fetcher<any[]>('/jobs'),
  getJob: (id: string) => fetcher<any>(`/jobs/${id}`),
  importJob: (data: any) => fetcher<any>('/jobs/import', { method: 'POST', body: JSON.stringify(data) }),
  matchJob: (id: string) => fetcher<any>(`/jobs/${id}/match`, { method: 'POST' }),

  // Resume Studio & Parser
  getResumeFamilies: () => fetcher<any[]>('/resumes/families'),
  getResumes: () => fetcher<any[]>('/resumes'),
  getResume: (id: string) => fetcher<any>(`/resumes/${id}`),
  generateResume: (data: any) => fetcher<any>('/resumes/generate', { method: 'POST', body: JSON.stringify(data) }),
  validateResume: (id: string) => fetcher<any>(`/resumes/${id}/validate`, { method: 'POST' }),
  parseResumeUpload: (textContent: string) => fetcher<any>('/resumes/parse-upload', { method: 'POST', body: JSON.stringify({ text_content: textContent }) }),
  applyParsedResume: (parsedData: any) => fetcher<any>('/resumes/apply-parsed', { method: 'POST', body: JSON.stringify({ parsed_data: parsedData }) }),

  // Applications & Browser Automation
  getApplications: () => fetcher<any[]>('/applications'),
  getApplication: (id: string) => fetcher<any>(`/applications/${id}`),
  approveApplicationOneClick: (jobId: string, customFamily?: string) => 
    fetcher<any>('/applications/approve', { 
      method: 'POST', 
      body: JSON.stringify({ job_id: jobId, custom_resume_family: customFamily }) 
    }),
  updateApplication: (id: string, data: any) => fetcher<any>(`/applications/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  startBrowserWorkflow: (id: string) => fetcher<any>(`/applications/${id}/start`, { method: 'POST' }),
  resolveCheckpoint: (id: string, decision: string, customInput?: string) => 
    fetcher<any>(`/applications/${id}/checkpoint-resolve`, { 
      method: 'POST', 
      body: JSON.stringify({ decision, custom_input: customInput }) 
    }),
  getApplicationTimeline: (id: string) => fetcher<any[]>(`/applications/${id}/timeline`),

  // Interview & Analytics
  getInterviewPrep: (jobId: string) => fetcher<any>(`/interview/${jobId}/prep`),
  getAnalytics: () => fetcher<any>('/analytics'),

  // Public Portfolio & CV
  getPublicProfile: (slug: string) => fetcher<any>(`/public/${slug}`),
  getPublicCv: (slug: string) => fetcher<any>(`/public/${slug}/cv`),
  getPublicProjectDetail: (slug: string, projectSlug: string) => fetcher<any>(`/public/${slug}/projects/${projectSlug}`),

  // System Health & Exports
  getSystemHealth: () => fetcher<any>('/system/health'),
  getCredentialStatus: () => fetcher<any[]>('/system/credentials'),
  exportJsonBackup: () => fetcher<any>('/system/export/json'),
  getApplicationsCsvUrl: () => `${API_BASE}/system/export/applications-csv`,
  getSkillsCsvUrl: () => `${API_BASE}/system/export/skills-csv`,
};
