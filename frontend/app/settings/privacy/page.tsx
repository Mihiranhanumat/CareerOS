'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function PrivacySettingsPage() {
  const [visibilities, setVisibilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getVisibility();
        setVisibilities(data);
      } catch (err) {
        console.error('Failed to load visibility settings', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Shield className="w-4 h-4" />
          </span>
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Data Isolation</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">Privacy & Field Visibility Controls</h1>
        <p className="text-xs text-slate-400">
          Configure per-field visibility on your public portfolio. Sensitive fields default strictly to PRIVATE.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4">
        <h2 className="text-base font-bold text-white">Field Visibility Rules</h2>
        
        <div className="space-y-3">
          {visibilities.map((v) => (
            <div key={v.field_name} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white font-mono">{v.field_name}</span>
                <p className="text-[11px] text-slate-400">Controls rendering on public portfolio URL</p>
              </div>

              <span className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold border ${
                v.visibility === 'public'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : v.visibility === 'selective'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {v.visibility.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
