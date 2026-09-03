'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, PlayCircle, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export default function MockSitePage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <Link href="/applications" className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Application Tracker</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <PlayCircle className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Playwright Automation Environment</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Local Mock Job Portal Playground</h1>
          <p className="text-xs text-slate-400">
            This simulated career portal provides live endpoints for testing browser automation, resume uploads, and safe human checkpoints (work authorization, CAPTCHA, attestations).
          </p>
        </div>

        <a
          href="http://127.0.0.1:8000/mock-portal"
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Direct Endpoint in New Tab</span>
        </a>
      </div>

      {/* EMBEDDED IFRAME OF THE MOCK SITE */}
      <div className="rounded-2xl border-2 border-slate-700/80 overflow-hidden shadow-2xl bg-slate-900 h-[680px]">
        <iframe
          src="http://127.0.0.1:8000/mock-portal"
          className="w-full h-full border-0"
          title="Mock Application Portal"
        />
      </div>
    </div>
  );
}
