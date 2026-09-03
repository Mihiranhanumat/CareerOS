'use client';

import React from 'react';
import { ShieldCheck, GitFork, AlertCircle } from 'lucide-react';

interface EvidenceBadgeProps {
  status: 'verified' | 'proposed' | 'weak' | 'unverified';
  source?: string;
}

export default function EvidenceBadge({ status, source }: EvidenceBadgeProps) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
        <ShieldCheck className="w-3 h-3" />
        <span>Verified Evidence</span>
        {source && <span className="opacity-70">({source})</span>}
      </span>
    );
  }

  if (status === 'proposed') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-medium">
        <GitFork className="w-3 h-3" />
        <span>AI Proposal (Pending Approval)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium">
      <AlertCircle className="w-3 h-3" />
      <span>Unverified Claim</span>
    </span>
  );
}
