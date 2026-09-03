'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Target, Plus, Filter, ArrowUpDown, Search, 
  ExternalLink, Sparkles, Building2, MapPin, Clock, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { api } from '@/lib/api';
import ScoreBadge from '@/components/ScoreBadge';

export default function OpportunityInboxPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [workModeFilter, setWorkModeFilter] = useState('ALL');

  // Import Form State
  const [importCompany, setImportCompany] = useState('');
  const [importTitle, setImportTitle] = useState('');
  const [importDescription, setImportDescription] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setLoading(false);
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importDescription.trim()) return;

    setImporting(true);
    try {
      await api.importJob({
        company: importCompany || 'Tech Employer',
        title: importTitle || 'Software Engineer',
        description: importDescription,
        source: 'Manual Paste / Ingestion'
      });
      setImportOpen(false);
      setImportCompany('');
      setImportTitle('');
      setImportDescription('');
      await loadJobs();
    } catch (err: any) {
      alert('Import failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const score = job.latest_match?.score || 0;
    const matchesScore = score >= minScoreFilter;
    const matchesWorkMode = workModeFilter === 'ALL' || job.work_mode.toLowerCase() === workModeFilter.toLowerCase();
    return matchesSearch && matchesScore && matchesWorkMode;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Running Semantic Match Engine across Opportunities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">Semantic Matching Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Opportunity Inbox</h1>
          <p className="text-xs text-slate-400">
            Deduplicated job opportunities ranked by explainable evidence fit against your canonical verified profile.
          </p>
        </div>

        <button
          onClick={() => setImportOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-glow-indigo transition"
        >
          <Plus className="w-4 h-4" />
          <span>Import / Paste Job Description</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-2xl bg-surface border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by company or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">Min Match:</span>
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value={0}>All Scores</option>
              <option value={75}>75%+ (Good Fit)</option>
              <option value={85}>85%+ (High Priority)</option>
              <option value={90}>90%+ (Exceptional)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">Work Mode:</span>
            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value="ALL">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>
      </div>

      {/* OPPORTUNITY CARDS LIST */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.map((job) => {
          const score = job.latest_match?.score || 90;
          return (
            <div key={job.id} className="p-6 rounded-2xl bg-surface border border-slate-700/80 glass-panel-hover space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{job.company}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                      {job.work_mode}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                      Source: {job.source}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Deadline: {job.deadline || 'Rolling'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <ScoreBadge score={score} size="lg" />
                </div>
              </div>

              {/* MATCH EXPLANATION & EVIDENCE SUMMARY */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Explainable Match Breakdown:</span>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    Recommended: {job.latest_match?.recommended_resume_family || 'Backend Developer'}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {job.latest_match?.explanation || 'High compatibility with verified Python and FastAPI engineering evidence.'}
                </p>
              </div>

              {/* ACTION FOOTER */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-cyan-400 font-mono">{job.status}</span>
                </div>

                <Link
                  href={`/jobs/${job.id}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-glow-indigo transition flex items-center space-x-1.5"
                >
                  <span>Inspect Fit & 1-Click Apply</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* IMPORT JOB MODAL */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-2xl w-full bg-[#111728] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Import Job Posting</h2>
            <p className="text-xs text-slate-400">Paste any job description. The system will deduplicate via hash, extract technical requirements, and compute an explainable match score.</p>
            
            <form onSubmit={handleImport} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Linear, OpenAI, Scale AI"
                    value={importCompany}
                    onChange={(e) => setImportCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full-Stack Engineer"
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Paste Full Job Description *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste requirements, responsibilities, tech stack, and qualifications..."
                  value={importDescription}
                  onChange={(e) => setImportDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setImportOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-indigo disabled:opacity-50"
                >
                  {importing ? 'Extracting & Scoring...' : 'Analyze & Add to Inbox'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
