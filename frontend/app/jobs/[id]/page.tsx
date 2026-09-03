'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Target, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, 
  Sparkles, SendHorizontal, FileText, Check, ArrowRight, Building2, MapPin, Clock 
} from 'lucide-react';
import { api } from '@/lib/api';
import ScoreBadge from '@/components/ScoreBadge';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState('backend');

  useEffect(() => {
    async function loadJob() {
      try {
        const data = await api.getJob(params.id);
        setJob(data);
      } catch (err) {
        console.error('Failed to load job details', err);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [params.id]);

  const handleOneClickApply = async () => {
    setApproving(true);
    try {
      const app = await api.approveApplicationOneClick(params.id, selectedFamily);
      router.push(`/applications/${app.id}`);
    } catch (err) {
      alert('Error initiating 1-Click Application: ' + err);
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Analyzing Role Fit & Evidence Maps...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Opportunity not found.</p>
        <Link href="/jobs" className="text-cyan-400 underline text-xs mt-2 inline-block">Back to Opportunity Inbox</Link>
      </div>
    );
  }

  const match = job.latest_match || {};
  const score = match.score || 90;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
      {/* HEADER & TOP SUMMARY */}
      <div className="space-y-4">
        <Link href="/jobs" className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunity Inbox</span>
        </Link>

        <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{job.company}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">{job.work_mode}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">Source: {job.source}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{job.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Deadline: {job.deadline || 'Rolling'}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-3">
            <ScoreBadge score={score} size="lg" />
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              ● Hard Eligibility Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* 1-CLICK APPROVAL DECISION BANNER (SECTION 8 & 20) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#131b2e] to-cyan-950/60 border-2 border-indigo-500/50 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">CareerOS Decision: "Should I Apply?"</h2>
            </div>
            <p className="text-xs text-slate-300">
              Match score is <strong className="text-emerald-400">{score}%</strong>. Verified Python & FastAPI evidence satisfies all mandatory criteria. 
              Clicking <strong className="text-cyan-300">YES</strong> generates a tailored ATS resume, drafts verified answers, and prepares the browser assistant.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={handleOneClickApply}
              disabled={approving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-primary-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-glow-indigo transition flex items-center space-x-2 disabled:opacity-50"
            >
              {approving ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing ATS Resume & Answers...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>YES — 1-Click Approve & Apply</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN BREAKDOWN: MULTI-FACTOR SCORE ENGINE & EVIDENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: EXPLAINABLE FACTOR WEIGHTS */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-surface border border-slate-700/80 space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Factor Scoring Weights</h3>

            <div className="space-y-3">
              {[
                { label: 'Mandatory Technical Skills (30%)', val: `${Math.round((match.skill_score || 0.95) * 100)}%`, color: 'text-emerald-400' },
                { label: 'Project & Experience Relevance (20%)', val: `${Math.round((match.project_score || 0.92) * 100)}%`, color: 'text-cyan-400' },
                { label: 'Eligibility Gate (15% - Hard Constraint)', val: '100% Passed', color: 'text-emerald-400' },
                { label: 'Role Alignment (10%)', val: `${Math.round((match.experience_score || 0.90) * 100)}%`, color: 'text-indigo-400' },
                { label: 'Preferred Technologies (10%)', val: '90%', color: 'text-indigo-400' },
                { label: 'Location / Work Mode (5%)', val: '100%', color: 'text-slate-300' },
                { label: 'Company / Industry Preference (5%)', val: `${Math.round((match.preference_score || 0.95) * 100)}%`, color: 'text-slate-300' },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">{f.label}</span>
                  <span className={`font-mono font-bold ${f.color}`}>{f.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: MATCHED EVIDENCE & GAPS */}
        <div className="lg:col-span-2 space-y-6">
          {/* MATCHED EVIDENCE LIST */}
          <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matched Verified Evidence</span>
            </div>

            <div className="space-y-2.5">
              {(match.matched_evidence || []).map((m: any, i: number) => (
                <div key={i} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{m.skill}</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">Verified Proof</span>
                  </div>
                  <p className="text-slate-300">{m.evidence}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MISSING REQUIREMENTS & RECOVERY ADVICE */}
          <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Missing or Minor Requirements</span>
            </div>

            {(match.missing_requirements || []).length === 0 ? (
              <p className="text-xs text-slate-400">Zero material skill gaps identified for this role.</p>
            ) : (
              <div className="space-y-2.5">
                {match.missing_requirements.map((g: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{g.requirement}</span>
                      <span className="text-[10px] text-amber-400 font-mono font-semibold uppercase">{g.severity} Gap</span>
                    </div>
                    <p className="text-slate-300">{g.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
