'use client';

import React, { useState, useEffect } from 'react';
import { 
  Github, RefreshCw, CheckCircle2, ShieldCheck, 
  ExternalLink, Code, Star, GitFork, Check, Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';

export default function GithubIntelligencePage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [usernameInput, setUsernameInput] = useState('alex-mercer-dev');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [accData, repoData] = await Promise.all([
        api.getGithubAccounts(),
        api.getGithubRepositories(),
      ]);
      setAccounts(accData);
      setRepositories(repoData);
    } catch (err) {
      console.error('Failed to load GitHub intelligence', err);
    } finally {
      setLoading(false);
    }
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setSyncing(true);
    try {
      await api.connectGithub(usernameInput);
      await loadData();
    } catch (err) {
      alert('Error connecting GitHub account: ' + err);
    } finally {
      setSyncing(false);
    }
  };

  const handleApproveEvidence = async (evidenceId: string) => {
    try {
      await api.approveGithubEvidence(evidenceId, true);
      await loadData();
    } catch (err) {
      alert('Error approving evidence: ' + err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Analyzing GitHub Repository Structures...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Github className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Code Proof-of-Work</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">GitHub Intelligence</h1>
          <p className="text-xs text-slate-400">
            Inspects authorized repositories, dependency manifests, and architecture endpoints. Contextual evidence is proposed for your review before becoming verified skills.
          </p>
        </div>

        {/* CONNECT / SYNC FORM */}
        <form onSubmit={handleConnect} className="flex items-center space-x-2">
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="GitHub username"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={syncing}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-glow-indigo transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Analyzing...' : 'Sync Repos'}</span>
          </button>
        </form>
      </div>

      {/* CONNECTED ACCOUNTS BANNER */}
      {accounts.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <Github className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="font-bold text-white">Connected Account: @{accounts[0].username}</span>
              <p className="text-slate-400">Synced {repositories.length} repositories with active codebase evidence analysis.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-500/30">
            ● Active OAuth/API Session
          </span>
        </div>
      )}

      {/* REPOSITORIES & EXTRACTED EVIDENCE */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-white">Analyzed Repositories ({repositories.length})</h2>

        <div className="grid grid-cols-1 gap-6">
          {repositories.map((repo) => (
            <div key={repo.id} className="p-6 rounded-2xl bg-surface border border-slate-700/80 glass-panel-hover space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-white">{repo.name}</h3>
                    <a href={repo.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{repo.description}</p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center space-x-1">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{repo.language || 'Python'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>{repo.stars || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <GitFork className="w-3.5 h-3.5 text-slate-400" />
                    <span>{repo.forks || 0}</span>
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        await api.importRepoAsProject(repo.id);
                        alert(`Successfully imported "${repo.name}" into Career Projects!`);
                      } catch (e) {
                        alert(`Error importing repo: ${e}`);
                      }
                    }}
                    className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-cyan-300 border border-indigo-500/40 rounded-lg text-xs font-semibold font-sans transition"
                  >
                    + Import as Career Project
                  </button>
                </div>
              </div>

              {/* CONTEXTUAL EVIDENCE PROPOSALS */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Extracted Implementation Evidence
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Rule: Dependencies alone are not proof without usage</span>
                </div>

                <div className="space-y-2">
                  {(repo.evidence || []).map((ev: any) => (
                    <div key={ev.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{ev.detected_skill}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">{ev.evidence_type}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{ev.source_path}</span>
                        </div>
                        <p className="text-xs text-slate-300">{ev.evidence_text}</p>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {ev.proposal_status === 'approved' ? (
                          <span className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Verified in DB</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApproveEvidence(ev.id)}
                            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve as Skill</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
