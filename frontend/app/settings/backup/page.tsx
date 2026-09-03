'use client';

import React, { useState } from 'react';
import { Database, Download, FileSpreadsheet, FileJson, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

export default function BackupExportPage() {
  const [downloadingJson, setDownloadingJson] = useState(false);

  const handleDownloadJson = async () => {
    setDownloadingJson(true);
    try {
      const data = await api.exportJsonBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careeros_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch (err) {
      alert('Failed to export JSON backup: ' + err);
    } finally {
      setDownloadingJson(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Database className="w-4 h-4" />
          </span>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Data Portability</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">Backup & Data Exports</h1>
        <p className="text-xs text-slate-400">
          Full data ownership. Download your canonical profile, verified skills, and application histories in JSON and CSV format anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FULL JSON BACKUP */}
        <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4 glass-panel-hover flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 w-fit">
              <FileJson className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Full JSON Backup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete snapshot of all 26+ tables including verified skills, projects, experience, applications, and settings.
            </p>
          </div>

          <button
            onClick={handleDownloadJson}
            disabled={downloadingJson}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow-indigo transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingJson ? 'Generating JSON...' : 'Download JSON Backup'}</span>
          </button>
        </div>

        {/* APPLICATIONS CSV */}
        <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4 glass-panel-hover flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 w-fit">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Applications CSV</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Excel-compatible spreadsheet containing application lifecycles, applied dates, interview timelines, and next actions.
            </p>
          </div>

          <a
            href={api.getApplicationsCsvUrl()}
            download="careeros_applications.csv"
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-glow-cyan transition flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Applications CSV</span>
          </a>
        </div>

        {/* SKILLS & EVIDENCE CSV */}
        <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4 glass-panel-hover flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Skills & Evidence CSV</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export of verified skills, proficiency tiers, normalized IDs, and supporting repository evidence links.
            </p>
          </div>

          <a
            href={api.getSkillsCsvUrl()}
            download="careeros_skills.csv"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-emerald transition flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Skills CSV</span>
          </a>
        </div>
      </div>
    </div>
  );
}
