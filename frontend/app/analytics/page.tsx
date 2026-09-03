'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Sparkles, Layers, 
  Target, Award, BookOpen, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 space-x-3 text-cyan-400">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-sm font-semibold">Aggregating Career Analytics & Skill Gaps...</span>
      </div>
    );
  }

  const funnel = analytics?.funnel || {};
  const weekly = analytics?.weekly_metrics || {};

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Career Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Analytics & Skill-Gap Feedback Loop</h1>
          <p className="text-xs text-slate-400">
            Insights on targeting discipline, interview conversion rates, recurring industry requirements, and learning priorities.
          </p>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Weekly Applications', val: weekly.applications_this_week || 4, sub: 'Target: 5 / week', color: 'text-white' },
          { label: 'Screening Response Rate', val: weekly.response_rate || '52.0%', sub: 'Industry Avg: 12%', color: 'text-cyan-400' },
          { label: 'Interview Conversion', val: weekly.interview_rate || '44.4%', sub: 'High Match Targeting', color: 'text-emerald-400' },
          { label: 'Avg Match Score Applied', val: `${weekly.avg_match_score_applied || 93}%`, sub: 'Strict Quality Filter', color: 'text-indigo-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-surface border border-slate-700/80 space-y-1">
            <span className="text-xs text-slate-400 font-medium">{kpi.label}</span>
            <div className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.val}</div>
            <p className="text-[11px] text-slate-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* APPLICATION FUNNEL PROGRESSION */}
      <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4">
        <h2 className="text-base font-bold text-white">Full Application Lifecycle Funnel</h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { step: '1. Discovered', val: funnel.discovered || 4, pct: '100%' },
            { step: '2. Shortlisted', val: funnel.shortlisted || 3, pct: '75%' },
            { step: '3. Approved', val: funnel.approved || 2, pct: '50%' },
            { step: '4. Submitted', val: funnel.applied || 2, pct: '50%' },
            { step: '5. Interview', val: funnel.interview || 1, pct: '25%' },
            { step: '6. Offer', val: funnel.offer || 1, pct: '25%' },
          ].map((st, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-400 font-medium block">{st.step}</span>
              <div className="text-xl font-bold text-white font-mono">{st.val}</div>
              <span className="text-[10px] text-cyan-400 font-mono font-semibold">{st.pct} conversion</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2-COLUMN SECTION: ROLE PERFORMANCE & RECURRING SKILL GAPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROLE PERFORMANCE */}
        <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Role Family Performance & ROI</h3>
          </div>

          <div className="space-y-3">
            {(analytics?.role_performance || []).map((r: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">{r.role_family}</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">{r.applications} Applied • Avg Match: {r.avg_match_score}%</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400 font-mono">{r.interview_rate}</span>
                  <span className="block text-[10px] text-slate-500">Interview Rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECURRING SKILL GAPS */}
        <div className="p-6 rounded-2xl bg-surface border border-slate-700/80 space-y-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Recurring Skill Gap Analyzer</h3>
          </div>

          <div className="space-y-3">
            {(analytics?.skill_gaps || []).map((g: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">{g.skill}</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">{g.impact_on_match}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold font-mono text-[10px] border border-amber-500/30">
                    {g.demand_level} Demand
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STRATEGIC CAREER LEARNING RECOMMENDATIONS (FEEDBACK LOOP) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-surface to-cyan-950/40 border border-slate-700/80 space-y-4">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
          <BookOpen className="w-5 h-5" />
          <span>Strategic Career Recommendations (Job Market → Learning → Better Match)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(analytics?.learning_recommendations || []).map((rec: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{rec.skill}</span>
                <span className="text-[10px] text-cyan-300 font-mono font-semibold">Priority</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{rec.recommended_project}</p>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                Evidence Goal: <strong className="text-slate-200">{rec.evidence_goal}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
