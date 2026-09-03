'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface CheckpointModalProps {
  isOpen: boolean;
  checkpoint: {
    type: string;
    title: string;
    question: string;
    what_site_asks: string;
    what_careeros_knows: string;
    proposed_answer: string;
  };
  onResolve: (decision: 'approve' | 'edit' | 'cancel', customInput?: string) => void;
  onClose: () => void;
}

export default function CheckpointModal({ isOpen, checkpoint, onResolve, onClose }: CheckpointModalProps) {
  const [customInput, setCustomInput] = useState(checkpoint?.proposed_answer || '');
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen || !checkpoint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="max-w-xl w-full bg-[#111728] border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">Safety Checkpoint Paused</span>
            <h2 className="text-lg font-bold text-white mt-0.5">{checkpoint.title}</h2>
            <p className="text-xs text-slate-400">Agentic automation paused. Sensitive declarations require explicit user approval.</p>
          </div>
        </div>

        <div className="space-y-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="border-b border-slate-800 pb-2">
            <span className="text-slate-500 font-medium">WHAT THE SITE ASKS:</span>
            <p className="text-slate-200 font-semibold mt-0.5">{checkpoint.what_site_asks}</p>
          </div>

          <div className="border-b border-slate-800 pb-2">
            <span className="text-slate-500 font-medium">WHAT CAREEROS KNOWS (FROM VERIFIED FACTS):</span>
            <p className="text-emerald-400 font-semibold mt-0.5">{checkpoint.what_careeros_knows}</p>
          </div>

          <div>
            <span className="text-slate-500 font-medium">PROPOSED SUBMISSION ANSWER:</span>
            {!isEditing ? (
              <p className="text-cyan-300 font-mono mt-0.5">{checkpoint.proposed_answer}</p>
            ) : (
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                rows={2}
                className="w-full mt-1.5 p-2 rounded-lg bg-slate-950 border border-indigo-500/50 text-white font-mono text-xs focus:outline-none"
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => onResolve('cancel')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel Run
          </button>

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
              >
                Edit Answer
              </button>
            ) : null}

            <button
              onClick={() => onResolve(isEditing ? 'edit' : 'approve', customInput)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition"
            >
              Approve & Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
