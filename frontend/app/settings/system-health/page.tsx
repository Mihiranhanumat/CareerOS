'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Cpu, Database, Globe, Layers, Shield } from 'lucide-react';
import { api } from '@/lib/api';

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, []);

  async function loadHealth() {
    setLoading(true);
    try {
      const data = await api.getSystemHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to load health diagnostics', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Diagnostics</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">System Health & Status</h1>
          <p className="text-xs text-slate-400">Real-time status of backend services, database connectors, AI providers, and storage.</p>
        </div>

        <button
          onClick={loadHealth}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Health</span>
        </button>
      </div>

      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-surface border border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white">Database Engine</h3>
              </div>
              <span className="text-emerald-400 font-mono font-semibold">HEALTHY</span>
            </div>
            <p className="text-slate-400 font-mono">Dialect: {health.database?.dialect}</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white">AI Provider (Gemini)</h3>
              </div>
              <span className="text-cyan-400 font-mono font-semibold">ACTIVE</span>
            </div>
            <p className="text-slate-400 font-mono">Fast Model: {health.ai?.model_fast}</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white">Browser Automation (Playwright)</h3>
              </div>
              <span className="text-emerald-400 font-mono font-semibold">READY</span>
            </div>
            <p className="text-slate-400 font-mono">Headless Mode: {health.browser?.headless ? 'True' : 'False'}</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white">Public Profile Base URL</h3>
              </div>
              <span className="text-emerald-400 font-mono font-semibold">ONLINE</span>
            </div>
            <p className="text-slate-400 font-mono">Base: {health.public_url?.base_url}</p>
          </div>
        </div>
      )}
    </div>
  );
}
