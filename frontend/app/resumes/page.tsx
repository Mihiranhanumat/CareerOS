'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, CheckCircle2, Download, Printer, 
  Sparkles, Layers, RefreshCw, Send, Check, Eye 
} from 'lucide-react';
import { api } from '@/lib/api';
import ATSValidatorModal from '@/components/ATSValidatorModal';

export default function ResumeStudioPage() {
  const [families, setFamilies] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [selectedFamilySlug, setSelectedFamilySlug] = useState('backend');
  const [customCommand, setCustomCommand] = useState('');
  const [generating, setGenerating] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [famsData, resData] = await Promise.all([
        api.getResumeFamilies(),
        api.getResumes(),
      ]);
      setFamilies(famsData);
      setResumes(resData);
      if (resData.length > 0) {
        setSelectedResume(resData[0]);
      }
    } catch (err) {
      console.error('Failed to load resume studio data', err);
    } finally {
      setLoading(false);
    }
  }

  const handleGenerate = async (familySlug?: string, instruction?: string) => {
    setGenerating(true);
    try {
      const generated = await api.generateResume({
        family_slug: familySlug || selectedFamilySlug,
        custom_instruction: instruction || customCommand,
        one_page_mode: true,
        ats_only_mode: true
      });
      setSelectedResume(generated);
      setResumes([generated, ...resumes]);
      setCustomCommand('');
    } catch (err) {
      alert('Error generating resume: ' + err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Loading ATS Resume Studio...</span>
      </div>
    );
  }

  const content = selectedResume?.content_json || {};
  const header = content.header || {};

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 no-print">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Career Asset Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Resume Studio & ATS Engine</h1>
          <p className="text-xs text-slate-400">
            Synthesizes role-specific resumes backed 100% by verified facts. Zero invented claims.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAuditModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Factuality & ATS</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-glow-emerald transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* 7 RESUME FAMILIES SELECTOR */}
      <div className="space-y-2 no-print">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Select Resume Family (Target Positioning)
        </span>
        <div className="flex flex-wrap gap-2">
          {families.map((fam) => {
            const isSelected = selectedFamilySlug === fam.slug;
            return (
              <button
                key={fam.slug}
                onClick={() => {
                  setSelectedFamilySlug(fam.slug);
                  handleGenerate(fam.slug);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'bg-surface hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {fam.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* NATURAL LANGUAGE REFINEMENT COMMAND BAR */}
      <div className="p-4 rounded-2xl bg-surface border border-slate-700/80 no-print">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate(selectedFamilySlug, customCommand);
          }}
          className="flex items-center gap-3"
        >
          <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Refine resume with commands: 'Prioritize Python and FastAPI', 'Make it one page', 'Move projects above education'..."
            value={customCommand}
            onChange={(e) => setCustomCommand(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={generating}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Tailoring...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Refine</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ATS LIVE PREVIEW CONTAINER */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto space-y-6 font-sans text-sm leading-relaxed ats-print-container border border-slate-200">
        {/* RESUME HEADER */}
        <div className="text-center space-y-1.5 border-b border-slate-300 pb-4">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">{header.name || 'Alex Mercer'}</h1>
          <p className="text-xs font-bold text-slate-700">{header.headline || 'Senior Backend & AI Systems Engineer'}</p>
          <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-slate-600 pt-1">
            <span>{header.location || 'San Francisco, CA'}</span>
            <span>•</span>
            <span>{header.email || 'alex.mercer.eng@gmail.com'}</span>
            <span>•</span>
            <span>{header.phone || '+1 (415) 555-0192'}</span>
            <span>•</span>
            <span className="font-mono">{header.github || 'github.com/alex-mercer-dev'}</span>
            <span>•</span>
            <span className="font-mono">{header.linkedin || 'linkedin.com/in/alex-mercer-ai'}</span>
          </div>
        </div>

        {/* SUMMARY */}
        {content.summary && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">
              Professional Summary
            </h2>
            <p className="text-xs text-slate-800 leading-relaxed pt-1">
              {content.summary}
            </p>
          </div>
        )}

        {/* TECHNICAL SKILLS */}
        {content.skills && (
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">
              Technical Skills
            </h2>
            <div className="space-y-1 text-xs text-slate-800 pt-1">
              {Object.entries(content.skills).map(([category, items]: any, idx) => (
                <div key={idx}>
                  <strong className="text-slate-900">{category}:</strong> {Array.isArray(items) ? items.join(', ') : String(items)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPERIENCE */}
        {content.experience?.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">
              Work Experience
            </h2>
            <div className="space-y-3 pt-1">
              {content.experience.map((exp: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>{exp.title} — {exp.organization}</span>
                    <span className="font-normal text-slate-600">{exp.dates}</span>
                  </div>
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-800">
                    {(exp.bullets || []).map((b: string, bIdx: number) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {content.projects?.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">
              Key Engineering Projects
            </h2>
            <div className="space-y-3 pt-1">
              {content.projects.map((proj: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>{proj.name}</span>
                    <span className="font-normal text-slate-600 font-mono text-[11px]">{proj.stack}</span>
                  </div>
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-800">
                    {(proj.bullets || []).map((b: string, bIdx: number) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION */}
        {content.education && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">
              Education
            </h2>
            <div className="flex justify-between text-xs text-slate-800 pt-1">
              <span className="font-bold text-slate-900">{content.education.institution} — {content.education.degree}</span>
              <span className="text-slate-600">{content.education.year}</span>
            </div>
          </div>
        )}
      </div>

      {/* ATS & FACTUALITY AUDIT MODAL */}
      <ATSValidatorModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        atsReport={selectedResume?.ats_report}
        factualityReport={selectedResume?.factuality_report}
      />
    </div>
  );
}
