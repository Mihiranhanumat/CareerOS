'use client';

import React from 'react';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ScoreBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  let colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  let glowClass = 'shadow-glow-emerald';

  if (score < 60) {
    colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    glowClass = '';
  } else if (score < 80) {
    colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    glowClass = '';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-lg px-4 py-1.5 font-bold',
  }[size];

  return (
    <div className={`inline-flex items-center space-x-1.5 rounded-full border ${colorClasses} ${glowClass} ${sizeClasses} font-semibold transition`}>
      <span className="font-mono">{score}%</span>
      {showLabel && <span className="text-[11px] opacity-80 font-normal">Match</span>}
    </div>
  );
}
