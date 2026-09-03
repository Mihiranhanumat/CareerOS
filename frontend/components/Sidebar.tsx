'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Database, Github, Target, FileText, 
  SendHorizontal, Mic, BarChart3, Settings, Shield,
  Sparkles, CheckCircle2, PlayCircle, HelpCircle
} from 'lucide-react';

const navItems = [
  { label: 'Executive Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Career Knowledge Base', href: '/career', icon: Database },
  { label: 'Update My Career (AI)', href: '/career/update', icon: Sparkles, badge: 'AI Diff' },
  { label: 'GitHub Intelligence', href: '/github', icon: Github },
  { label: 'Opportunity Inbox', href: '/jobs', icon: Target },
  { label: 'Resume Studio (ATS)', href: '/resumes', icon: FileText, badge: '7 Families' },
  { label: 'Application Tracker', href: '/applications', icon: SendHorizontal },
  { label: 'Browser Assistant Mock', href: '/applications/mock-site', icon: PlayCircle, badge: 'Playground' },
  { label: 'Interview Center', href: '/interview', icon: Mic },
  { label: 'Career Analytics', href: '/analytics', icon: BarChart3 },
];

const settingsItems = [
  { label: 'Credentials & Setup', href: '/settings/credentials', icon: Settings },
  { label: 'System Health Check', href: '/settings/system-health', icon: CheckCircle2 },
  { label: 'Privacy & Visibility', href: '/settings/privacy', icon: Shield },
  { label: 'Backup & CSV Export', href: '/settings/backup', icon: Database },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#090d17] flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && item.href !== '/career/update');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition duration-150 ${
                    isActive 
                      ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/30 shadow-glow-indigo font-semibold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            System & Settings
          </div>
          <nav className="space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition duration-150 ${
                    isActive 
                      ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/30 font-semibold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Safety & Source of Truth Status Footer */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Career Brain Active</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">100% Verified</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-500">
          Strict factuality enforced. No unapproved AI hallucinations.
        </p>
      </div>
    </aside>
  );
}
