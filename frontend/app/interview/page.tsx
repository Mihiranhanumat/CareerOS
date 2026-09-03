'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mic, Sparkles, CheckCircle2, ShieldCheck, 
  HelpCircle, Code, Briefcase, ListChecks, ArrowRight 
} from 'lucide-react';
import { api } from '@/lib/api';

export default function InterviewCenterPage() {
  const [prepPack, setPrepPack] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('job-stripe-backend');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const jobsData = await api.getJobs();
        setJobs(jobsData);
        const prep = await api.getInterviewPrep(selectedJobId);
        setPrepPack(prep);
      } catch (err) {
        console.error('Failed to load interview pack', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedJobId]);

  const handleSelectJob = async (jobId: string) => {
    setSelectedJobId(jobId);
    setLoading(true);
    try {
      const prep = await api.getInterviewPrep(jobId);
      setPrepPack(prep);
    } catch (err) {
      alert('Failed to generate interview pack: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Mic className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Interview Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Interview Prep Center</h1>
          <p className="text-xs text-slate-400">
            Synthesizes role-specific technical questions, behavioral frameworks, and STAR stories strictly from factual evidence.
          </p>
        </div>

        {/* SELECT JOB */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Select Opportunity:</span>
          <select
            value={selectedJobId}
            onChange={(e) => handleSelectJob(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
          <Sparkles className="w-6 h-6 animate-spin" />
          <span className="text-sm font-semibold">Synthesizing STAR Stories & Technical Questions...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* STAR STORIES FROM VERIFIED EVIDENCE */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Verified STAR Stories (Evidence-Backed)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(prepPack?.project_star_stories || []).map((star: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-surface border border-slate-700/80 space-y-3 glass-panel-hover">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white">{star.project_name}</h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <strong className="text-indigo-400 font-mono text-[11px]">SITUATION & TASK:</strong>
                      <p className="text-slate-300 mt-0.5">{star.task}</p>
                    </div>
                    <div>
                      <strong className="text-cyan-400 font-mono text-[11px]">ACTION TAKEN:</strong>
                      <p className="text-slate-300 mt-0.5">{star.action}</p>
                    </div>
                    <div>
                      <strong className="text-emerald-400 font-mono text-[11px]">VERIFIED OUTCOME & RESULT:</strong>
                      <p className="text-emerald-300/90 mt-0.5 font-semibold">{star.result}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TECHNICAL DEEP-DIVE QUESTIONS */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Targeted Technical Architecture Questions</h2>
            </div>

            <div className="space-y-3">
              {(prepPack?.technical_questions || []).map((t: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-surface border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold text-indigo-400">{t.topic}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Ref: {t.evidence_reference}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{t.question}</h3>
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <span className="text-slate-400 font-semibold text-[10px] uppercase">Recommended Discussion Points:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {t.suggested_answer_points?.map((pt: string, pIdx: number) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FINAL-DAY CHECKLIST */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-surface to-cyan-950/40 border border-slate-700/80 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <ListChecks className="w-5 h-5" />
              <span>Final-Day Interview Revision Checklist</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {(prepPack?.final_day_checklist || []).map((item: string, idx: number) => (
                <li key={idx} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
