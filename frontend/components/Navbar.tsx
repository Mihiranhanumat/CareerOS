'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, ExternalLink, ShieldCheck, Cpu, 
  Layers, User, LogOut, LogIn
} from 'lucide-react';
import { getStoredUser, clearAuthSession } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0c101d]/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-primary-500 to-cyan-400 p-0.5 shadow-glow-indigo transition group-hover:scale-105">
            <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-white tracking-tight">Career<span className="text-cyan-400">OS</span></span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI PLATFORM</span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1">Verified Career Operating System</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-3">
        <Link 
          href="/alex-mercer" 
          target="_blank"
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Live Public Portfolio</span>
        </Link>

        <Link 
          href="/career/update" 
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-glow-indigo transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Update My Career</span>
        </Link>

        {user ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs">
              {user.full_name?.slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-white leading-tight">{user.full_name}</p>
              <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
