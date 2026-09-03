'use client';

import React from 'react';
import { PlusCircle, RefreshCw, Sparkles, HelpCircle, Check, X, ShieldAlert } from 'lucide-react';

interface DiffViewerProps {
  proposal: {
    proposal_id: string;
    raw_input: string;
    added?: any[];
    changed?: any[];
    suggested?: any[];
    needs_clarification?: any[];
    status?: string;
  };
  onApprove: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  loading?: boolean;
}

export default function DiffViewer({ proposal, onApprove, onReject, loading = false }: DiffViewerProps) {
  const { proposal_id, raw_input, added = [], changed = [], suggested = [], needs_clarification = [], status } = proposal;

  const totalProposals = added.length + changed.length + suggested.length + needs_clarification.length;

  return (
    <div className="rounded-2xl bg-surface border border-slate-700/80 p-6 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI Proposal Diff
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {proposal_id.slice(0, 8)}</span>
          </div>
          <p className="text-xs text-slate-300 mt-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 italic">
            "{raw_input}"
          </p>
        </div>

        {status === 'pending' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onReject(proposal_id)}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700 disabled:opacity-50"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => onApprove(proposal_id)}
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-glow-emerald transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Commit to Verified Facts</span>
            </button>
          </div>
        )}

        {status === 'approved' && (
          <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Committed to Source of Truth</span>
          </div>
        )}
      </div>

      {totalProposals === 0 ? (
        <div className="text-center py-6 text-slate-400 text-sm">
          No structured changes detected. The system preserved existing verified facts.
        </div>
      ) : (
        <div className="space-y-4">
          {/* ADDED ITEMS */}
          {added.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <PlusCircle className="w-4 h-4" />
                <span>Proposed Additions ({added.length})</span>
              </div>
              <div className="grid gap-2.5">
                {added.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white">{item.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-mono">{item.type}</span>
                      </div>
                      {item.evidence_text && (
                        <p className="text-xs text-slate-400 mt-1">
                          <strong className="text-slate-300">Evidence Trail:</strong> {item.evidence_text}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">{Math.round((item.confidence || 0.9) * 100)}% Conf.</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHANGED ITEMS */}
          {changed.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <RefreshCw className="w-4 h-4" />
                <span>Proposed Modifications ({changed.length})</span>
              </div>
              <div className="grid gap-2.5">
                {changed.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    <p className="text-xs text-slate-400 mt-1">{JSON.stringify(item.details)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUGGESTED ITEMS */}
          {suggested.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>AI Suggestions ({suggested.length})</span>
              </div>
              <div className="grid gap-2.5">
                {suggested.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    <p className="text-xs text-slate-400 mt-1">{item.details?.note || 'Suggested link to verified project records'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEEDS CLARIFICATION */}
          {needs_clarification.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <HelpCircle className="w-4 h-4" />
                <span>Needs Clarification ({needs_clarification.length})</span>
              </div>
              <div className="grid gap-2.5">
                {needs_clarification.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    <p className="text-xs text-amber-200/80 mt-1">Requires human input before becoming a verified claim.</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
