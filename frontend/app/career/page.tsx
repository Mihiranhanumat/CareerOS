'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, ShieldCheck, Sparkles, Plus, Trash2, 
  Briefcase, GraduationCap, Award, CheckCircle, Code, Layers, FileText
} from 'lucide-react';
import { api } from '@/lib/api';
import EvidenceBadge from '@/components/EvidenceBadge';

export default function CareerKnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'projects' | 'experience' | 'education' | 'preferences'>('skills');
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('backend');

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, skillsData, projData, expData, eduData, prefData] = await Promise.all([
          api.getProfile(),
          api.getSkills(),
          api.getProjects(),
          api.getExperience(),
          api.getEducation(),
          api.getPreferences(),
        ]);
        setProfile(profData);
        setSkills(skillsData);
        setProjects(projData);
        setExperience(expData);
        setEducation(eduData);
        setPreferences(prefData);
      } catch (err) {
        console.error('Failed to load career facts', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const created = await api.createSkill({
        name: newSkillName,
        category: newSkillCategory,
        normalized_name: newSkillName.toLowerCase().replace(/ /g, '_'),
        proficiency: 'Advanced',
        verified: true,
        confidence: 1.0,
        evidence: [
          {
            source_type: 'manual_entry',
            evidence_text: `Manually entered verified skill: ${newSkillName}`,
            confidence: 1.0
          }
        ]
      });
      setSkills([...skills, created]);
      setNewSkillName('');
    } catch (err) {
      alert('Failed to add skill: ' + err);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await api.deleteSkill(id);
      setSkills(skills.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete skill: ' + err);
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

  return (
    <div className="space-y-6 animate-in fade-in">
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
          <p className="text-xs text-slate-400">Every resume bullet, portfolio card, and application answer is derived from these verified facts.</p>
        </div>

        <Link
          href="/career/update"
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-glow-indigo transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Update My Career (AI Box)</span>
        </Link>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'skills', label: `Verified Skills (${skills.length})`, icon: Code },
          { id: 'projects', label: `Projects (${projects.length})`, icon: Layers },
          { id: 'experience', label: `Experience (${experience.length})`, icon: Briefcase },
          { id: 'education', label: `Education (${education.length})`, icon: GraduationCap },
          { id: 'profile', label: 'Canonical Profile', icon: ShieldCheck },
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

      {/* TAB CONTENT */}

      {/* 1. SKILLS TAB */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Add Skill Form */}
          <form onSubmit={handleAddSkill} className="p-4 rounded-2xl bg-surface border border-slate-800 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Add new skill (e.g. Apache Kafka, Kubernetes)"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="flex-1 min-w-[240px] px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="backend">Backend & Databases</option>
              <option value="languages">Programming Languages</option>
              <option value="frontend">Frontend & UX</option>
              <option value="ai_ml">AI & Vector Search</option>
              <option value="devops">DevOps & Cloud</option>
              <option value="tools">Testing & Tools</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-glow-indigo transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Verified Skill</span>
            </button>
          </form>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div key={skill.id} className="p-4 rounded-2xl bg-surface border border-slate-700/80 glass-panel-hover space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-mono text-indigo-400 font-semibold">{skill.category}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{skill.name}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Proficiency: <strong className="text-slate-200">{skill.proficiency}</strong></span>
                  <EvidenceBadge status={skill.verified ? 'verified' : 'unverified'} />
                </div>

                {skill.evidence_items?.length > 0 && (
                  <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 line-clamp-2">
                    {skill.evidence_items[0].evidence_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div key={proj.id} className="p-6 rounded-2xl bg-surface border border-slate-700/80 glass-panel-hover space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{proj.name}</h3>
                    {proj.featured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        FEATURED SPOTLIGHT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{proj.short_description}</p>
                </div>
                <EvidenceBadge status="verified" source="GitHub & Production" />
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
            <div key={exp.id} className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-3">
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
            <div key={edu.id} className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{edu.institution}</h3>
                  <p className="text-xs text-cyan-400 font-semibold mt-0.5">{edu.degree} in {edu.field}</p>
                </div>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  {edu.grade}
                </span>
              </div>

              {edu.coursework?.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Relevant Coursework</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {edu.coursework.map((c: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 text-xs">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
              <p className="text-xs font-mono text-cyan-400 mt-0.5">{profile?.email_public || 'None'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Phone (Private by Default)</span>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{profile?.phone_public || 'Hidden'}</p>
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
              {preferences?.target_roles?.map((r: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">{r}</span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Target Locations</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {preferences?.target_locations?.map((l: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">{l}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-slate-500 font-medium">Minimum Match Score Threshold</span>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{preferences?.minimum_match_score || 75}%</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Sponsorship / Eligibility</span>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">{preferences?.sponsorship_constraints}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
