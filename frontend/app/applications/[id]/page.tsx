'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  SendHorizontal, ArrowLeft, ShieldAlert, CheckCircle2, 
  PlayCircle, RefreshCw, FileText, ExternalLink, Sparkles, Clock, Check 
} from 'lucide-react';
import { api } from '@/lib/api';
import CheckpointModal from '@/components/CheckpointModal';

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const [application, setApplication] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [browserRunning, setBrowserRunning] = useState(false);
  const [browserSession, setBrowserSession] = useState<any>(null);
  const [checkpointOpen, setCheckpointOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function loadData() {
    try {
      const appData = await api.getApplication(params.id);
      setApplication(appData);
      const [jobData, timelineData] = await Promise.all([
        api.getJob(appData.job_id),
        api.getApplicationTimeline(params.id),
      ]);
      setJob(jobData);
      setTimeline(timelineData);
    } catch (err) {
      console.error('Failed to load application details', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStartBrowser = async () => {
    setBrowserRunning(true);
    try {
      const session = await api.startBrowserWorkflow(params.id);
      setBrowserSession(session);
      if (session.status === 'PAUSED_AT_CHECKPOINT') {
        setCheckpointOpen(true);
      }
      await loadData();
    } catch (err) {
      alert('Error launching browser assistant: ' + err);
    } finally {
      setBrowserRunning(false);
    }
  };

  const handleResolveCheckpoint = async (decision: 'approve' | 'edit' | 'cancel', customInput?: string) => {
    try {
      const session = await api.resolveCheckpoint(params.id, decision, customInput);
      setBrowserSession(session);
      setCheckpointOpen(false);
      await loadData();
    } catch (err) {
      alert('Error resolving checkpoint: ' + err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Loading Application Record & Lifecycle...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
      {/* TOP HEADER */}
      <div className="space-y-4">
        <Link href="/applications" className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Application Tracker</span>
        </Link>

        <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{job?.company}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
                Source: {application.source}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{job?.title}</h1>
            <p className="text-xs text-slate-400 font-mono">App ID: {application.id}</p>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-3">
            <span className="px-4 py-1.5 rounded-full font-mono text-xs font-bold bg-indigo-500/20 text-cyan-300 border border-indigo-500/40 shadow-glow-indigo">
              {application.status}
            </span>
            <span className="text-[11px] text-slate-400">
              Next: <strong className="text-slate-200">{application.next_action || 'Review answers'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* BROWSER AUTOMATION RUNNER BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-[#12192c] to-cyan-950/70 border border-indigo-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <PlayCircle className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Browser Automation Assistant (Playwright)</h2>
            </div>
            <p className="text-xs text-slate-300">
              Performs permitted form navigation, maps verified profile fields, attaches resume PDF, and pauses on sensitive checkpoints.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/applications/mock-site"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Mock Portal</span>
            </Link>

            <button
              onClick={handleStartBrowser}
              disabled={browserRunning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-glow-indigo transition flex items-center space-x-2 disabled:opacity-50"
            >
              {browserRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Navigating Portal...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Launch Browser Assistant</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* BROWSER WORKFLOW LOGS IF ACTIVE */}
        {browserSession?.logs?.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
            {browserSession.logs.map((log: string, idx: number) => (
              <div key={idx} className="text-slate-300">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-COLUMN MAIN VIEW: GENERATED ANSWERS & AUDIT TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GENERATED ANSWERS (2 COLS) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Synthesized Application Answers</h3>
            <span className="text-xs text-slate-400">Strictly derived from verified career data</span>
          </div>

          <div className="space-y-3">
            {(application.answers || []).map((ans: any) => (
              <div key={ans.id} className="p-4 rounded-2xl bg-surface border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase font-mono">{ans.field_name}</span>
                  {ans.requires_review ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                      Requires Human Checkpoint
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                      Auto-Approved Fact
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  {ans.answer}
                </p>

                {ans.evidence_source && (
                  <p className="text-[10px] text-slate-500">
                    Source: <strong className="text-slate-400">{ans.evidence_source}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AUDIT TIMELINE (1 COL) */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Event Lifecycle Timeline</h3>

          <div className="p-5 rounded-2xl bg-surface border border-slate-700/80 space-y-4">
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative pl-6 space-y-1 text-xs">
                  <span className="absolute left-0 top-1 w-4 h-4 rounded-full bg-indigo-600 border-2 border-slate-900 shadow-glow-indigo" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{event.event_type}</span>
                    <span className="text-[10px] text-slate-500">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Actor: {event.source}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SENSITIVE CHECKPOINT MODAL */}
      <CheckpointModal
        isOpen={checkpointOpen}
        checkpoint={browserSession?.checkpoint}
        onResolve={handleResolveCheckpoint}
        onClose={() => setCheckpointOpen(false)}
      />
    </div>
  );
}
