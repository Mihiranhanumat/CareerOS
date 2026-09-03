'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Send, ShieldCheck, ArrowLeft, History, Check } from 'lucide-react';
import { api } from '@/lib/api';
import DiffViewer from '@/components/DiffViewer';

export default function UpdateCareerPage() {
  const [inputText, setInputText] = useState('I learned Docker containerization and deployed my FastAPI microservice with pgvector semantic caching.');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [proposal, setProposal] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const result = await api.createCareerProposal(inputText);
      setProposal(result);
    } catch (err) {
      alert('Error parsing career update: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proposalId: string) => {
    setActionLoading(true);
    try {
      const res = await api.approveProposal(proposalId);
      setProposal((prev: any) => ({ ...prev, status: 'approved' }));
      setHistory((prev) => [
        { id: proposalId, text: proposal.raw_input, status: 'approved', time: 'Just now' },
        ...prev
      ]);
    } catch (err) {
      alert('Error approving proposal: ' + err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (proposalId: string) => {
    setActionLoading(true);
    try {
      await api.rejectProposal(proposalId);
      setProposal((prev: any) => ({ ...prev, status: 'rejected' }));
      setHistory((prev) => [
        { id: proposalId, text: proposal.raw_input, status: 'rejected', time: 'Just now' },
        ...prev
      ]);
    } catch (err) {
      alert('Error rejecting proposal: ' + err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <Link href="/career" className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Career Knowledge Base</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">AI Career Assistant</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Update My Career (Natural Language)</h1>
          <p className="text-xs text-slate-400">
            Describe any new project, technology learned, or achievement in plain English. CareerOS will structure and verify it before updating your canonical profile.
          </p>
        </div>
      </div>

      {/* NATURAL LANGUAGE INPUT BOX */}
      <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 shadow-2xl space-y-4">
        <form onSubmit={handleParse} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Natural-Language Update Box
          </label>
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              placeholder="e.g. 'I learned Docker and containerized my FastAPI NLP project. We sustained 85,000 requests/sec with zero regressions.'"
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              ⚡ Zero Hallucinations: Changes will remain in proposal state until you click Approve.
            </span>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-primary-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-indigo transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Diff...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Parse & Propose Diff</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* DIFF VIEWER */}
      {proposal && (
        <DiffViewer
          proposal={proposal}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      )}

      {/* SAMPLE QUICK PROMPTS */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Try these sample updates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {[
            'I learned Docker and containerized my FastAPI NLP project with Docker Compose.',
            'Built a hybrid RAG search pipeline using pgvector and PyTorch cross-encoders with 48ms latency.',
            'Added Apache Kafka event streaming to process 10,000 messages per second.',
            'Passed AWS Certified Solutions Architect Associate exam with 890 score.'
          ].map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInputText(sample)}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-slate-300 hover:text-white transition"
            >
              "{sample}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
