import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import logoSvg from '../../assets/logo.svg';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-brand-cyan/20 selection:text-brand-cyan">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-violet/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5 text-xs text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Public Overview</span>
        </Link>

        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500/20 to-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center p-1">
            <img src={logoSvg} alt="OutbreakIQ" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-base text-white">
            Outbreak<span className="text-brand-cyan">IQ</span>
          </span>
        </Link>
      </header>

      {/* Center Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children || <Outlet />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400 border-t border-white/5">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Authorized Public Health Personnel & Epidemiological Triage Only</span>
        </div>
      </footer>
    </div>
  );
};
