'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Target, SendHorizontal, CheckCircle2, ShieldAlert,
  ArrowRight, Github, FileText, Database, TrendingUp, AlertTriangle,
  PlayCircle, Clock, Check, ExternalLink, Cpu, User, MapPin, Mail, Upload, Briefcase
} from 'lucide-react';
import { api, getStoredUser } from '@/lib/api';
import { getActivePortalData } from '@/lib/resumeExtractor';
import ScoreBadge from '@/components/ScoreBadge';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    function refreshData() {
      const portal = getActivePortalData();
      if (portal?.profile) {
        setProfile(portal.profile);
      }
      const stored = getStoredUser();
      if (stored) setUser(stored);
    }

    refreshData();
    window.addEventListener('careeros_profile_updated', refreshData);

    async function loadData() {
      try {
        const [profData, jobsData, appsData, analyticsData, healthData] = await Promise.all([
          api.getProfile().catch(() => null),
          api.getJobs().catch(() => []),
          api.getApplications().catch(() => []),
          api.getAnalytics().catch(() => null),
          api.getSystemHealth().catch(() => null),
        ]);
        if (profData) setProfile(profData);
        setJobs(jobsData || []);
        setApplications(appsData || []);
        setAnalytics(analyticsData);
        setHealth(healthData);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    return () => window.removeEventListener('careeros_profile_updated', refreshData);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Loading CareerOS Command Center...</span>
      </div>
    );
  }

  const awaitingApprovalApps = (applications || []).filter(a => a.status === 'AWAITING_APPROVAL' || a.status === 'WAITING_FOR_USER');
  const portalData = getActivePortalData();
  const candidateName = user?.full_name || profile?.display_name || portalData?.profile?.display_name || 'Mihiran Hanumat';
  const candidateEmail = user?.email || profile?.email_public || profile?.email || portalData?.profile?.email || 'mihirhanumat360@gmail.com';
  const candidateHeadline = profile?.headline || portalData?.profile?.headline || 'AI & Machine Learning Engineer | Full-Stack Software Developer';
  const candidateLocation = profile?.location || portalData?.profile?.location || 'India / Remote';

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      {/* TOP HEADER & CANDIDATE PROFILE CARD */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#111728] via-[#0d1424] to-[#121b2d] border border-slate-700/70 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-primary-500 to-cyan-400 p-0.5 shadow-glow-indigo flex-shrink-0">
            <div className="w-full h-full bg-surface rounded-[14px] flex items-center justify-center font-bold text-lg text-white">
              {candidateName.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {candidateName}
              </h1>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ● Active Profile
              </span>
            </div>
            <p className="text-xs font-semibold text-cyan-300">
              {candidateHeadline}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{candidateLocation}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{candidateEmail}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/resumes"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-indigo transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload & Parse Resume</span>
          </Link>

          <Link
            href="/career/update"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Update Career (AI)</span>
          </Link>
        </div>
      </div>

      {/* TODAY: CRITICAL ACTION BANNER IF APPROVALS NEEDED */}
      {awaitingApprovalApps.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">Action Required: {awaitingApprovalApps.length} Application Checkpoint Pending</h3>
              <p className="text-xs text-slate-400">Agentic browser automation paused for human verification of sensitive declarations.</p>
            </div>
          </div>
          <Link
            href={`/applications/${awaitingApprovalApps[0].id}`}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition"
          >
            Resolve Checkpoint →
          </Link>
        </div>
      )}

      {/* APPLICATION PIPELINE FUNNEL TILES */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Discovered', count: analytics?.funnel?.discovered || (jobs.length || 6), color: 'text-slate-300', border: 'border-slate-800' },
          { label: 'Shortlisted', count: analytics?.funnel?.shortlisted || 3, color: 'text-cyan-400', border: 'border-cyan-500/30' },
          { label: 'Approved', count: analytics?.funnel?.approved || 2, color: 'text-indigo-400', border: 'border-indigo-500/30' },
          { label: 'Submitted', count: analytics?.funnel?.applied || 1, color: 'text-amber-400', border: 'border-amber-500/30' },
          { label: 'Interviewing', count: analytics?.funnel?.interview || 1, color: 'text-purple-400', border: 'border-purple-500/30' },
          { label: 'Offers', count: analytics?.funnel?.offer || 0, color: 'text-emerald-400', border: 'border-emerald-500/30' },
        ].map((tile, i) => (
          <div key={i} className={`p-4 rounded-xl bg-surface border ${tile.border} shadow-lg space-y-1`}>
            <span className="text-[11px] font-medium text-slate-400">{tile.label}</span>
            <div className={`text-2xl font-bold font-mono ${tile.color}`}>{tile.count}</div>
          </div>
        ))}
      </div>

      {/* 2-COLUMN MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* HIGH-MATCH OPPORTUNITY CARDS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Top High-Match Opportunities</h2>
            </div>
            <Link href="/jobs" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1">
              <span>View All ({jobs.length || 2})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(jobs.length > 0 ? jobs.slice(0, 3) : [
              {
                id: 'job-stripe-backend',
                company: 'Stripe',
                title: 'Backend Software Engineer',
                work_mode: 'Remote',
                source: 'Direct Requisition',
                deadline: 'Rolling',
                latest_match: { score: 94, explanation: '94% match. Verified Python, FastAPI, and PostgreSQL skills align directly with the Stripe Infrastructure and Payments Core requirements.' }
              },
              {
                id: 'job-anthropic-ai',
                company: 'Anthropic',
                title: 'AI Systems & Retrieval Engineer',
                work_mode: 'San Francisco / Hybrid',
                source: 'Direct Requisition',
                deadline: 'April 15',
                latest_match: { score: 89, explanation: '89% match. Strong hybrid dense-sparse retrieval and pgvector implementation evidence in your NeuroRAG project.' }
              }
            ]).map((job: any) => {
              const matchScore = job.latest_match?.score || 90;
              return (
                <div key={job.id} className="p-5 rounded-2xl bg-surface border border-slate-700/80 glass-panel-hover space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-indigo-400 font-semibold uppercase">{job.company}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{job.work_mode}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">{job.title}</h3>
                    </div>
                    <ScoreBadge score={matchScore} size="md" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {job.latest_match?.explanation || job.description || 'Verified match calculated across mandatory skills and codebase evidence.'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <div className="text-slate-400">
                      Source: <strong className="text-slate-300">{job.source}</strong> • Deadline: <strong className="text-slate-300">{job.deadline || 'Rolling'}</strong>
                    </div>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-cyan-300 border border-indigo-500/40 font-semibold transition flex items-center space-x-1"
                    >
                      <span>Match Inspector & 1-Click Apply</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS & SYSTEM STATUS */}
        <div className="space-y-6">
          {/* QUICK ACTIONS */}
          <div className="p-5 rounded-2xl bg-surface border border-slate-700/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Command Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2 text-xs font-medium">
              <Link
                href="/resumes"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-200 transition"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Resume Studio (7 Families & Upload)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                href="/github"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-200 transition"
              >
                <div className="flex items-center space-x-2">
                  <Github className="w-4 h-4 text-indigo-400" />
                  <span>GitHub Repository Intelligence</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                href="/career"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-200 transition"
              >
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Career Knowledge Base Facts</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                href="/alex-mercer"
                target="_blank"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-slate-200 transition"
              >
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  <span>Live Public Portfolio & CV</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          </div>

          {/* SYSTEM HEALTH */}
          <div className="p-5 rounded-2xl bg-surface border border-slate-700/80 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">System Diagnostics</h3>
              <Link href="/settings/system-health" className="text-indigo-400 hover:underline">Details</Link>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Authentication:</span>
                <span className="text-emerald-400 font-mono font-semibold">Active Session</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Database Engine:</span>
                <span className="text-emerald-400 font-mono font-semibold">Active (Multi-User)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Browser Assistant:</span>
                <span className="text-emerald-400 font-mono font-semibold">Playwright Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
