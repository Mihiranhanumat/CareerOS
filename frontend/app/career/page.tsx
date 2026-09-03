'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, ShieldCheck, Sparkles, Plus, Trash2, 
  Briefcase, GraduationCap, Award, CheckCircle, Code, Layers, FileText,
  ArrowRight, ArrowLeft, CheckCircle2, Star, Filter, Search, Check
} from 'lucide-react';
import { api } from '@/lib/api';
import { getActivePortalData } from '@/lib/resumeExtractor';
import EvidenceBadge from '@/components/EvidenceBadge';

export default function CareerKnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'experience' | 'education' | 'profile' | 'preferences'>('skills');
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('backend');
  const [searchQuery, setSearchQuery] = useState('');

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
      const [profData, skillsData, projData, expData, eduData, prefData] = await Promise.all([
        api.getProfile().catch(() => portalData?.profile || null),
        api.getSkills().catch(() => portalData?.skills || []),
        api.getProjects().catch(() => portalData?.projects || []),
        api.getExperience().catch(() => portalData?.experience || []),
        api.getEducation().catch(() => portalData?.education || []),
        api.getPreferences().catch(() => null),
      ]);

      const activeProfile = profData || portalData?.profile || {
        display_name: 'Alex Mercer',
        headline: 'Senior Backend Engineer',
        summary: 'Specialized in scalable distributed systems and AI platforms.',
        location: 'San Francisco, CA',
        email_public: 'alex.mercer.eng@gmail.com',
      };
      setProfile(activeProfile);

      const activeSkills = (skillsData && skillsData.length > 0) ? skillsData : (portalData?.skills || [
        { id: '1', name: 'Python', category: 'languages', proficiency: 'Expert', verified: true },
        { id: '2', name: 'FastAPI', category: 'backend', proficiency: 'Expert', verified: true },
        { id: '3', name: 'PostgreSQL', category: 'backend', proficiency: 'Advanced', verified: true },
        { id: '4', name: 'Docker', category: 'devops', proficiency: 'Advanced', verified: true },
        { id: '5', name: 'React', category: 'frontend', proficiency: 'Advanced', verified: true },
        { id: '6', name: 'Next.js', category: 'frontend', proficiency: 'Advanced', verified: true },
        { id: '7', name: 'TypeScript', category: 'languages', proficiency: 'Advanced', verified: true },
        { id: '8', name: 'Kubernetes', category: 'devops', proficiency: 'Intermediate', verified: true },
        { id: '9', name: 'PyTorch', category: 'ai_ml', proficiency: 'Intermediate', verified: true },
        { id: '10', name: 'Redis', category: 'backend', proficiency: 'Advanced', verified: true },
        { id: '11', name: 'Data Structures & Algorithms', category: 'core', proficiency: 'Expert', verified: true }
      ]);
      setSkills(activeSkills);

      // Load selected interview-ready skills from storage
      const savedSelected = localStorage.getItem('careeros_preferred_skills');
      if (savedSelected) {
        try {
          setSelectedSkills(JSON.parse(savedSelected));
        } catch {
          setSelectedSkills(activeSkills.slice(0, 6).map((s: any) => s.name));
        }
      } else {
        setSelectedSkills(activeSkills.slice(0, 6).map((s: any) => s.name));
      }

      setProjects((projData && projData.length > 0) ? projData : (portalData?.projects || []));
      setExperience((expData && expData.length > 0) ? expData : (portalData?.experience || []));
      setEducation((eduData && eduData.length > 0) ? eduData : (portalData?.education || []));
      setPreferences(prefData);
    } catch (err) {
      console.warn('Using local career store:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleSelectSkill = (skillName: string) => {
    let updated: string[];
    if (selectedSkills.includes(skillName)) {
      updated = selectedSkills.filter(s => s !== skillName);
    } else {
      updated = [...selectedSkills, skillName];
    }
    setSelectedSkills(updated);
    localStorage.setItem('careeros_preferred_skills', JSON.stringify(updated));
  };

  const handleSelectAll = () => {
    const allNames = skills.map(s => s.name);
    setSelectedSkills(allNames);
    localStorage.setItem('careeros_preferred_skills', JSON.stringify(allNames));
  };

  const handleClearSelected = () => {
    setSelectedSkills([]);
    localStorage.setItem('careeros_preferred_skills', JSON.stringify([]));
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newS = {
      id: `sk-${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory,
      normalized_name: newSkillName.toLowerCase().replace(/ /g, '_'),
      proficiency: 'Advanced',
      verified: true
    };

    setSkills([...skills, newS]);
    setSelectedSkills([...selectedSkills, newS.name]);
    localStorage.setItem('careeros_preferred_skills', JSON.stringify([...selectedSkills, newS.name]));

    try {
      await api.createSkill(newS);
    } catch {
      // Local addition
    }

    setNewSkillName('');
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    setSkills(skills.filter(s => s.id !== id && s.name !== name));
    setSelectedSkills(selectedSkills.filter(s => s !== name));
    try {
      await api.deleteSkill(id);
    } catch {
      // Local deletion
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Loading Verified Career Knowledge Base...</span>
      </div>
    );
  }

  // Filter skills for left column
  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Database className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Canonical Source of Truth</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Career Knowledge Base</h1>
          <p className="text-xs text-slate-400">Manage your verified facts, GitHub proof-of-work, and select interview-ready skills for your ATS resumes.</p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/resumes"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow-emerald transition"
          >
            <FileText className="w-4 h-4" />
            <span>Resume Studio</span>
          </Link>
          <Link
            href="/career/update"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-glow-indigo transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Update Career (AI)</span>
          </Link>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'skills', label: `Skillset Workspace (${skills.length})`, icon: Code },
          { id: 'projects', label: `Projects (${projects.length})`, icon: Layers },
          { id: 'experience', label: `Experience (${experience.length})`, icon: Briefcase },
          { id: 'education', label: `Education (${education.length})`, icon: GraduationCap },
          { id: 'profile', label: 'Candidate Profile', icon: ShieldCheck },
          { id: 'preferences', label: 'Target Preferences', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-glow-indigo'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. SKILLSET TWO-PORTION SELECTION WORKSPACE */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Add Skill Form */}
          <form onSubmit={handleAddSkill} className="p-4 rounded-2xl bg-surface border border-slate-800 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Add new skill (e.g. Apache Kafka, Docker, PyTorch)"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="flex-1 min-w-[220px] px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="backend">Backend & Databases</option>
              <option value="languages">Programming Languages</option>
              <option value="frontend">Frontend & UI</option>
              <option value="ai_ml">AI & Vector Retrieval</option>
              <option value="devops">DevOps & Cloud</option>
              <option value="core">Core CS / DSA</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-glow-indigo transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Skillset</span>
            </button>
          </form>

          {/* TWO-COLUMN SKILL SELECTION WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: ALL DETECTED & PROJECT SKILLS */}
            <div className="p-6 rounded-3xl bg-surface/90 border border-slate-700/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-base font-bold text-white">All Discovered Skills ({skills.length})</h3>
                  </div>
                  <p className="text-[11px] text-slate-400">Extracted from your GitHub repos, projects & uploaded resume.</p>
                </div>

                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-cyan-300 border border-indigo-500/40 rounded-lg text-xs font-semibold transition"
                >
                  Select All
                </button>
              </div>

              {/* SEARCH FILTER */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter skills by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* SKILLS LIST */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill.name);
                  return (
                    <div
                      key={skill.id || skill.name}
                      onClick={() => toggleSelectSkill(skill.name)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isSelected 
                          ? 'bg-indigo-950/40 border-indigo-500/40 text-white' 
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-white">{skill.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {skill.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">Proficiency: {skill.proficiency || 'Advanced'}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isSelected ? (
                          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                            <Check className="w-3 h-3" />
                            <span>Selected</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-[11px] font-semibold transition">
                            <span>Add →</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: MY VERIFIED INTERVIEW-READY SKILLS */}
            <div className="p-6 rounded-3xl bg-surface/90 border border-emerald-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Interview-Ready & Resume Skills ({selectedSkills.length})</h3>
                  </div>
                  <p className="text-[11px] text-emerald-400/80">Only these preferred skills will appear on your ATS resumes & interview questions.</p>
                </div>

                <button
                  onClick={handleClearSelected}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 rounded-lg text-xs font-semibold transition"
                >
                  Clear
                </button>
              </div>

              {selectedSkills.length === 0 ? (
                <div className="p-10 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl">
                  <Code className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400">No skills selected yet</p>
                  <p className="text-[11px] text-slate-500">Click any skill from the left column to add it to your interview-ready profile.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {selectedSkills.map((name) => {
                    const original = skills.find(s => s.name === name);
                    return (
                      <div
                        key={name}
                        className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-bold text-xs text-white">{name}</span>
                            <p className="text-[10px] text-emerald-400/70 font-mono">Preferred for Resumes</p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSelectSkill(name)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-lg text-xs font-semibold transition"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div key={proj.id || proj.name} className="p-6 rounded-2xl bg-surface border border-slate-700/80 glass-panel-hover space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{proj.name}</h3>
                    {proj.featured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        FEATURED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{proj.short_description}</p>
                </div>
                <EvidenceBadge status="verified" source="GitHub & Codebase" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Problem</span>
                  <p className="text-slate-300 mt-0.5">{proj.problem}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Solution</span>
                  <p className="text-slate-300 mt-0.5">{proj.solution}</p>
                </div>
              </div>

              {proj.outcomes?.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Verified Outcomes & Metrics</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {proj.outcomes.map((o: string, i: number) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-2">
                {proj.technologies?.map((tech: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-cyan-300 border border-indigo-500/30 text-[11px] font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. EXPERIENCE TAB */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          {experience.map((exp) => (
            <div key={exp.id || exp.title} className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{exp.title}</h3>
                  <p className="text-xs text-indigo-400 font-semibold mt-0.5">{exp.organization} • {exp.location}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
                  {exp.start_date} — {exp.end_date}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{exp.description}</p>

              {exp.achievements?.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
                  {exp.achievements.map((a: string, i: number) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. EDUCATION TAB */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id || edu.institution} className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{edu.institution}</h3>
                  <p className="text-xs text-cyan-400 font-semibold mt-0.5">{edu.degree} in {edu.field}</p>
                </div>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  {edu.grade}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 font-medium">Display Name</span>
              <p className="text-sm font-bold text-white mt-0.5">{profile?.display_name}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Headline</span>
              <p className="text-sm font-bold text-white mt-0.5">{profile?.headline}</p>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 font-medium">Professional Summary</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{profile?.summary}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Public Email</span>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">{profile?.email_public || profile?.email || 'None'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Phone (Private by Default)</span>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{profile?.phone_public || profile?.phone || 'Hidden'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. PREFERENCES TAB */}
      {activeTab === 'preferences' && (
        <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Target Roles</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {['Backend Engineer', 'Full-Stack Developer', 'AI Systems Engineer'].map((r: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">{r}</span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Target Locations</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {['San Francisco, CA', 'Remote / Global', 'New York, NY'].map((l: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">{l}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
