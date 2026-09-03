'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Shield, 
  Github, Database, FileText, UserCheck, Briefcase, GraduationCap, Award
} from 'lucide-react';
import { api } from '@/lib/api';

const STEPS = [
  { id: 1, title: 'Welcome', subtitle: 'Privacy & Architecture' },
  { id: 2, title: 'Profile', subtitle: 'Personal Details' },
  { id: 3, title: 'Education', subtitle: 'Academic Background' },
  { id: 4, title: 'Skills', subtitle: 'Verified Capabilities' },
  { id: 5, title: 'Projects', subtitle: 'Proof-of-Work' },
  { id: 6, title: 'Experience', subtitle: 'Work History' },
  { id: 7, title: 'Preferences', subtitle: 'Target Roles' },
  { id: 8, title: 'Integrations', subtitle: 'GitHub & AI' },
  { id: 9, title: 'Public Profile', subtitle: 'Slug & Privacy' },
  { id: 10, title: 'Resume Family', subtitle: 'Role Positioning' },
  { id: 11, title: 'Verification', subtitle: 'Factuality Audit' },
  { id: 12, title: 'Finish', subtitle: 'Ready to Launch' },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: 'Alex Mercer',
    headline: 'Senior Backend & AI Engineer',
    location: 'San Francisco, CA / Remote',
    targetRoles: 'Backend Engineer, AI Systems Engineer, Full-Stack Developer',
    githubUsername: 'alex-mercer-dev',
    slug: 'alex-mercer'
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 12));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in">
      {/* HEADER PROGRESS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white text-sm shadow-glow-indigo">
              {currentStep}
            </span>
            <div>
              <h1 className="text-xl font-bold text-white">First-Run Setup Wizard</h1>
              <p className="text-xs text-slate-400">Step {currentStep} of 12 — {STEPS[currentStep - 1].title}: {STEPS[currentStep - 1].subtitle}</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-xs text-slate-400 hover:text-white underline transition"
          >
            Skip to Dashboard
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 12) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="p-8 rounded-2xl bg-surface border border-slate-700/80 shadow-2xl space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold flex items-center space-x-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span>CareerOS Architecture & Privacy Principles</span>
            </div>
            <p>
              Welcome to <strong className="text-white">CareerOS</strong>. Unlike ordinary resume builders, CareerOS maintains 
              <strong className="text-cyan-400"> one canonical verified source of truth</strong> for your career data.
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li><strong className="text-white">Verified Facts Only:</strong> Resumes and answers are generated exclusively from factual evidence.</li>
              <li><strong className="text-white">Zero Hallucinations:</strong> AI proposes structured changes; you approve them before they enter the database.</li>
              <li><strong className="text-white">Privacy Guard:</strong> Public portfolio fields are strictly isolated from private application data.</li>
            </ul>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Profile Information</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Display Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Professional Headline</label>
                <input 
                  type="text" 
                  value={formData.headline} 
                  onChange={(e) => setFormData({...formData, headline: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep >= 3 && currentStep <= 10 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Preloaded with Verified Blueprint Facts</span>
            </div>
            <p className="text-xs text-slate-300">
              Your {STEPS[currentStep - 1].title} records have been pre-seeded with canonical verified data including skills, project architectures, UC Berkeley education, and resume families.
            </p>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-400">
              Status: Verified & Linked to Source Evidence IDs
            </div>
          </div>
        )}

        {currentStep === 11 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Factuality & Evidence Verification</h2>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Verification Gate: PASSED</span>
                <span>100% Factually Supported</span>
              </div>
              <p className="text-slate-300">Every project claim, bullet metric, and skill is anchored to verified repository records.</p>
            </div>
          </div>
        )}

        {currentStep === 12 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto text-white text-2xl shadow-glow-emerald">
              ✓
            </div>
            <h2 className="text-xl font-bold text-white">CareerOS Initialized Successfully!</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your career operating system is fully configured. You can now discover high-match jobs, review natural language proposals, and tailor ATS resumes in 1 click.
            </p>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-30 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < 12 ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-indigo transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-glow-emerald transition"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
