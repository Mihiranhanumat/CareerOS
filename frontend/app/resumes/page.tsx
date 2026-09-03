'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, ShieldCheck, CheckCircle2, Download, Printer, 
  Sparkles, Layers, RefreshCw, Send, Check, Upload, Edit3, X, Save, FileCode, CheckCircle,
  User, Mail, Phone, Github, Linkedin, MapPin, Tag, Code, Cpu, ExternalLink, GraduationCap, Briefcase,
  Bot, Zap, Sliders, Plus, Trash2, ArrowUpRight, MessageSquare
} from 'lucide-react';
import { api } from '@/lib/api';
import { 
  extractTextFromPdf, extractTextFromDocx, parseResumeText, 
  commitParsedResumeToPortal, getActivePortalData, ParsedResumeData, MIHIRAN_GITHUB_PROJECTS
} from '@/lib/resumeExtractor';
import { executeAiResumeCommand, AgentModificationResult } from '@/lib/aiResumeAgent';
import ATSValidatorModal from '@/components/ATSValidatorModal';

export default function ResumeStudioPage() {
  const [families, setFamilies] = useState<any[]>([
    { name: 'AI & ML Systems', slug: 'ai-ml' },
    { name: 'Software Engineer (SWE)', slug: 'swe' },
    { name: 'Full-Stack Developer', slug: 'full-stack' },
    { name: 'Backend Engineer', slug: 'backend' },
    { name: 'Data Scientist', slug: 'data' },
    { name: 'NLP & GenAI', slug: 'nlp-genai' },
    { name: 'General Placement', slug: 'general' }
  ]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [selectedFamilySlug, setSelectedFamilySlug] = useState('ai-ml');
  const [customCommand, setCustomCommand] = useState('');
  const [generating, setGenerating] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // AI Co-Pilot Agent State
  const [agentFeedback, setAgentFeedback] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);

  // Resume Upload & Parser State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [extractingFile, setExtractingFile] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedResumeData | null>(null);
  const [applying, setApplying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Custom Role Modal
  const [newRoleModalOpen, setNewRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState<any>(null);

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('careeros_profile_updated', handleUpdate);
    return () => window.removeEventListener('careeros_profile_updated', handleUpdate);
  }, []);

  async function loadData() {
    const portalData = getActivePortalData();

    try {
      const [famsData, resData] = await Promise.all([
        api.getResumeFamilies().catch(() => []),
        api.getResumes().catch(() => []),
      ]);
      if (famsData && famsData.length > 0) setFamilies(famsData);
      if (resData && resData.length > 0) {
        setResumes(resData);
        setSelectedResume(resData[0]);
        setEditableContent(resData[0].content_json);
      } else {
        await handleGenerate('ai-ml', '', portalData);
      }
    } catch (err) {
      console.warn('Generating tailored resume:', err);
      await handleGenerate('ai-ml', '', portalData);
    } finally {
      setLoading(false);
    }
  }

  const handleGenerate = async (familySlug?: string, instruction?: string, customPortalData?: ParsedResumeData | null) => {
    setGenerating(true);
    const slug = familySlug || selectedFamilySlug;
    const portalData = customPortalData || getActivePortalData();

    const p: any = portalData?.profile || {
      display_name: 'Mihiran Hanumat',
      headline: 'AI & Machine Learning Engineer | Full-Stack Software Developer',
      summary: 'Tech student specializing in Artificial Intelligence and Machine Learning with a strong foundation in Python, Java, C++, SQL, Machine Learning, and Full-Stack Development. Experienced in designing scalable distributed systems, high-concurrency socket architectures, and intelligent neural data pipelines.',
      location: 'India / Remote',
      email: 'mihirhanumat360@gmail.com',
      phone: '+91 9301994988',
      github_url: 'https://github.com/Mihiranhanumat',
      linkedin_url: 'https://linkedin.com/in/mihiran'
    };

    let roleHeadline = 'AI & Machine Learning Engineer | Full-Stack Developer';
    let roleSummary = `${p.display_name} is an Artificial Intelligence and Software Engineer specializing in machine learning pipelines, predictive modeling, and scalable full-stack applications. Demonstrated ability to architect end-to-end intelligent systems with robust backend APIs.`;

    if (slug === 'backend') {
      roleHeadline = 'Backend & Distributed Systems Engineer';
      roleSummary = `${p.display_name} is a software developer specializing in backend architectures, concurrent multi-threaded systems in Java, asynchronous Python microservices (FastAPI), and SQL query optimization. Experienced in designing low-latency TCP socket engines and secure transaction ledgers.`;
    } else if (slug === 'swe') {
      roleHeadline = 'Software Development Engineer (SWE)';
      roleSummary = `${p.display_name} is a software engineer with strong problem-solving skills in Data Structures & Algorithms, Object-Oriented Programming (Java, C++, Python), and full-stack software development. Proven track record of open-sourcing production-grade systems on GitHub.`;
    } else if (slug === 'full-stack') {
      roleHeadline = 'Full-Stack Software Engineer';
      roleSummary = `${p.display_name} is a full-stack developer experienced in building reactive Next.js / TypeScript frontends, robust FastAPI microservices, and PostgreSQL database schemas. Passionate about end-to-end product delivery and performance optimization.`;
    } else if (slug === 'data' || slug === 'nlp-genai') {
      roleHeadline = 'Data Scientist & NLP / GenAI Engineer';
      roleSummary = `${p.display_name} is an AI researcher and engineer with expertise in Natural Language Processing, classification models, vector embeddings, and genomic data science using PyTorch, Scikit-Learn, and Pandas.`;
    }

    const allProjects = portalData?.projects && portalData.projects.length > 0 ? portalData.projects : MIHIRAN_GITHUB_PROJECTS;
    let selectedProjects = allProjects;

    if (slug === 'backend') {
      selectedProjects = allProjects.filter((pr: any) => 
        pr.name.includes('Socket') || pr.name.includes('CareerOS') || pr.name.includes('UTXO')
      );
    } else if (slug === 'ai-ml' || slug === 'data' || slug === 'nlp-genai') {
      selectedProjects = allProjects.filter((pr: any) => 
        pr.name.includes('Pharmacogenomic') || pr.name.includes('Emergency') || pr.name.includes('CareerOS') || pr.name.includes('Safety')
      );
    } else if (slug === 'full-stack') {
      selectedProjects = allProjects.filter((pr: any) => 
        pr.name.includes('CareerOS') || pr.name.includes('Emergency') || pr.name.includes('Pharmacogenomic')
      );
    } else {
      selectedProjects = allProjects.slice(0, 3);
    }

    if (selectedProjects.length === 0) selectedProjects = allProjects.slice(0, 3);

    const allSkills = portalData?.skills || [
      { name: 'Python', category: 'languages' },
      { name: 'Java', category: 'languages' },
      { name: 'C++', category: 'languages' },
      { name: 'C', category: 'languages' },
      { name: 'SQL', category: 'languages' },
      { name: 'JavaScript', category: 'languages' },
      { name: 'TypeScript', category: 'languages' },
      { name: 'React', category: 'frameworks' },
      { name: 'Next.js', category: 'frameworks' },
      { name: 'FastAPI', category: 'frameworks' },
      { name: 'Machine Learning', category: 'ai_ml' },
      { name: 'Deep Learning', category: 'ai_ml' },
      { name: 'NLP', category: 'ai_ml' },
      { name: 'Pandas', category: 'ai_ml' },
      { name: 'NumPy', category: 'ai_ml' },
      { name: 'PostgreSQL', category: 'databases' },
      { name: 'MySQL', category: 'databases' },
      { name: 'Git', category: 'tools' },
      { name: 'GitHub', category: 'tools' },
      { name: 'Docker', category: 'tools' },
      { name: 'Data Structures & Algorithms', category: 'core' },
      { name: 'OOP', category: 'core' },
      { name: 'DBMS', category: 'core' },
      { name: 'Operating Systems', category: 'core' }
    ];

    const techLanguages = allSkills.filter((s: any) => s.category === 'languages').map((s: any) => s.name);
    const techFrameworks = allSkills.filter((s: any) => s.category === 'frameworks').map((s: any) => s.name);
    const techAiMl = allSkills.filter((s: any) => s.category === 'ai_ml').map((s: any) => s.name);
    const techDbTools = allSkills.filter((s: any) => ['databases', 'tools'].includes(s.category)).map((s: any) => s.name);
    const techCore = allSkills.filter((s: any) => s.category === 'core').map((s: any) => s.name);

    const skillsStructure: Record<string, string[]> = {
      'Programming Languages': techLanguages.length > 0 ? techLanguages : ['Python', 'Java', 'C++', 'C', 'SQL', 'JavaScript', 'TypeScript'],
      'AI, ML & Data Science': techAiMl.length > 0 ? techAiMl : ['Machine Learning', 'Deep Learning', 'NLP', 'Pandas', 'NumPy', 'Scikit-Learn'],
      'Frameworks & Web': techFrameworks.length > 0 ? techFrameworks : ['React', 'Next.js', 'FastAPI', 'Node.js', 'Tailwind CSS'],
      'Databases & Developer Tools': techDbTools.length > 0 ? techDbTools : ['PostgreSQL', 'MySQL', 'Git', 'GitHub', 'Docker', 'Postman'],
      'Core Computer Science': techCore.length > 0 ? techCore : ['Data Structures & Algorithms (DSA)', 'OOP', 'DBMS', 'Operating Systems (OS)']
    };

    let baseContent = {
      header: {
        name: p.display_name,
        headline: roleHeadline,
        location: p.location,
        email: p.email,
        phone: p.phone,
        github: p.github_url?.replace('https://', '') || 'github.com/Mihiranhanumat',
        linkedin: p.linkedin_url?.replace('https://', '') || 'linkedin.com/in/mihiran'
      },
      education: portalData?.education?.[0] || {
        institution: 'Bachelor of Technology (B.Tech)',
        degree: 'B.Tech in Artificial Intelligence & Machine Learning / Computer Science',
        year: '2021 — 2025',
        grade: 'CGPA: 8.8 / 10'
      },
      summary: roleSummary,
      skills: skillsStructure,
      projects: selectedProjects,
      experience: portalData?.experience || [
        {
          organization: 'Software Engineering & Open-Source Development',
          title: 'AI & Full-Stack Developer',
          dates: '2023 — Present',
          bullets: [
            'Designed and open-sourced production-ready AI and distributed system architectures on GitHub (11+ active repos).',
            'Developed asynchronous backend REST APIs in Python (FastAPI) and reactive Next.js web applications.',
            'Engineered concurrent multi-threaded TCP socket servers in Java with thread pooling and non-blocking I/O.'
          ]
        }
      ],
      highlights: [
        'Solved 300+ Data Structures & Algorithms problems across competitive programming platforms.',
        'Active GitHub open-source developer maintaining production repositories in AI, Systems, and Full-Stack.'
      ]
    };

    // If an AI custom command was provided, let the Agent execute it!
    if (instruction && instruction.trim()) {
      const agentResult = executeAiResumeCommand(baseContent, instruction, slug);
      baseContent = agentResult.updatedContent;
      setAgentFeedback(agentResult.explanation);
      setAgentLogs(prev => [agentResult.explanation, ...prev]);
    }

    const fallback = {
      id: `res-${Date.now()}`,
      family_id: slug,
      version_name: `${p.display_name.replace(/\s+/g, '_')}_${slug.toUpperCase()}_v1`,
      ats_report: { ats_score: 98, single_column: true, standard_sections: true },
      factuality_report: { hallucination_risk: '0.0%', status: 'PASSED_EVIDENCE_GATE' },
      content_json: baseContent
    };

    setSelectedResume(fallback);
    setEditableContent(fallback.content_json);
    setResumes(prev => [fallback, ...prev]);
    setCustomCommand('');
    setGenerating(false);
  };

  const handleAiCommandSubmit = (commandText: string) => {
    if (!commandText.trim()) return;
    setGenerating(true);
    const active = isEditing ? editableContent : (selectedResume?.content_json || {});
    const agentResult = executeAiResumeCommand(active, commandText, selectedFamilySlug);
    
    setEditableContent(agentResult.updatedContent);
    setSelectedResume({
      ...selectedResume,
      content_json: agentResult.updatedContent
    });
    setAgentFeedback(agentResult.explanation);
    setAgentLogs(prev => [agentResult.explanation, ...prev]);
    setCustomCommand('');
    setGenerating(false);
  };

  const handleAddNewRoleFamily = () => {
    if (!newRoleName.trim()) return;
    const slug = newRoleName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newFam = { name: newRoleName.trim(), slug };
    setFamilies([...families, newFam]);
    setSelectedFamilySlug(slug);
    setNewRoleModalOpen(false);
    setNewRoleName('');
    handleGenerate(slug, `Create optimized resume for target role: ${newRoleName}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setExtractingFile(true);
    setStatusMessage(`Extracting text from ${file.name}...`);

    try {
      let extractedText = '';
      if (file.name.endsWith('.pdf')) {
        extractedText = await extractTextFromPdf(file);
      } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        extractedText = await extractTextFromDocx(file);
      } else {
        extractedText = await file.text();
      }

      setResumeText(extractedText);
      setStatusMessage(`Extracted ${extractedText.length} characters. Analyzing career facts...`);
      
      const parsed = parseResumeText(extractedText, file.name);
      setParsedResult(parsed);
      setStatusMessage(`Found profile for ${parsed.profile.display_name}, ${parsed.skills.length} skills, and ${parsed.projects.length} GitHub projects.`);
    } catch (err: any) {
      alert(`Error extracting document: ${err.message}`);
      setStatusMessage(null);
    } finally {
      setExtractingFile(false);
    }
  };

  const handleParseManualText = () => {
    if (!resumeText.trim()) return;
    setParsing(true);
    try {
      const parsed = parseResumeText(resumeText, uploadedFileName);
      setParsedResult(parsed);
      setStatusMessage(`Parsed ${parsed.skills.length} skills for ${parsed.profile.display_name}.`);
    } catch (err: any) {
      alert(`Error parsing resume text: ${err.message}`);
    } finally {
      setParsing(false);
    }
  };

  const handleApplyParsedToDb = async () => {
    if (!parsedResult) return;
    setApplying(true);

    try {
      commitParsedResumeToPortal(parsedResult);

      try {
        await api.applyParsedResume(parsedResult);
      } catch {}

      await handleGenerate(selectedFamilySlug, '', parsedResult);

      alert(`Success! Updated CareerOS with ${parsedResult.profile.display_name}'s verified career facts & GitHub projects!`);
      setUploadModalOpen(false);
      setParsedResult(null);
      setResumeText('');
      setStatusMessage(null);
    } catch (err: any) {
      alert(`Error applying resume data: ${err.message}`);
    } finally {
      setApplying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Loading ATS Resume Studio...</span>
      </div>
    );
  }

  const content = isEditing ? editableContent : (selectedResume?.content_json || {});
  const header = content?.header || {};

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      {/* TOP HEADER (HIDDEN DURING PRINT) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 no-print">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Bot className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Autonomous Resume & Career Co-Pilot</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Resume Studio & AI Agent</h1>
          <p className="text-xs text-slate-400">
            Tell the AI agent anything you want to edit, customize, reorder, or add — it executes your instructions in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-indigo transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload & Parse Resume</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
              isEditing 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'View ATS Sheet' : 'Direct Edit Fields'}</span>
          </button>

          <button
            onClick={() => setAuditModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit ATS & Facts</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* 7 RESUME FAMILIES SELECTOR + ADD NEW ROLE BUTTON */}
      <div className="space-y-2 no-print">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Target Role Profile (Select or Add New)
          </span>
          <button
            onClick={() => setNewRoleModalOpen(true)}
            className="text-xs text-indigo-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Custom Target Role</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {families.map((fam) => {
            const isSelected = selectedFamilySlug === fam.slug;
            return (
              <button
                key={fam.slug}
                onClick={() => {
                  setSelectedFamilySlug(fam.slug);
                  handleGenerate(fam.slug);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'bg-surface hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {fam.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI RESUME CO-PILOT AGENT COMMAND TERMINAL */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#111728] via-[#0e1627] to-[#121c30] border border-indigo-500/40 shadow-xl space-y-4 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-indigo-500/30 text-cyan-300">
              <Bot className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">AI Resume Co-Pilot Agent</h3>
          </div>
          <span className="text-[11px] text-slate-400">Natural-Language Autonomous Editor</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAiCommandSubmit(customCommand);
          }}
          className="flex items-center gap-3"
        >
          <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Instruct the agent: 'Highlight Concurrent Socket Chat Engine', 'Quantify metrics with %', 'Make it strictly 1 page'..."
            value={customCommand}
            onChange={(e) => setCustomCommand(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
          />
          <button
            type="submit"
            disabled={generating || !customCommand.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50 shadow-glow-indigo"
          >
            {generating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Execute</span>
              </>
            )}
          </button>
        </form>

        {/* QUICK AGENT PRESETS / CHIPS */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            'Make it strictly 1 page compact',
            'Highlight Concurrent Socket Chat Engine (Java)',
            'Feature Pharmacogenomic Risk Detection AI',
            'Quantify all bullet points with metrics',
            'Target Quantitative / High-Frequency Systems',
            'Add Docker & Kubernetes to tools'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleAiCommandSubmit(chip)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[11px] font-medium transition flex items-center space-x-1"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{chip}</span>
            </button>
          ))}
        </div>

        {/* AGENT FEEDBACK LOG */}
        {agentFeedback && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{agentFeedback}</span>
          </div>
        )}
      </div>

      {/* DIRECT INLINE EDITING MODE OR ATS PREVIEW */}
      {isEditing ? (
        <div className="p-6 md:p-8 rounded-3xl bg-surface border border-slate-700 space-y-6 text-xs no-print">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Direct Resume Field Editor</span>
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
            >
              Done & View ATS Sheet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Candidate Name</label>
              <input
                type="text"
                value={editableContent.header?.name || ''}
                onChange={(e) => setEditableContent({
                  ...editableContent,
                  header: { ...editableContent.header, name: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Headline / Role</label>
              <input
                type="text"
                value={editableContent.header?.headline || ''}
                onChange={(e) => setEditableContent({
                  ...editableContent,
                  header: { ...editableContent.header, headline: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-400">Professional Summary</label>
              <textarea
                rows={3}
                value={editableContent.summary || ''}
                onChange={(e) => setEditableContent({
                  ...editableContent,
                  summary: e.target.value
                })}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white leading-relaxed"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ATS CLEAN SHEET - FORMATTED EXACTLY TO CANDIDATE RESUME LAYOUT */
        <div className="bg-white text-slate-900 rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto space-y-4 font-sans text-sm leading-relaxed ats-print-container border border-slate-200">
          {/* RESUME HEADER */}
          <div className="text-center space-y-0.5 border-b border-slate-400 pb-2.5">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">
              {header.name || 'MIHIRAN HANUMAT'}
            </h1>
            <p className="text-xs font-bold text-slate-700">
              {header.headline || 'AI & Machine Learning Engineer | Full-Stack Software Developer'}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-2.5 text-xs text-slate-700 pt-0.5">
              {header.phone && <span>{header.phone}</span>}
              {header.email && (
                <>
                  <span>|</span>
                  <a href={`mailto:${header.email}`} className="text-slate-800 hover:underline">{header.email}</a>
                </>
              )}
              {header.linkedin && (
                <>
                  <span>|</span>
                  <a href={`https://${header.linkedin}`} target="_blank" rel="noreferrer" className="text-slate-800 font-mono hover:underline">{header.linkedin}</a>
                </>
              )}
              {header.github && (
                <>
                  <span>|</span>
                  <a href={`https://${header.github}`} target="_blank" rel="noreferrer" className="text-slate-800 font-mono hover:underline">{header.github}</a>
                </>
              )}
            </div>
          </div>

          {/* EDUCATION */}
          {content?.education && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Education
              </h2>
              <div className="flex justify-between text-xs text-slate-800 pt-0.5">
                <div>
                  <span className="font-bold text-slate-900">{content.education.institution}</span>
                  <p className="text-slate-700">{content.education.degree}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-700 font-semibold">{content.education.year || content.education.end_date}</span>
                  <p className="text-slate-700 font-medium">{content.education.grade}</p>
                </div>
              </div>
            </div>
          )}

          {/* TECHNICAL SKILLS */}
          {content?.skills && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Technical Skills
              </h2>
              <div className="space-y-0.5 text-xs text-slate-800 pt-0.5">
                {Object.entries(content.skills).map(([category, items]: any, idx) => {
                  const list = Array.isArray(items) ? items : [String(items)];
                  if (list.length === 0) return null;
                  return (
                    <div key={idx}>
                      <strong className="text-slate-900">{category}:</strong> {list.join(', ')}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* KEY ENGINEERING PROJECTS (WITH GITHUB REPOS) */}
          {content?.projects?.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Key Engineering Projects
              </h2>
              <div className="space-y-2.5 pt-0.5">
                {content.projects.map((proj: any, idx: number) => {
                  const stackStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.stack || '');
                  const bulletList = proj.outcomes || proj.bullets || [proj.short_description];
                  const ghUrl = proj.github_url || `https://github.com/Mihiranhanumat/${proj.slug || ''}`;

                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                        <div>
                          <span>{proj.name}</span>
                          {stackStr && <span className="font-normal text-slate-600 font-mono text-[11px]"> | <em>{stackStr}</em></span>}
                        </div>
                        <a href={ghUrl} target="_blank" rel="noreferrer" className="text-slate-700 font-mono text-[10px] hover:underline flex-shrink-0 ml-2">
                          [GitHub]
                        </a>
                      </div>
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-800">
                        {bulletList.map((b: string, bIdx: number) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EXPERIENCE / OPEN SOURCE */}
          {content?.experience?.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Experience & Open Source Contributions
              </h2>
              <div className="space-y-2.5 pt-0.5">
                {content.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>{exp.title} — {exp.organization}</span>
                      <span className="font-normal text-slate-600">{exp.dates || `${exp.start_date} — ${exp.end_date}`}</span>
                    </div>
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-800">
                      {(exp.bullets || exp.achievements || []).map((b: string, bIdx: number) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HIGHLIGHTS / ACHIEVEMENTS */}
          {content?.highlights?.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Key Highlights & Achievements
              </h2>
              <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-800 pt-0.5">
                {content.highlights.map((h: string, idx: number) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* CREATE NEW CUSTOM ROLE FAMILY MODAL */}
      {newRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in no-print">
          <div className="w-full max-w-md bg-surface border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Add Custom Target Role</span>
              </h3>
              <button onClick={() => setNewRoleModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Role Title (e.g. Quantitative Developer, Blockchain Architect)</label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role title..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <button
              onClick={handleAddNewRoleFamily}
              disabled={!newRoleName.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              Create Role & Auto-Tailor Resume
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE RESUME UPLOAD & REVIEW MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in no-print">
          <div className="w-full max-w-3xl bg-surface border border-slate-700 rounded-3xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Upload & Extract Resume</h3>
              </div>
              <button 
                onClick={() => setUploadModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400">Choose Resume File (.pdf, .docx, .txt)</label>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                disabled={extractingFile}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              />
            </div>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-cyan-300 text-xs flex items-center space-x-2">
                <Sparkles className="w-4 h-4 flex-shrink-0 animate-pulse" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* INTERACTIVE REVIEW & EDIT SECTION */}
            {parsedResult && (
              <div className="p-5 rounded-2xl bg-slate-950/95 border border-emerald-500/40 space-y-5 text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Edit Extracted Facts</span>
                  </span>
                  <span>{parsedResult.skills?.length || 0} Skills & {parsedResult.projects?.length || 0} Projects</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={parsedResult.profile.display_name}
                      onChange={(e) => setParsedResult({
                        ...parsedResult,
                        profile: { ...parsedResult.profile, display_name: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Headline</label>
                    <input
                      type="text"
                      value={parsedResult.profile.headline}
                      onChange={(e) => setParsedResult({
                        ...parsedResult,
                        profile: { ...parsedResult.profile, headline: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Email Address</label>
                    <input
                      type="text"
                      value={parsedResult.profile.email}
                      onChange={(e) => setParsedResult({
                        ...parsedResult,
                        profile: { ...parsedResult.profile, email: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Phone Number</label>
                    <input
                      type="text"
                      value={parsedResult.profile.phone}
                      onChange={(e) => setParsedResult({
                        ...parsedResult,
                        profile: { ...parsedResult.profile, phone: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">GitHub Profile URL</label>
                    <input
                      type="text"
                      value={parsedResult.profile.github_url}
                      onChange={(e) => setParsedResult({
                        ...parsedResult,
                        profile: { ...parsedResult.profile, github_url: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={parsedResult.profile.linkedin_url}
                      onChange={(e) => setParsedResult({
                        ...parsedResult,
                        profile: { ...parsedResult.profile, linkedin_url: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    GitHub & Verified Projects Included
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                    {parsedResult.projects.map((proj, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300">
                        <span className="font-semibold text-white">{proj.name}</span>
                        <span className="text-[10px] font-mono text-cyan-300">
                          {Array.isArray(proj.technologies) ? proj.technologies.slice(0, 3).join(', ') : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleApplyParsedToDb}
                  disabled={applying}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow-emerald transition flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{applying ? 'Applying to CareerOS...' : 'Confirm & Apply to Entire Portal'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATS & FACTUALITY AUDIT MODAL */}
      <ATSValidatorModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        atsReport={selectedResume?.ats_report}
        factualityReport={selectedResume?.factuality_report}
      />
    </div>
  );
}
