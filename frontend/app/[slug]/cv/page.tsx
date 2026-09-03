'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function PublicCvPage({ params }: { params: { slug: string } }) {
  const [cvData, setCvData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCv() {
      try {
        const data = await api.getPublicCv(params.slug);
        setCvData(data);
      } catch (err) {
        console.error('Failed to load public CV', err);
      } finally {
        setLoading(false);
      }
    }
    loadCv();
  }, [params.slug]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center space-x-3 text-slate-800">
        <Sparkles className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="text-sm font-semibold">Rendering Verified ATS CV...</span>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Public CV not enabled or found.
      </div>
    );
  }

  const content = cvData.content || {};
  const header = content.header || {};

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans selection:bg-indigo-500 selection:text-white">
      {/* FLOATING ACTION BAR (HIDDEN IN PRINT) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print">
        <Link
          href={`/${params.slug}`}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow border border-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </Link>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* ATS CV CONTAINER */}
      <div className="bg-white text-slate-900 rounded-2xl p-10 md:p-14 shadow-xl max-w-4xl mx-auto space-y-6 text-sm leading-relaxed ats-print-container border border-slate-200">
        {/* HEADER */}
        <div className="text-center space-y-1.5 border-b border-slate-300 pb-4">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">{header.name}</h1>
          <p className="text-xs font-bold text-slate-700">{header.headline}</p>
          <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-slate-600 pt-1">
            <span>{header.location}</span>
            <span>•</span>
            <span>{header.email}</span>
            <span>•</span>
            <span className="font-mono">{header.github}</span>
            <span>•</span>
            <span className="font-mono">{header.linkedin}</span>
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

        {/* SKILLS */}
        {content.skills && (
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">
              Technical Skills
            </h2>
            <div className="space-y-1 text-xs text-slate-800 pt-1">
              {Object.entries(content.skills).map(([cat, items]: any, idx) => (
                <div key={idx}>
                  <strong className="text-slate-900">{cat}:</strong> {Array.isArray(items) ? items.join(', ') : String(items)}
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
              Engineering Projects
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
    </div>
  );
}
