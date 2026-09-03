'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ShieldCheck, Download, ExternalLink, Github, 
  Linkedin, Mail, MapPin, Code, Layers, Briefcase, GraduationCap, 
  Award, ArrowRight, CheckCircle2, Terminal, Cpu, Check
} from 'lucide-react';
import { api } from '@/lib/api';

export default function DynamicPublicPortfolioPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublic() {
      try {
        const publicData = await api.getPublicProfile(params.slug);
        setData(publicData);
      } catch (err) {
        console.error('Failed to load public profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublic();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center space-x-3 text-cyan-400 font-sans">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Loading Verified Public Career Profile...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400">
        Profile not found or privacy enabled.
      </div>
    );
  }

  const profile = data.profile || {};

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* GLOWING AMBIENT BACKGROUND ACCENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[140px]" />
      </div>

      {/* TOP FLOATING NAVIGATION */}
      <header className="sticky top-4 z-50 max-w-5xl mx-auto px-4">
        <nav className="p-3.5 rounded-2xl bg-surface/80 backdrop-blur-xl border border-slate-700/60 shadow-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-glow-indigo">
              {profile.display_name?.slice(0, 2).toUpperCase() || 'AM'}
            </span>
            <span className="font-bold text-sm tracking-tight text-white">{profile.display_name}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Verified Facts</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <Link
              href={`/${params.slug}/cv`}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold shadow-glow-indigo transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>View & Download ATS CV</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* MAIN PORTFOLIO BODY */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* HERO SECTION */}
        <section className="space-y-6 pt-4">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{profile.availability || 'Open to Senior Engineering Roles'}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {profile.display_name}
            </h1>
            <p className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300">
              {profile.headline}
            </p>
          </div>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
            {profile.summary}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
              >
                <Github className="w-4 h-4 text-indigo-400" />
                <span>GitHub Evidence</span>
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
              >
                <Linkedin className="w-4 h-4 text-cyan-400" />
                <span>LinkedIn</span>
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>{profile.email}</span>
              </a>
            )}
          </div>
        </section>

        {/* FEATURED PROJECTS SHOWCASE */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Featured Projects & Architecture</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">100% Code Verified</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {(data.projects || []).map((proj: any) => (
              <div key={proj.id} className="p-8 rounded-3xl bg-surface/90 border border-slate-700/80 glass-panel-hover space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-white">{proj.name}</h3>
                      {proj.featured && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          SPOTLIGHT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300">{proj.short_description}</p>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {proj.demo_url && (
                      <a href={proj.demo_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700 transition">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Problem</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{proj.problem}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Solution</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{proj.solution}</p>
                  </div>
                </div>

                {proj.outcomes?.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Verified Outcomes & Scale</span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {proj.outcomes.map((o: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-2 text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.technologies?.map((tech: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-indigo-500/10 text-cyan-300 border border-indigo-500/30 text-xs font-mono font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VERIFIED SKILLS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Verified Skills & Proficiency</h2>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Proof-Backed</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {(data.skills || []).map((skill: any) => (
              <div key={skill.id} className="px-4 py-2 rounded-2xl bg-surface border border-slate-700/80 glass-panel-hover flex items-center space-x-2 text-xs">
                <span className="font-bold text-white">{skill.name}</span>
                <span className="text-[10px] text-indigo-400 font-mono font-semibold">({skill.proficiency})</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            ))}
          </div>
        </section>

        {/* EXPERIENCE TIMELINE */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Experience & Leadership</h2>
            </div>
          </div>

          <div className="space-y-6">
            {(data.experience || []).map((exp: any) => (
              <div key={exp.id} className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{exp.title}</h3>
                    <p className="text-xs text-indigo-400 font-semibold">{exp.organization} • {exp.location}</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                    {exp.start_date} — {exp.end_date}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{exp.description}</p>

                {exp.achievements?.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    {exp.achievements.map((a: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* EDUCATION & ACHIEVEMENTS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education */}
          <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
              <GraduationCap className="w-5 h-5" />
              <span>Academic Education</span>
            </div>
            {(data.education || []).map((edu: any) => (
              <div key={edu.id} className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">{edu.institution}</h4>
                <p className="text-cyan-400 font-semibold">{edu.degree} in {edu.field}</p>
                <p className="text-emerald-400 font-mono">{edu.grade}</p>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Award className="w-5 h-5" />
              <span>Honors & Achievements</span>
            </div>
            {(data.achievements || []).map((ach: any) => (
              <div key={ach.id} className="space-y-1 text-xs">
                <h4 className="font-bold text-white">{ach.title}</h4>
                <p className="text-slate-400">{ach.organization} • {ach.date}</p>
                <p className="text-slate-300">{ach.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 space-y-1">
        <p>© 2026 {profile.display_name}. Verified Career Profile.</p>
        <p className="text-[10px] text-slate-600 font-mono">Powered by CareerOS — Private AI Placement Operating System</p>
      </footer>
    </div>
  );
}
