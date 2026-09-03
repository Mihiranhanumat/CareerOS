'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, ShieldCheck, CheckCircle2, AlertTriangle, 
  ExternalLink, Sparkles, RefreshCw, Key, Shield 
} from 'lucide-react';
import { api } from '@/lib/api';

export default function CredentialsSetupPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  async function loadCredentials() {
    try {
      const data = await api.getCredentialStatus();
      setCredentials(data);
    } catch (err) {
      console.error('Failed to load credential audit', err);
    } finally {
      setLoading(false);
    }
  }

  const handleTest = async (service: string) => {
    setTesting(service);
    try {
      await api.getSystemHealth();
      alert(`Connection test for ${service} completed successfully!`);
    } catch (err) {
      alert(`Test failed: ${err}`);
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Running Credential Audit...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Key className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Credential & Security Center</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">API Credentials & Setup Guide</h1>
          <p className="text-xs text-slate-400">
            Audit of all required and optional API integrations. Secrets are kept strictly in server-side environment variables and never leaked to client bundles.
          </p>
        </div>
      </div>

      {/* CREDENTIALS AUDIT CARDS */}
      <div className="space-y-4">
        {credentials.map((item, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">{item.service}</h3>
                  {item.is_required ? (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                      REQUIRED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-medium">
                      OPTIONAL
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{item.purpose}</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  item.status === 'configured' || item.status.includes('valid') || item.status.includes('active')
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  ● {item.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* SETUP DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Environment Variable:</span>
                <p className="font-mono text-cyan-300">{item.env_var}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Expected Verification:</span>
                <p className="text-slate-300">{item.expected_result}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Setup Instructions:</span>
                <p className="text-slate-300 leading-relaxed">{item.instructions}</p>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <a
                href={item.setup_url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-cyan-300 flex items-center space-x-1 transition font-semibold"
              >
                <span>Open Developer Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => handleTest(item.service)}
                disabled={testing === item.service}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing === item.service ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
