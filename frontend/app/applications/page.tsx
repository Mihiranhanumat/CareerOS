'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  SendHorizontal, Clock, CheckCircle2, ShieldAlert, 
  ArrowRight, ExternalLink, Sparkles, Filter, Building2, MapPin 
} from 'lucide-react';
import { api } from '@/lib/api';

const STATUS_COLUMNS = [
  { id: 'AWAITING_APPROVAL', label: 'Awaiting Approval', color: 'border-indigo-500/40 text-indigo-300' },
  { id: 'RESUME_READY', label: 'Resume Ready', color: 'border-cyan-500/40 text-cyan-300' },
  { id: 'WAITING_FOR_USER', label: 'Checkpoint Paused', color: 'border-amber-500/40 text-amber-300' },
  { id: 'SUBMITTED', label: 'Submitted', color: 'border-emerald-500/40 text-emerald-300' },
  { id: 'INTERVIEW', label: 'Interviewing', color: 'border-purple-500/40 text-purple-300' },
  { id: 'OFFER', label: 'Offer Received', color: 'border-teal-500/40 text-teal-300' },
];

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  useEffect(() => {
    async function loadData() {
      try {
        const [appsData, jobsData] = await Promise.all([
          api.getApplications(),
          api.getJobs(),
        ]);
        setApplications(appsData);
        setJobs(jobsData);
      } catch (err) {
        console.error('Failed to load applications', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getJobForApp = (jobId: string) => jobs.find(j => j.id === jobId) || { company: 'Stripe', title: 'Backend Software Engineer' };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Loading Application State Machine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <SendHorizontal className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">17-State Lifecycle Tracker</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Application Tracker & History</h1>
          <p className="text-xs text-slate-400">
            Immutable application records, generated answer histories, checkpoint audits, and timeline events.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'bg-surface text-slate-400'
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-surface text-slate-400'
            }`}
          >
            History Table
          </button>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => {
            const colApps = applications.filter(a => a.status === col.id);
            return (
              <div key={col.id} className="p-3 rounded-2xl bg-surface/80 border border-slate-800 space-y-3 min-w-[200px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                  <span className="text-xs font-mono font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colApps.map((app) => {
                    const job = getJobForApp(app.job_id);
                    return (
                      <Link
                        key={app.id}
                        href={`/applications/${app.id}`}
                        className="block p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 transition space-y-2 glass-panel-hover"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase text-indigo-400">{job.company}</span>
                          <h4 className="text-xs font-bold text-white leading-tight mt-0.5">{job.title}</h4>
                        </div>

                        {app.status === 'WAITING_FOR_USER' && (
                          <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-semibold flex items-center space-x-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Action Paused</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                          <span>{app.source}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </div>
                      </Link>
                    );
                  })}
                  {colApps.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-slate-600 border border-dashed border-slate-800 rounded-xl">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-surface border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="p-4">Company & Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Source</th>
                <th className="p-4">Next Action</th>
                <th className="p-4">Timeline</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {applications.map((app) => {
                const job = getJobForApp(app.job_id);
                return (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <span className="font-bold text-white">{job.company}</span>
                      <p className="text-slate-400">{job.title}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full font-mono text-[11px] font-bold bg-indigo-500/10 text-cyan-300 border border-indigo-500/30">
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{app.source}</td>
                    <td className="p-4 text-slate-300">{app.next_action || 'None'}</td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{app.events?.length || 1} events</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/applications/${app.id}`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
